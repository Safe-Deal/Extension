import { ISiteSpec } from "../../../../data/entities/site-spec.interface";
import { Rule } from "../../../../data/rules/rule";
import { Site } from "../../../../data/sites/site";
import { AmazonRulesEnum, RULES_PER_PAGE } from "./amazon-site-rules";
import { AmazonSiteSelector } from "./amazon-site-selector";
import { AmazonSiteUtils } from "./utils/amazon-site-utils";

export class AmazonSite extends Site {
  constructor(private siteSpec: ISiteSpec) {
    super(siteSpec, new AmazonSiteSelector());
    const rulesPerPage: Rule[] = this.getRulesPerPage(this.siteSpec);
    this.setRules(rulesPerPage);
  }

  private getRulesPerPage(siteSpec: ISiteSpec): Rule[] {
    let key: AmazonRulesEnum;
    const { url } = siteSpec;

    if (AmazonSiteUtils.isAmazonWholesale(url)) {
      key = AmazonRulesEnum.WHOLESALE_GALLERY;
    } else if (AmazonSiteUtils.isAmazonItemDetails(url)) {
      key = AmazonRulesEnum.ITEM;
    }
    return RULES_PER_PAGE[key];
  }
}
