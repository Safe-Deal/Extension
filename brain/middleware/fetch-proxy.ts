/* eslint-disable camelcase */
import { createHash } from "crypto";
import { MemoryCache } from "../../src/utils/cashing/memoryCache";
import { ServerLogger } from "../utils/logging";
import { getRootDomain } from "../utils/utils";
import { ScrapflyClient } from "../services/scrapify/client";
import { ScrapeConfig } from "../services/scrapify/scrapeConfig";

const API_KEY = "b3a2f1c0-0f4a-11eb-adc1-0242ac120002-sd";

const PROXIES_DOMAINS = ["amazon", "ebay", "aliexpress"];
const RENDERED_DOMAINS = ["aliexpress"];
const CASH_MAX_DURATION_MINUTES = 180;
const CASH_MAX_SIZE = 1024;
const SCRAPIFY_API_KEY = process.env.SCRAPFLY_API_KEY;

const client = new ScrapflyClient({ key: SCRAPIFY_API_KEY });
const cache = new MemoryCache(CASH_MAX_DURATION_MINUTES, CASH_MAX_SIZE);
const originalFetch = global.fetch;

const getKey = (url: string, headers: object): string => {
  const string = JSON.stringify(headers);
  const md5 = createHash("md5").update(string).digest("hex");
  const key = `${url}_${md5}`;
  return key;
};

const makeScrapeCall = async (targetUrl: string, headerReq) => {
  const method = headerReq.method || "GET";
  const cacheKey = getKey(targetUrl, headerReq.body || {});
  const cachedResponse = cache.get(cacheKey);

  if (cachedResponse) {
    ServerLogger.green(`Middleware:: Fetching threw proxy: no call on ${targetUrl} existed in cache`);
    return Promise.resolve({
      text: () => Promise.resolve(cachedResponse),
      json: () => Promise.resolve(JSON.parse(cachedResponse)),
      status: 200
    });
  }

  const url = targetUrl;
  const headers = headerReq.headers || {};
  const data = headerReq.body || undefined;
  const domain = getRootDomain(url).split(".")[0];
  const auto_scroll = false;
  let render_js = false;
  let wait_for_selector;
  let proxy_pool;
  if (RENDERED_DOMAINS.includes(domain)) {
    render_js = true;

    if (targetUrl.includes("aliexpress.ru/")) {
      wait_for_selector = "[data-spm-anchor-id]";
    } else {
      wait_for_selector = "[data-pl]";
      proxy_pool = "public_residential_pool";
    }
  }
  const scraperConf = {
    auto_scroll,
    render_js,
    wait_for_selector,
    country: "us",
    asp: true,
    proxy_pool,
    cache: true,
    retry: true,
    lang: ["en-US"]
  };

  const request = method === "GET" ? { url, method } : { url, method, headers, data };

  ServerLogger.gray(`Middleware:: Fetching threw proxy: ${targetUrl} with config: ${JSON.stringify(scraperConf)}`);
  const apiResponse = await client.scrape(
    new ScrapeConfig({
      ...request,
      ...scraperConf
    })
  );

  const result = apiResponse.result.content;
  const regex = /<title>\s*Page Not Found\s*/i;
  const soft404 = regex.test(apiResponse.result.content);
  const status = apiResponse.result.status_code;

  if (soft404) {
    ServerLogger.error(`Middleware:: Fetching threw proxy: ${targetUrl} Soft 404`);
  }

  cache.set(cacheKey, result);

  if (status !== 200) {
    ServerLogger.error(
      `Middleware:: Fetching threw proxy: ${targetUrl}
	  	  Failed with status: ${apiResponse.result.status}
          Reason: ${apiResponse.result.reason}
	   	  Log: ${apiResponse.result.log_url}
	  `
    );
  }

  return Promise.resolve({
    text: () => Promise.resolve(result),
    json: () => Promise.resolve(JSON.parse(result)),
    status
  });
};

const customFetch = (url, headerReq: RequestInit = {}) => {
  const domain = getRootDomain(url).split(".")[0];
  if (PROXIES_DOMAINS.includes(domain)) {
    ServerLogger.gray(`Middleware:: Fetching threw proxy: ${url}`);
    try {
      const scrape = makeScrapeCall(url, headerReq);
      return scrape;
    } catch (error) {
      ServerLogger.error(`Middleware:: Fetching threw proxy: ${url} Error: ${error}`);
    }
  }
  ServerLogger.green(`Middleware:: Fetching directly: ${url}`);
  headerReq.headers = {
    ...headerReq.headers,
    "api-key": API_KEY
  };
  return originalFetch(url, headerReq);
};

export const registerFetchProxy = () => {
  // @ts-ignore
  global.fetch = customFetch;
  global.reportErrorToServer = ServerLogger.error;
};
