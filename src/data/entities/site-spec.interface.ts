export interface ISiteSpec {
  url?: string;
  domain?: string;
  domainURL?: string;
  pathName?: string;
  queryParams?: string;
  dom?: any;
  routingHint?: string; // pre-extracted routing signal from the content script live DOM
}
