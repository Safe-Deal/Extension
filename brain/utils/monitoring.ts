/* eslint-disable no-console */
import { IS_DEBUG } from "@utils/analytics/logger";
import packageJson from "../../package.json";

const printVersion = (): void => {
  const isProduction = !IS_DEBUG;
  const environment = isProduction ? "Production" : "Development";

  console.log(" ---------------------- \x1b[1m\x1b[37m✦ SafeDeal Brain ✦\x1b[0m ----------------------");
  console.log(` - Running ver: \x1b[1m\x1b[37m${packageJson.version}\x1b[0m in \x1b[1m\x1b[37m${environment}\x1b[0m`);
  console.log(" ----------------------------------------------------------------");
};

export { printVersion };
