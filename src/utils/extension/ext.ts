// @ts-nocheck

const apis = [
  "alarms",
  "bookmarks",
  "action",
  "commands",
  "contextMenus",
  "cookies",
  "downloads",
  "events",
  "extension",
  "extensionTypes",
  "history",
  "i18n",
  "idle",
  "notifications",
  "runtime",
  "storage",
  "tabs",
  "webNavigation",
  "webRequest",
  "windows",
  "identity"
];

function Extension() {
  const _this = this;

  apis.forEach((api) => {
    _this[api] = null;

    try {
      if (chrome[api]) {
        _this[api] = chrome[api];
      }
      // eslint-disable-next-line no-empty
    } catch (error) {}

    try {
      if (window[api]) {
        _this[api] = window[api];
      }
      // eslint-disable-next-line no-empty
    } catch (error) {}

    try {
      // @ts-ignore
      if (browser[api]) {
        // @ts-ignore
        _this[api] = browser[api];
      }
      // eslint-disable-next-line no-empty
    } catch (error) {}

    try {
      // @ts-ignore
      _this.api = browser.extension[api];
      // eslint-disable-next-line no-empty
    } catch (error) {}
  });

  try {
    // @ts-ignore
    if (browser && browser.runtime) {
      // @ts-ignore
      this.runtime = browser.runtime;
    }
    // eslint-disable-next-line no-empty
  } catch (error) {}

  try {
    // @ts-ignore
    if (browser && browser.action) {
      // @ts-ignore
      this.action = browser.action;
    }
    // eslint-disable-next-line no-empty
  } catch (error) {}

  try {
    // @ts-ignore
    if (browser && browser.browserAction) {
      // @ts-ignore
      this.action = browser.browserAction;
    }
    // eslint-disable-next-line no-empty
  } catch (error) {}

  if (!this?.i18n?.getMessage) {
    this.i18n = {};
    this.i18n.getMessage = (key: string) => key;
  }
}

export const ext = new Extension();
