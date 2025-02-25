// Hot reload functionality for Chrome extensions (Manifest V3 compatible)
// Based on https://github.com/informatdcs/auto-reload-extension-manifest-v3
import { ext } from "../utils/extension/ext";
import { debug, logError } from "../utils/analytics/logger";

const LOG_PREFIX = "[HotReload]";
const MONITORING_INTERVAL_IN_SEC = 3;

async function getFilesToMonitorFromManifest(): Promise<string[]> {
  try {
    const filesToMonitor: string[] = ["manifest.json"];

    const manifestUrl = ext.runtime.getURL("manifest.json");
    const response = await fetch(manifestUrl, { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Failed to fetch manifest.json");
    }

    const manifest = await response.json();

    if (manifest.background?.service_worker) {
      filesToMonitor.push(manifest.background.service_worker);
    }

    if (manifest.action?.default_popup) {
      filesToMonitor.push(manifest.action.default_popup);
    }

    if (manifest.content_scripts) {
      for (const contentScript of manifest.content_scripts) {
        if (contentScript.js) {
          filesToMonitor.push(...contentScript.js);
        }
      }
    }

    if (manifest.icons) {
      Object.values(manifest.icons).forEach((icon) => {
        if (typeof icon === "string") {
          filesToMonitor.push(icon);
        }
      });
    }

    if (manifest.action?.default_icon) {
      Object.values(manifest.action.default_icon).forEach((icon) => {
        if (typeof icon === "string") {
          filesToMonitor.push(icon);
        }
      });
    }

    return [...new Set(filesToMonitor)];
  } catch (error) {
    logError(error as Error);
    debug(`${LOG_PREFIX} Error extracting files from manifest`);

    return [
      "manifest.json",
      "popup.html",
      "scripts/service_worker.js",
      "scripts/popup.js",
      "scripts/content-script-ecommerce.js",
      "scripts/content-script-shutaf.js",
      "scripts/content-script-anti-scam.js",
      "scripts/content-script-talk.js",
      "scripts/content-script-supplier.js",
      "scripts/content-script-auth.js"
    ];
  }
}

const filesTimestamps: Record<string, string | null> = {};
let filesToMonitor: string[] = [];

async function initializeTimestamps(): Promise<void> {
  filesToMonitor = await getFilesToMonitorFromManifest();
  for (const file of filesToMonitor) {
    try {
      const url = ext.runtime.getURL(file);
      const response = await fetch(url, { cache: "no-store" });

      if (response.ok) {
        const lastModified = response.headers.get("Last-Modified");
        filesTimestamps[file] = lastModified;
      } else {
        debug(`${LOG_PREFIX} File not found: ${file}`);
      }
    } catch (error) {
      debug(`${LOG_PREFIX} Error initializing: ${file}`, error);
    }
  }
}

/**
 * Save active tab IDs before reloading the extension
 * We'll use this to reload tabs after extension is reloaded
 */
function saveActiveTabsForReload(): Promise<void> {
  return new Promise((resolve) => {
    try {
      ext.tabs.query({ active: true }, (tabs) => {
        if (tabs && tabs.length > 0) {
          const tabIds = tabs.map((tab) => tab.id).filter(Boolean) as number[];
          if (tabIds.length > 0) {
            // Store tab IDs in local storage for retrieval after reload
            ext.storage.local.set({ hotReloadActiveTabs: tabIds }, () => {
              debug(`${LOG_PREFIX} Saved ${tabIds.length} active tabs for reload`);
              resolve();
            });
          } else {
            resolve();
          }
        } else {
          resolve();
        }
      });
    } catch (error) {
      debug(`${LOG_PREFIX} Error saving active tabs: ${error}`);
      resolve();
    }
  });
}

/**
 * Reload the extension and prepare for tab reloading
 */
async function reloadExtension(): Promise<void> {
  try {
    debug(`${LOG_PREFIX} Preparing to reload extension`);

    // Save active tabs before reloading
    await saveActiveTabsForReload();

    // Reload the extension
    debug(`${LOG_PREFIX} Reloading extension now`);
    ext.runtime.reload();
  } catch (error) {
    logError(error as Error);
    debug(`${LOG_PREFIX} Failed to reload extension`);
  }
}

/**
 * Check for and reload active tabs after extension reload
 * This is called when the extension starts up
 */
function reloadActiveTabsAfterExtensionReload(): void {
  try {
    ext.storage.local.get(["hotReloadActiveTabs"], (result) => {
      const tabIds = result.hotReloadActiveTabs as number[] | undefined;

      if (tabIds && tabIds.length > 0) {
        debug(`${LOG_PREFIX} Reloading ${tabIds.length} tabs after extension reload`);

        tabIds.forEach((tabId) => {
          ext.tabs.reload(tabId, {}, () => {
            if (ext.runtime.lastError) {
              debug(`${LOG_PREFIX} Error reloading tab ${tabId}: ${ext.runtime.lastError.message}`);
            }
          });
        });

        ext.storage.local.remove("hotReloadActiveTabs");
      }
    });
  } catch (error) {
    debug(`${LOG_PREFIX} Error reloading tabs: ${error}`);
  }
}

async function checkForChanges(): Promise<void> {
  let hasChanges = false;
  const changedFiles: string[] = [];

  for (const file of filesToMonitor) {
    try {
      const url = ext.runtime.getURL(file);
      const response = await fetch(url, { cache: "no-store" });

      if (response.ok) {
        const lastModified = response.headers.get("Last-Modified");

        if (filesTimestamps[file] && filesTimestamps[file] !== lastModified) {
          changedFiles.push(file);
          hasChanges = true;
        }

        filesTimestamps[file] = lastModified;
      }
    } catch (error) {
      debug(`${LOG_PREFIX} Error checking ${file}`, error);
    }
  }

  if (hasChanges) {
    debug(`${LOG_PREFIX} Changes detected in: ${changedFiles.join(", ")}`);
    reloadExtension();
  }
}

async function startMonitoring(): Promise<void> {
  await initializeTimestamps();

  const intervalId = setInterval(checkForChanges, MONITORING_INTERVAL_IN_SEC * 1000);
  debug(
    `${LOG_PREFIX} Monitoring started (${MONITORING_INTERVAL_IN_SEC}s interval) Monitoring ${filesToMonitor.length} files`
  );

  ext.runtime.onSuspend?.addListener(() => {
    clearInterval(intervalId);
    debug(`${LOG_PREFIX} Monitoring stopped`);
  });
}

export const initHotReload = (): void => {
  debug(`${LOG_PREFIX} Initializing`);

  // Check if we need to reload tabs from previous extension reload
  reloadActiveTabsAfterExtensionReload();

  startMonitoring().catch((error) => {
    logError(error);
    debug(`${LOG_PREFIX} Initialization failed`);
  });
};
