import { API_URL } from "../../constants/api-params";
import { logError } from "../analytics/logger";
import { DownloadResult, Remote } from "./remote/remoteFetcher";

export const PRICE_TYPE = Object.freeze({
  AMAZON: "AMAZON",
  ALI_EXPRESS: "ALI_EXPRESS"
});
export class ApiDownloader {
  protected remote: Remote;

  protected url: string;

  protected ignoreCaching: boolean = false;

  constructor(restPath: string, ignoreCashing: boolean = false) {
    this.url = `${API_URL}${restPath}`;
    this.ignoreCaching = ignoreCashing;
  }

  public async post(data: any, customHeaders: Record<string, string> = {}): Promise<any> {
    try {
      const defaultHeaders = { "Content-Type": "application/json" };
      const mergedHeaders = { ...defaultHeaders, ...customHeaders };
      const response: DownloadResult = await Remote.postJson(this.url, data, this.ignoreCaching, mergedHeaders);
      return response?.response;
    } catch (error) {
      logError(
        new Error(
          `ApiDownloader:: Call Failed ${this.url} data:${JSON.stringify(data)} \nError ${JSON.stringify(error)}`
        )
      );
      return Promise.resolve(null);
    }
  }
}
