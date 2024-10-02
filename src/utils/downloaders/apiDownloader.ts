import { logError } from "../analytics/logger";
import { DownloadResult, Remote } from "./remote/remoteFetcher";
import { API_URL } from "../../constants/api-params";

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
    // this.url = `${LOCALHOST_API_URL}${restPath}`; // TODO: Change this to the above line for a REAL API call

    this.ignoreCaching = ignoreCashing;
  }

  public async post(data: any): Promise<any> {
    try {
      const response: DownloadResult = await Remote.postJson(this.url, data, this.ignoreCaching);
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
