import { debug } from "../../utils/analytics/logger";
import { browserLocalStorage } from "../../utils/site/site-storage";
import { WHITELISTED_DOMAINS } from "./anti-scam-white-list";

const WHITELISTING_PERIOD_IN_DAYS = 4 * 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const USER_DECLARED_AS_SAFE = "SD_USER_DECLARED_AS_SAFE";
export const USER_DECLARED_AS_SAFE_TIMESTAMP = "SD_USER_DECLARED_AS_SAFE_TIMESTAMP";
export const MARK_AS_SAFE = "SG_MARKED_AS_SAFE";

const hostFromInput = (value: unknown): string => {
  let host = String(value ?? "")
    .trim()
    .toLowerCase();
  const colon = host.lastIndexOf(":");
  if (colon > -1 && /^\d+$/.test(host.slice(colon + 1))) {
    host = host.slice(0, colon);
  }
  if (host.startsWith("www.")) {
    host = host.slice(4);
  }
  return host;
};

const matchesTrustedDomain = (host: string, trusted: string): boolean => {
  const entry = String(trusted ?? "")
    .trim()
    .toLowerCase();
  if (!entry) {
    return false;
  }
  return host === entry || host.endsWith(`.${entry}`);
};

export const isWhitelisted = (domain) => {
  const inspected = hostFromInput(domain);
  const whitelistedBigSite = WHITELISTED_DOMAINS.some((trusted) => matchesTrustedDomain(inspected, trusted));
  if (whitelistedBigSite) {
    debug(`AntiScam :: ${inspected} is Whitelisted cause it's big trusted website`);
    return true;
  }

  const selfWhitelisted = browserLocalStorage.getItem(USER_DECLARED_AS_SAFE);
  if (selfWhitelisted) {
    debug(`AntiScam :: ${inspected} is Whitelisted By User`);
    return true;
  }

  const markedAsSafe = browserLocalStorage.getItem(MARK_AS_SAFE);
  if (markedAsSafe) {
    const atMs = Number.parseInt(markedAsSafe, 10);
    const daysPassed = Math.floor((Date.now() - atMs) / MS_PER_DAY);
    if (Number.isFinite(daysPassed) && daysPassed <= WHITELISTING_PERIOD_IN_DAYS) {
      debug(`AntiScam :: ${inspected} is Whitelisted by SafeDeal ${daysPassed} days ago`);
      return true;
    }
    debug(`AntiScam :: ${inspected} Whitelisting is Expired ${daysPassed} days ago, was marked safe by SafeDeal`);
    return false;
  }

  debug(`AntiScam :: ${inspected} is fist time inspected`);
  return false;
};

export const whitelist = () => {
  const today = new Date().getTime().toString();
  browserLocalStorage.setItem(USER_DECLARED_AS_SAFE, "true");
  browserLocalStorage.setItem(USER_DECLARED_AS_SAFE_TIMESTAMP, today);
};

export const markAsSafe = () => {
  const today = new Date().getTime().toString();
  browserLocalStorage.setItem(MARK_AS_SAFE, today);
};
