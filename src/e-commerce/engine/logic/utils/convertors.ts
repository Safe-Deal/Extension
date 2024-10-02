import { ISiteDomSelectorResponse } from "../../../../data/entities/site-dom-selector-response.interface";
import { Site } from "../../../../data/sites/site";
import { SiteDomSelector } from "../../../../data/sites/site-dom-selector";

const convertSiteToSiteResponse = ({ url, domain, domainURL, dom, pathName, queryParams, siteDomSelector }: Site) => {
  const siteDomSelectorResponse = convertSiteDomSelectorToSiteDomSelectorResponse(siteDomSelector);
  return {
    url,
    domain,
    domainURL,
    pathName,
    queryParams,
    siteDomSelector: siteDomSelectorResponse
  };
};

const convertSiteDomSelectorToSiteDomSelectorResponse = ({
  domSelector,
  displayDomSelector
}: SiteDomSelector): ISiteDomSelectorResponse => ({
  domSelector,
  displayDomSelector
});

export { convertSiteDomSelectorToSiteDomSelectorResponse, convertSiteToSiteResponse };
