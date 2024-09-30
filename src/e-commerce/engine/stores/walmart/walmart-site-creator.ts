import { ISiteCreator } from "../../../../data/entities/site-creator.interface";
import { ISiteSpec } from "../../../../data/entities/site-spec.interface";
import { Site } from "../../../../data/sites/site";
import { WalmartSite } from "./walmart-site";

export class WalmartSiteCreator implements ISiteCreator {
  public createSite(siteSpec: ISiteSpec): Site {
    return new WalmartSite(siteSpec);
  }
}
