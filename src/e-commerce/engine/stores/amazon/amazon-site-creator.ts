import { ISiteCreator } from "../../../../data/entities/site-creator.interface";
import { ISiteSpec } from "../../../../data/entities/site-spec.interface";
import { Site } from "../../../../data/sites/site";
import { AmazonSite } from "./amazon-site";

export class AmazonSiteCreator implements ISiteCreator {
  public createSite(siteSpec: ISiteSpec): Site {
    return new AmazonSite(siteSpec);
  }
}
