import { API_URL } from "../../constants/api-params";
import { IS_DEBUG, debug, logError } from "../../utils/analytics/logger";
import { DateUtils } from "../../utils/date/date";
import { ext } from "../../utils/extension/ext";

export const UNINSTALL_URL = () => `${API_URL}/goodbye`;
export const INSTALL_URL = () => `${API_URL}/get`;

const INSTALL_EVENTS = Object.freeze({
  INSTALLED: "install", // The extension was installed.
  UPDATED: "update", // The extension was updated to a new version.
  BROWSER_UPDATED: "browser_update", // The browser was updated to a new version,
  SHARED_MODULE_UPDATE: "shared_module_update" // Another extension, which contains a module used by this extension, was updated.
});

const setUninstallUrl = () => {
  const installTimestamp = DateUtils.getUtcTimestamp();
  const finalUrl = `${UNINSTALL_URL()}?timestamp=${installTimestamp}`;
  ext.runtime.setUninstallURL(finalUrl, () => {
    if (ext.runtime.lastError) {
      logError(new Error(`Error setting uninstall URL: ${ext.runtime?.lastError?.message}`));
    } else {
      debug(`Uninstall URL set successfully to: ${finalUrl}`);
    }
  });
};

const extensionInstalledOpenTab = (): void => {
  if (!IS_DEBUG) {
    ext.tabs.create({
      url: INSTALL_URL(),
      active: true
    });
  }
};

const extensionInstallHandler = () => {
  ext.runtime.onInstalled.addListener((details) => {
    const { reason } = details;
    switch (reason) {
    case INSTALL_EVENTS.INSTALLED:
      extensionInstalledOpenTab();
      setUninstallUrl();
      break;
    default:
      break;
    }
  });
};

export const initExtensionSetup = () => {
  extensionInstallHandler();
};
