#!/usr/bin/env node
// Safe Deal verification CLI. See ../SKILL.md.
//   sd.mjs build            production build into .tmp/verify-safe-deal/build
//   sd.mjs doctor           read-only health check
//   sd.mjs run <journey>    one disposable browser, one journey, evidence under .tmp/verify-safe-deal/runs
//   sd.mjs cleanup          remove browsers and scratch left by interrupted runs, keep evidence
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
  BUILD_DIR, BUILD_STAMP, CHROME_MANIFEST, PUBLIC_MANIFEST, REPO_ROOT, RUNS_DIR, STATE_DIR,
  buildStatus, packageVersion, readJson
} from "./lib/paths.mjs";

const git = (...args) => execFileSync("git", args, { cwd: REPO_ROOT, encoding: "utf8" }).trim();

const isAlive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

const processesUsing = (needle) =>
  execFileSync("ps", ["-axww", "-o", "pid=,command="], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 })
    .split("\n")
    .filter((line) => line.includes(needle))
    .map((line) => Number(line.trim().split(/\s+/)[0]));

const scratchRuns = () =>
  (fs.existsSync(RUNS_DIR) ? fs.readdirSync(RUNS_DIR) : [])
    .map((id) => ({ id, workDir: path.join(RUNS_DIR, id, "work") }))
    .filter(({ workDir }) => fs.existsSync(workDir))
    .map((run) => {
      const ownerFile = path.join(run.workDir, "owner.json");
      const owner = fs.existsSync(ownerFile) ? readJson(ownerFile) : {};
      return { ...run, ...owner, live: Boolean(owner.pid) && isAlive(owner.pid) };
    });

const build = () => {
  if (!fs.existsSync(PUBLIC_MANIFEST)) fs.copyFileSync(CHROME_MANIFEST, PUBLIC_MANIFEST);
  if (readJson(PUBLIC_MANIFEST).manifest_version !== 3) {
    console.error(`${PUBLIC_MANIFEST} is not manifest v3. A Firefox dev session (yarn dev:ff) owns it. Stop that session first.`);
    return 1;
  }
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.rmSync(BUILD_STAMP, { force: true });
  const startedAtMs = Date.now();
  const commit = git("rev-parse", "--short", "HEAD");
  const branch = git("rev-parse", "--abbrev-ref", "HEAD");
  const webpack = path.join(REPO_ROOT, "node_modules/.bin/webpack");
  const result = spawnSync(webpack, ["--config", "webpack/webpack.prod.js", "--output-path", BUILD_DIR], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024
  });
  const summary = `${result.stdout ?? ""}`.trim().split("\n").at(-1);
  if (result.status !== 0) {
    console.error(`${result.stdout}\n${result.stderr}`);
    return result.status ?? 1;
  }
  fs.writeFileSync(
    BUILD_STAMP,
    JSON.stringify({ startedAtMs, commit, branch, version: packageVersion() }, null, 2)
  );
  console.log(`BUILD READY ${path.relative(REPO_ROOT, BUILD_DIR)} (${summary})`);
  return 0;
};

const doctor = async () => {
  const { chromium } = await import("@playwright/test");
  const checks = [];
  const check = (name, ok, detail) => checks.push({ name, ok, detail });

  const chromiumPath = chromium.executablePath();
  check("playwright-chromium", fs.existsSync(chromiumPath), chromiumPath);
  check("env-file", fs.existsSync(path.join(REPO_ROOT, ".env")), ".env is present (values not read)");

  const status = buildStatus();
  check("build-fresh", status.ok, status.ok ? `${status.stamp.branch} at ${status.stamp.commit}` : status.reason);
  if (fs.existsSync(path.join(BUILD_DIR, "manifest.json"))) {
    const manifest = readJson(path.join(BUILD_DIR, "manifest.json"));
    check("build-manifest-v3", manifest.manifest_version === 3, `manifest v${manifest.manifest_version}`);
    check("build-version", manifest.version === packageVersion(), `build ${manifest.version}, package ${packageVersion()}`);
  }

  const amazon = await fetch("https://www.amazon.com/robots.txt", { signal: AbortSignal.timeout(8000) })
    .then((response) => ({ ok: response.ok, detail: `HTTP ${response.status}` }))
    .catch((error) => ({ ok: false, detail: String(error.cause ?? error) }));
  check("live-lane-network", amazon.ok, `amazon.com ${amazon.detail}. Only the live journeys need this.`);

  const runs = scratchRuns();
  check("no-abandoned-runs", runs.every((run) => run.live), runs.filter((run) => !run.live).map((run) => run.id).join(", ") || "none. Fix with: sd.mjs cleanup");

  const watchers = processesUsing("webpack.dev.js").length + processesUsing("webpack -w").length;
  console.log(`INFO  a developer webpack watcher ${watchers ? "IS" : "is not"} running. It owns dist/ and port 9090. This harness uses neither.`);
  console.log(`INFO  live verification runs: ${runs.filter((run) => run.live).map((run) => run.id).join(", ") || "none"}`);
  for (const { name, ok, detail } of checks) console.log(`${ok ? "OK  " : "FAIL"}  ${name}: ${detail}`);
  return checks.every(({ ok }) => ok) ? 0 : 1;
};

const cleanup = () => {
  for (const run of scratchRuns()) {
    if (run.live) {
      console.log(`SKIP  ${run.id}: its harness (pid ${run.pid}) is still running`);
      continue;
    }
    for (const pid of run.profileDir ? processesUsing(run.profileDir) : []) {
      if (pid !== process.pid) process.kill(pid, "SIGKILL");
    }
    fs.rmSync(run.workDir, { recursive: true, force: true });
    console.log(`CLEANED  ${run.id} (evidence kept at ${path.relative(REPO_ROOT, path.join(RUNS_DIR, run.id, "evidence"))})`);
  }
  return 0;
};

const [command, ...args] = process.argv.slice(2);
const commands = {
  build,
  doctor,
  cleanup,
  run: async () => {
    const { runJourney } = await import("./lib/runner.mjs");
    const [journey] = args;
    if (!journey) throw new Error("Usage: sd.mjs run <journey-name-or-path>");
    return runJourney(journey);
  }
};

if (!commands[command]) {
  console.error("Usage: sd.mjs build | doctor | run <journey> | cleanup");
  process.exit(2);
}
process.exit(await commands[command]());
