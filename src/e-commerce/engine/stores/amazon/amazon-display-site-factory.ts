import { IConclusionResponse } from "../../../../data/rules-conclusion/conclusion-response.interface";
import { DisplaySite } from "../../logic/site/display-site";
import { AmazonProductDisplayPage } from "./display/amazon-product-page";
import { AmazonWholesaleDisplayPage } from "./display/amazon-wholesale-page";
import { AmazonSiteUtils } from "./utils/amazon-site-utils";

export class AmazonDisplaySiteFactory {
  public create(conclusionResponse: IConclusionResponse): DisplaySite {
    const { site } = conclusionResponse;
    const { url } = site;
    if (AmazonSiteUtils.isAmazonWholesale(url)) {
      return new AmazonWholesaleDisplayPage(conclusionResponse);
    }

    if (AmazonSiteUtils.isAmazonItemDetails(url)) {
      return new AmazonProductDisplayPage(conclusionResponse);
    }
  }
}
