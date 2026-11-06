// One verification run: copy the build, start the guard, launch Chromium, close the install tab,
// drive one journey, write evidence, tear down what this run started.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { startGuard } from "./guard.mjs";
import { BUILD_DIR, JOURNEYS_DIR, REPO_ROOT, RUNS_DIR, readJson, buildStatus, packageVersion } from "./paths.mjs";

const JOURNEY_TIMEOUT_MS = 240_000;
const INSTALL_TAB_TIMEOUT_MS = 15_000;
const SW_READY_TIMEOUT_MS = 15_000;
const VIEWPORT = { width: 1440, height: 900 };

const API = "https://api.joinsafedeal.com";
const SUPPRESSED_API_PATHS = /^https:\/\/api\.joinsafedeal\.com\/(get|start|goodbye)(\/|\?|$)/;
const ERROR_REPORT = /^https:\/\/api\.joinsafedeal\.com\/error(\/|\?|$)/;
const AFFILIATE_CLICK = /^https:\/\/const\.joinsafedeal\.com\/ads\//;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runId = (name) => {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..*/, "");
  return `${name}-${stamp}-${Math.random().toString(36).slice(2, 6)}`;
};

const affiliateHostsFrom = (extDir) => {
  const hosts = new Set();
  for (const { shutaf } of readJson(path.join(extDir, "shutaf/shutafim.json"))) {
    if (shutaf?.startsWith("http")) hosts.add(new URL(shutaf).hostname);
  }
  return hosts;
};

const resolveJourney = (journey) =>
  fs.existsSync(journey) ? path.resolve(journey) : path.join(JOURNEYS_DIR, `${journey}.mjs`);

