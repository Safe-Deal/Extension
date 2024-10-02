import { get } from "lodash";
import { browserWindow, parseAsHtml, ParsedHtml } from "../dom/html";

/**
 * This methods of the class can only be used on content script.
 */
export class SiteMetadata {
  public static getDom(data: any): ParsedHtml {
    const doc = get(data, "document");
    return parseAsHtml(doc);
  }

  public static getDomOuterHTML(doc: Document): string {
    const documentString = new XMLSerializer().serializeToString(doc);
    return documentString;
  }

  public static getDomain(data?: { url: { domain: any } }): string {
    return data?.url?.domain ?? browserWindow().location.host;
  }

  public static getDomainURL(): string {
    return `${browserWindow().location.protocol}//${browserWindow().location.host}`;
  }

  public static getURL(): string {
    return browserWindow().location.href;
  }

  public static getPathName(): string {
    return browserWindow().location.pathname;
  }

  public static getQueryParams(): string {
    return browserWindow().location.search;
  }
}
