import { RETRIES, MAX_TIMEOUT_IN_MS } from "./playwright.config";

const setup = async () => {
  // eslint-disable-next-line no-console
  console.log("\x1b[32m", `Timeout is set to ${MAX_TIMEOUT_IN_MS / 1000} seconds, retries: ${RETRIES}`, "\x1b[0m");
};

export default setup;
