import { IS_NODE, debug } from "../../analytics/logger";
import { MemoryCache } from "../../cashing/memoryCache";
import { getDomain } from "../../dom/html";
import { STATUS_NOT_200, fetchHtml, fetchText, getFetchJson, postFetchBody, postFetchJson } from "../fetch";
import { ConcurrencyManager } from "./concurrencyManager";

export interface DownloadResult {
  fromCache: boolean;
  response: any;
}

export enum HeadersType {
  BROWSER = "Browser",
  CRAWLER = "Crawler",
  NONE = "None"
}

const MAX_DOWNLOADS_PER_DOMAIN = IS_NODE ? 150 : 3;
export class Remote {
  private static cache = new MemoryCache();

  private static inFlightRequests = new MemoryCache();

  public static STATUS_NOT_200 = STATUS_NOT_200;

  public static async getJson(
    url: string,
    isCached = true,
    customHeaders?: Record<string, string>
  ): Promise<DownloadResult> {
    const cachingKey = this.getCachingKey(url);
    return this.fetchData(isCached, cachingKey, () => getFetchJson(url, customHeaders), customHeaders);
  }

  public static async postBody(url: string, body: string, ignoreCache: boolean = false): Promise<DownloadResult> {
    const cachingKey = this.postCachingKey(url, body);
    return this.fetchData(!ignoreCache, cachingKey, () => postFetchBody(url, body));
  }

  public static async postJson(
    url: string,
    json: object,
    ignoreCache: boolean = false,
    headers?: Record<string, string>
  ): Promise<DownloadResult> {
    const cachingKey = this.postCachingKey(url, json);
    return this.fetchData(!ignoreCache, cachingKey, () => postFetchJson(url, json, headers));
  }

  public static async get(
    url: string,
    isText: boolean,
    isCached: boolean,
    useBrowserHeaders: HeadersType,
    treatCodeAsProper = []
  ): Promise<DownloadResult> {
    const domain = getDomain(url);
    const cachingKey = this.getCachingKey(url);

    return ConcurrencyManager.request(
      domain,
      async () =>
        this.fetchData(isCached, cachingKey, () =>
          isText
            ? fetchText(url, useBrowserHeaders, treatCodeAsProper)
            : fetchHtml(url, useBrowserHeaders, treatCodeAsProper)
        ),
      MAX_DOWNLOADS_PER_DOMAIN
    );
  }

  private static async fetchData(
    useCache: boolean,
    cachingKey: string,
    request: () => Promise<any>,
    _customHeaders?: Record<string, string>
  ): Promise<DownloadResult> {
    try {
      if (this.inFlightRequests.has(cachingKey)) {
        const inFlightResponse = await this.inFlightRequests.get(cachingKey);
        if (inFlightResponse) {
          const response = { ...inFlightResponse, fromCache: true };
          return response;
        }
        return null;
      }

      if (useCache) {
        const result = this.cache.get(cachingKey);
        if (result && result.response) {
          return { ...result, fromCache: true };
        }
      }

      const requestPromise = request()
        .then((response) => {
          if (response === STATUS_NOT_200) {
            debug(`Remote - Fetch Data: ${STATUS_NOT_200} error.`);
            return null;
          }

          this.inFlightRequests.delete(cachingKey);

          const downloadResult = { response, fromCache: false };
          if (useCache) {
            this.cache.set(cachingKey, downloadResult);
          }

          return downloadResult;
        })
        .catch((error) => {
          debug(`Remote - Fetch Data: Failed with error: ${error.toString()}`);
          this.inFlightRequests.delete(cachingKey);
          return null;
        });

      this.inFlightRequests.set(cachingKey, requestPromise);
      return await requestPromise;
    } catch (error) {
      debug(`Remote - Fetch Data: Failed with error: ${error.toString()}`);
      this.inFlightRequests.delete(cachingKey);
      return null;
    }
  }

  private static postCachingKey = (url: string, json: any): string =>
    `${url?.toLowerCase()}>${JSON.stringify(json)?.toLowerCase()}`;

  private static getCachingKey = (url: string): string => {
    const obj = new URL(url);
    return (obj.hostname + obj.pathname + obj.search + obj.hash)?.toLowerCase();
  };

  public static setCachedGet(url: string, response: any): void {
    const cachingKey = this.getCachingKey(url);
    this.cache.set(cachingKey, { response, fromCache: false });
  }

  public static getCachedPost(url: string, json: object): any {
    const key = this.postCachingKey(url, json);
    return this.cache.get(key);
  }

  public static storeLength(): number {
    return this.cache.length();
  }

  public static clear() {
    this.cache.clear();
    this.inFlightRequests.clear();
  }
}
