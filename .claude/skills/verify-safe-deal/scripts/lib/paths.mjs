import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPTS_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

export const JOURNEYS_DIR = path.join(SCRIPTS_DIR, "journeys");
export const REPO_ROOT = path.resolve(SCRIPTS_DIR, "../../../..");
export const STATE_DIR = path.join(REPO_ROOT, ".tmp/verify-safe-deal");
export const BUILD_DIR = path.join(STATE_DIR, "build");
export const BUILD_STAMP = path.join(STATE_DIR, "build-stamp.json");
export const RUNS_DIR = path.join(STATE_DIR, "runs");
export const PUBLIC_MANIFEST = path.join(REPO_ROOT, "src/browser-extension/public/manifest.json");
export const CHROME_MANIFEST = path.join(REPO_ROOT, "webpack/manifest_v3/manifest.json");

export const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
export const packageVersion = () => readJson(path.join(REPO_ROOT, "package.json")).version;

const isGeneratedInput = (file) => file === PUBLIC_MANIFEST || path.basename(file) === ".DS_Store";

const newestInput = (entry) => {
  const stat = fs.statSync(entry);
  if (!stat.isDirectory()) return isGeneratedInput(entry) ? 0 : stat.mtimeMs;
  return Math.max(0, ...fs.readdirSync(entry).map((name) => newestInput(path.join(entry, name))));
};

export const newestSourceTime = () =>
  Math.max(...["src", "webpack", "package.json", ".env"].map((name) => path.join(REPO_ROOT, name)).filter(fs.existsSync).map(newestInput));

export const buildStatus = () => {
  if (!fs.existsSync(BUILD_STAMP) || !fs.existsSync(path.join(BUILD_DIR, "manifest.json"))) {
    return { ok: false, reason: "no build yet" };
  }
  const stamp = readJson(BUILD_STAMP);
  if (newestSourceTime() > stamp.startedAtMs) return { ok: false, reason: "sources changed since the last build", stamp };
  return { ok: true, stamp };
};
