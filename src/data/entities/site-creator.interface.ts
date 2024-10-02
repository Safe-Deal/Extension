import { Site } from "../sites/site"
import { ISiteSpec } from "./site-spec.interface"

export interface ISiteCreator {
  createSite(site: ISiteSpec): Site;
}
