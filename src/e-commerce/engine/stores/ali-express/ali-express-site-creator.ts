import { ISiteCreator } from "../../../../data/entities/site-creator.interface";
import { ISiteSpec } from "../../../../data/entities/site-spec.interface";
import { Site } from "../../../../data/sites/site";
import { AliExpressSite } from "./ali-express-site";

export class AliExpressSiteCreator implements ISiteCreator {
  public createSite(siteSpec: ISiteSpec): Site {
    return new AliExpressSite(siteSpec);
  }
}
