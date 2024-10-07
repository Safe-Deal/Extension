import { version as packageVer } from "../../../package.json";
import { debug } from "../analytics/logger";
import { getBrowserVer } from "../browser/browser";
import { ext } from "./ext";

const version = (): string | undefined => {
  if (packageVer) {
    return packageVer;
  }

  if (typeof ext !== "undefined" && ext.runtime && ext.runtime.getManifest) {
    return ext.runtime.getManifest().version;
  }

  return packageVer;
};

export const VERSION = version();
export const BROWSER_VERSION = getBrowserVer();

export const encodeMsg = (data: Record<string, any>): string => JSON.stringify(data);
export const decodeMsg = (data: string): Record<string, any> => {
  try {
    const res = JSON.parse(data);
    return res;
  } catch (error) {
    debug(`Error decoding message: ${JSON.stringify(data)}`, error);
    return {};
  }
};

export const getBrowserType = () => {
  const { userAgent } = window.navigator || navigator;

  if (userAgent.includes("Firefox")) {
    return "Firefox";
  }
  if (userAgent.includes("Edg")) {
    return "Edge";
  }
  if (userAgent.includes("Chrome")) {
    return "Chrome";
  }
  return "Unknown";
};

export const getCurrentUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.href;
  }
  throw new Error("getCurrentUrl :: window is not defined");
};

export const convertUrlToParams = (url: string): any => {
  const initParams = {};
  const params = url.split("|||").slice(1);
  for (const param of params) {
    if (param.includes("=")) {
      const [key, value] = param.split("=");
      initParams[key.toUpperCase()] = value;
    }
  }
  return initParams;
};

export function parseUrlHash(url: string) {
  const hashParts = new URL(url).hash.slice(1).split("&");
  const hashMap = new Map(
    hashParts.map((part) => {
      const [name, value] = part.split("=");
      return [name, value];
    })
  );

  return hashMap;
}