export const runJourney = async (journey) => {
  const journeyPath = resolveJourney(journey);
  if (!fs.existsSync(journeyPath)) throw new Error(`No journey at ${journeyPath}`);
  const build = buildStatus();
  if (!build.ok) {
    console.error(`Build not usable: ${build.reason}. Run: node .claude/skills/verify-safe-deal/scripts/sd.mjs build`);
    return 2;
  }

  // Playwright reads this when it launches. Without it service-worker requests skip every route.
  process.env.PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS = "1";
  const { chromium, expect } = await import("@playwright/test");

  const id = runId(path.basename(journeyPath, ".mjs"));
  const runDir = path.join(RUNS_DIR, id);
  const evidenceDir = path.join(runDir, "evidence");
  const workDir = path.join(runDir, "work");
  const extDir = path.join(workDir, "ext");
  const profileDir = path.join(workDir, "profile");
  fs.mkdirSync(evidenceDir, { recursive: true });
  fs.mkdirSync(profileDir, { recursive: true });
  fs.cpSync(BUILD_DIR, extDir, { recursive: true });
  fs.writeFileSync(path.join(workDir, "owner.json"), JSON.stringify({ pid: process.pid, profileDir }));

  const appender = (file) => (entry) => fs.appendFileSync(path.join(evidenceDir, file), `${JSON.stringify(entry)}\n`);
  const appendGuard = appender("guard.jsonl");
  const recordNetwork = appender("service-worker-network.jsonl");
  const recordConsole = appender("console-errors.jsonl");
  const recordStep = appender("steps.jsonl");
  const guardEvents = [];
  const recordGuard = (entry) => {
    guardEvents.push(entry);
    appendGuard(entry);
  };
  const guardHit = (kind, url, extra = {}) => recordGuard({ at: new Date().toISOString(), layer: "route", kind, url, ...extra });

  const guard = await startGuard({ deniedHosts: affiliateHostsFrom(extDir), record: ({ decision, ...entry }) => recordGuard({ ...entry, kind: `proxy-${decision}` }) });
  const report = { id, journey: path.basename(journeyPath), status: "FAIL", build: build.stamp, boot: {}, steps: [], observations: {} };
  let context = null;
  let cdpBrowser = null;
  let failure = null;

  const served = [];
  const affiliateLinksFromApi = new Set();
  let offline = false;
  const matches = (matcher, url) => (matcher instanceof RegExp ? matcher.test(url) : matcher === url);

  const dispatch = async (route) => {
    const request = route.request();
    const url = request.url();
    const fromExtensionWorker = request.serviceWorker()?.url().startsWith("chrome-extension://") ?? false;
    let disposition = "passed";
    if (SUPPRESSED_API_PATHS.test(url)) {
      disposition = "blocked";
      guardHit("install-or-uninstall-page", url);
      await route.abort();
    } else if (ERROR_REPORT.test(url)) {
      disposition = "blocked";
      guardHit("error-report", url, { body: request.postData() });
      await route.fulfill({ status: 204 });
    } else if (AFFILIATE_CLICK.test(url)) {
      disposition = "blocked";
      guardHit("affiliate-click", url, { target: decodeURIComponent(new URL(url).searchParams.get("url") ?? "") });
      await route.abort();
    } else if (guard.isDeniedHost(new URL(url).hostname) || affiliateLinksFromApi.has(url)) {
      disposition = "blocked";
      guardHit("affiliate-host", url);
      await route.abort();
    } else {
      const fixture = served.find(([matcher]) => matches(matcher, url));
      if (fixture) {
        disposition = "fixture";
        const { html, json, status = 200 } = fixture[1];
        await (html !== undefined
          ? route.fulfill({ status, contentType: "text/html; charset=utf-8", body: html })
          : route.fulfill({ status, contentType: "application/json", body: JSON.stringify(json) }));
      } else if (offline) {
        disposition = "offline-aborted";
        await route.abort();
      } else {
        await route.continue();
      }
    }
    if (fromExtensionWorker) recordNetwork({ at: new Date().toISOString(), method: request.method(), url, disposition });
  };

  const closeInstallTab = async () => {
    const deadline = Date.now() + INSTALL_TAB_TIMEOUT_MS;
    while (Date.now() < deadline) {
      const tab = context.pages().find((p) => p.url().startsWith("chrome-error:") || p.url().startsWith(`${API}/get`));
      if (tab) {
        const url = tab.url();
        await tab.close();
        return url;
      }
      await sleep(100);
    }
    return null;
  };

  const waitForServiceWorker = async () => {
    const worker = context.serviceWorkers().find((w) => w.url().endsWith("/scripts/service_worker.js"))
      ?? (await context.waitForEvent("serviceworker", { timeout: SW_READY_TIMEOUT_MS }));
    const deadline = Date.now() + SW_READY_TIMEOUT_MS;
    while (Date.now() < deadline) {
      // The worker exposes `chrome` without extension APIs until it finishes starting.
      const manifest = await worker.evaluate(() => globalThis.chrome?.runtime?.getManifest?.() ?? null).catch(() => null);
      if (manifest) return { worker, manifest };
      await sleep(200);
    }
    throw new Error("Service worker never exposed chrome.runtime");
  };

  const finish = async () => {
    await cdpBrowser?.close().catch(() => {});
    await context?.close().catch(() => {});
    await guard.close();
    fs.rmSync(workDir, { recursive: true, force: true });
  };

  const onSignal = async () => {
    await finish();
    process.exit(130);
  };
  process.once("SIGINT", onSignal);
  process.once("SIGTERM", onSignal);

  try {
    context = await chromium.launchPersistentContext(profileDir, {
      headless: false,
      viewport: VIEWPORT,
      args: [
        "--headless=new",
        `--disable-extensions-except=${extDir}`,
        `--load-extension=${extDir}`,
        `--proxy-server=http://127.0.0.1:${guard.port}`,
        "--remote-debugging-port=0"
      ]
    });
    // A request can still be in flight when the browser closes at the end of a run.
    await context.route(/^https?:/, (route) => dispatch(route).catch(() => {}));
    context.on("response", async (response) => {
      if (!response.url().startsWith(`${API}/links`) || !response.ok()) return;
      const links = await response.json().catch(() => []);
      for (const { shutaff } of links) {
        if (shutaff?.startsWith("http")) affiliateLinksFromApi.add(shutaff);
      }
      recordGuard({ at: new Date().toISOString(), layer: "route", kind: "affiliate-link-generated", links });
    });
    context.on("console", (message) => {
      if (message.type() === "error") recordConsole({ url: message.page()?.url(), text: message.text().slice(0, 2000) });
    });

    report.boot.installTab = await closeInstallTab();
    if (!report.boot.installTab) throw new Error("Install tab never appeared. The guard's boot sequence no longer matches the extension.");
    if (report.boot.installTab.startsWith("chrome-error:") && !guardEvents.some(({ kind }) => kind === "proxy-held")) {
      throw new Error("Install tab failed without the guard refusing it, so its pixels may have loaded.");
    }
    guard.releaseInstallHost();

    const { worker, manifest } = await waitForServiceWorker();
    const extensionId = worker.url().split("/")[2];
    Object.assign(report.boot, { extensionId, manifestVersion: manifest.version, manifestV: manifest.manifest_version, deniedHosts: guard.deniedHostCount });
    if (manifest.version !== packageVersion()) throw new Error(`Loaded ${manifest.version}, package.json says ${packageVersion()}`);
    if (manifest.manifest_version !== 3) throw new Error(`Loaded manifest v${manifest.manifest_version}, expected 3`);

    const page = context.pages()[0];
    const openPopup = async () => {
      await page.bringToFront();
      await worker.evaluate(() => chrome.action.openPopup());
      const [port] = fs.readFileSync(path.join(profileDir, "DevToolsActivePort"), "utf8").split("\n");
      cdpBrowser ??= await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
      const popupUrl = `chrome-extension://${extensionId}/popup.html`;
      const deadline = Date.now() + 10_000;
      while (Date.now() < deadline) {
        const popup = cdpBrowser.contexts().flatMap((c) => c.pages()).find((p) => p.url() === popupUrl);
        if (popup) return popup;
        await sleep(200);
      }
      throw new Error("Action popup never appeared");
    };

    const h = {
      context,
      page,
      worker,
      extensionId,
      expect,
      sleep,
      openPopup,
      serve: (matcher, response) => served.push([matcher, response]),
      offline: () => {
        offline = true;
        guard.goOffline();
      },
      guardEvents: (kind) => guardEvents.filter((event) => !kind || event.kind === kind),
      serviceWorkerRequests: () => {
        const file = path.join(evidenceDir, "service-worker-network.jsonl");
        return fs.existsSync(file) ? fs.readFileSync(file, "utf8").trim().split("\n").map((line) => JSON.parse(line)) : [];
      },
      badgeText: () => worker.evaluate(() => chrome.action.getBadgeText({})),
      observe: (key, value) => {
        report.observations[key] = value;
      },
      shot: (name, target = page) => target.screenshot({ path: path.join(evidenceDir, `${name}.png`) }),
      saveHtml: async (name, locator) => fs.writeFileSync(path.join(evidenceDir, `${name}.html`), await locator.evaluate((el) => el.outerHTML)),
      step: async (name, action) => {
        const started = Date.now();
        try {
          const value = await action();
          const entry = { name, status: "PASS", ms: Date.now() - started };
          report.steps.push(entry);
          recordStep(entry);
          console.log(`  PASS  ${name}`);
          return value;
        } catch (error) {
          const entry = { name, status: "FAIL", ms: Date.now() - started, error: String(error.message ?? error).slice(0, 1500) };
          report.steps.push(entry);
          recordStep(entry);
          console.log(`  FAIL  ${name}\n${entry.error}`);
          await page.screenshot({ path: path.join(evidenceDir, "failure.png") }).catch(() => {});
          throw error;
        }
      }
    };

    const { default: drive } = await import(pathToFileURL(journeyPath).href);
    await Promise.race([
      drive(h),
      sleep(JOURNEY_TIMEOUT_MS).then(() => {
        throw new Error(`Journey exceeded ${JOURNEY_TIMEOUT_MS / 1000}s`);
      })
    ]);
    report.status = "PASS";
  } catch (error) {
    failure = error;
    report.error = String(error.message ?? error).slice(0, 2000);
  } finally {
    report.guardSummary = guardEvents.reduce((counts, { kind }) => ({ ...counts, [kind]: (counts[kind] ?? 0) + 1 }), {});
    fs.writeFileSync(path.join(evidenceDir, "report.json"), JSON.stringify(report, null, 2));
    await finish();
  }

  console.log(`RESULT ${report.status} ${path.relative(REPO_ROOT, evidenceDir)}`);
  if (failure) console.log(report.error);
  return report.status === "PASS" ? 0 : 1;
};
