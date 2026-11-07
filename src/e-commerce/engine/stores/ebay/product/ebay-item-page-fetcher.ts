import { IProduct } from "../../../../../data/entities/product.interface";
import { debug } from "../../../../../utils/analytics/logger";

export const buildEbayItemUrl = (id: string, domain: string): string => `https://${domain}/itm/${id}`;

/** eBay's bot protection answers item pages requested by the extension service worker with 403, so fetch them from the eBay tab. */
export const fetchEbayItemPageDocument = async ({ id, domain }: IProduct): Promise<string | undefined> => {
  const url = buildEbayItemUrl(id, domain);
  try {
    const response = await fetch(url, { credentials: "include" });
    if (!response.ok) {
      debug(`eBay item page ${url} answered ${response.status}`, "eBay::fetchEbayItemPageDocument");
      return undefined;
    }
    return await response.text();
  } catch (error) {
    debug(`eBay item page ${url} failed: ${error}`, "eBay::fetchEbayItemPageDocument");
    return undefined;
  }
};
