import { ISiteCreator } from "../../../../data/entities/site-creator.interface";
import { ISiteSpec } from "../../../../data/entities/site-spec.interface";
import { Site } from "../../../../data/sites/site";
import { EbaySite } from "./ebay-site";

export class EbaySiteCreator implements ISiteCreator {
  public createSite(siteSpec: ISiteSpec): Site {
    return new EbaySite(siteSpec);
  }
}
