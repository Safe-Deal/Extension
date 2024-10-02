import { debug } from "../analytics/logger";
import { browserWindow } from "./html";

let oldHref = document.location.href;

const isUrlChanged = (newHref, callback) => {
  if (oldHref != newHref) {
    oldHref = newHref;
    callback(oldHref);
  }
};

export const onHrefChange = (callback: (href: string) => void) => {
  if (!window) {
    debug("window is not defined, cant listen to href change");
    callback(null);
    return;
  }

  browserWindow().addEventListener("load", () => {
    const bodyList = document.querySelector("body");
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(() => {
        isUrlChanged(document.location.href, callback);
      });
    });

    const config = {
      childList: true,
      subtree: true
    };
    observer.observe(bodyList, config);
  });

  const EFFECTED_EVENTS = ["hashchange", "popstate", "beforeunload", "click"];
  EFFECTED_EVENTS.forEach((event) => {
    browserWindow().addEventListener(event, () => {
      isUrlChanged(document.location.href, callback);
    });
  });
};

export const comparePaths = (url1, url2) => {
  try {
    const path1 = new URL(url1).pathname;
    const path2 = new URL(url2).pathname;
    const result = path1 === path2;
    return result;
  } catch (e) {
    debug("comparePaths:: Invalid URL", e);
    return false;
  }
};

export const addParameterToUrl = (url, key, value) => {
  try {
    let fullUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      if (url.startsWith("/")) {
        fullUrl = `http://placeholder.com${url}`;
      } else {
        fullUrl = `http://${url}`;
      }
    }
    const urlObject = new URL(fullUrl);
    urlObject.searchParams.set(key, value);

    if (fullUrl.startsWith("http://placeholder.com")) {
      return urlObject.pathname + urlObject.search;
    }
    if (fullUrl.startsWith("http://")) {
      return urlObject.href;
    }

    return urlObject.href;
  } catch (e) {
    debug(`addParameterToUrl:: Invalid URL: ${url} | key:${key} | val: ${value} `, e);
    return url;
  }
};
