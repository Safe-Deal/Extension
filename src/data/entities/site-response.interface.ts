import { ISiteDomSelectorResponse } from "./site-dom-selector-response.interface"

export interface ISiteResponse {
  url: string;
  domain: string;
  domainURL: string;
  pathName: string;
  queryParams: string;
  siteDomSelector: ISiteDomSelectorResponse;
}
