import { createHash } from "crypto";
import { MemoryCache } from "../../src/utils/cashing/memoryCache";
import { ServerLogger } from "../utils/logging";
import { ScrapflyClient } from "./scrapify/client";
import { ScrapeConfig } from "./scrapify/scrapeConfig";
import { Rec } from "./scrapify/types";

const SCRAPIFY_API_KEY = process.env.SCRAPFLY_API_KEY;
const CACHE_MAX_DURATION_MINUTES = 180;
const CACHE_MAX_SIZE = 1024;

const scrapifyClient = new ScrapflyClient({ key: SCRAPIFY_API_KEY });
const localCache = new MemoryCache(CACHE_MAX_DURATION_MINUTES, CACHE_MAX_SIZE);

const getKey = ({ url, headers = {}, waitForCssSelector = "", method = "", data = {} }): string => {
  const string =
    JSON.stringify(headers) + JSON.stringify(data) + JSON.stringify(waitForCssSelector) + JSON.stringify(method);

  return `${url}_${createHash("md5").update(string).digest("hex")}`;
};

const cacheResponse = (cacheKey: string, response: string) => {
  localCache.set(cacheKey, response);
};

const logError = (url: string, status: number, reason: string, logUrl: string) => {
  ServerLogger.error(`Middleware:: Fetching through proxy: ${url}
    Failed with status: ${status}
    Reason: ${reason}
    Log: ${logUrl}
  `);
};

type ScrapeResult = {
  result: string;
  status: number;
  cached?: boolean;
};

export const scrape = async ({
  method = "GET",
  url,
  waitForCssSelector,
  headers = {},
  regenerate = false,
  data = undefined
}: {
  url: string;
  waitForCssSelector?: string;
  headers?: Rec<string>;
  method?: "GET" | "POST";
  regenerate?: boolean;
  data?: Rec<object>;
}): Promise<ScrapeResult> => {
  const cacheKey = getKey({ url, headers, waitForCssSelector, method, data });

  if (!regenerate) {
    const cachedResponse = localCache.get(cacheKey);
    if (cachedResponse) {
      ServerLogger.green(`Extract::scrape:: Fetching through proxy: cached response for ${url}`);
      return { result: cachedResponse, status: 200, cached: true };
    }
  }

  const scraperConf = {
    auto_scroll: false,
    render_js: !!waitForCssSelector,
    wait_for_selector: waitForCssSelector,
    country: "us",
    asp: true,
    cache: true,
    retry: true,
    lang: ["en-US"]
  };

  const request = method === "GET" ? { url, method } : { url, method, headers, data };
  const finalConf = { ...request, ...scraperConf };

  const apiResponse = await scrapifyClient.scrape(new ScrapeConfig(finalConf));
  const result = apiResponse.result.content;
  const status = apiResponse.result.status_code;
  const soft404 = /<title>\s*Page Not Found\s*/i.test(result);

  if (soft404) {
    ServerLogger.error(`Extract::scrape:: Fetching through proxy: ${url} Soft 404`);
  }

  if (!regenerate) {
    cacheResponse(cacheKey, result);
    ServerLogger.green(`Extract::scrape:: Fetching through proxy: saved response for ${url}`);
  }

  if (status !== 200) {
    logError(url, status, apiResponse.result.reason, apiResponse.result.log_url);
    ServerLogger.error(`Extract::scrape:: Failed to extract data from ${url}, status: ${status}`);
  }

  return {
    result,
    status
  };
};
