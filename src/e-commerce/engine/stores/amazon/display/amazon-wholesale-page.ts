import { initPageDisplay, SafeDealPages } from "../../../../../constants/display";
import { IConclusionResponse } from "../../../../../data/rules-conclusion/conclusion-response.interface";
import { DisplaySite } from "../../../logic/site/display-site";
import { AmazonWholesalePaint } from "./paint/amazon-wholesale-paint";

export class AmazonWholesaleDisplayPage extends DisplaySite {
  constructor(conclusionResponse: IConclusionResponse) {
    super(conclusionResponse);
  }

  public apply(): void {
    const { conclusionProductEntity }: IConclusionResponse = this.conclusionResponse;
    const productListSel = this.getWholesaleItemListSel();
    const productInfoSel = this.getWholesaleProductListSel();
    const priceSel: any = this.getWholesalePriceSel();
    const wholesalePageItemListSel: string = this.getWholesalePageItemListSel();
    initPageDisplay(document, SafeDealPages.Amazon);

    const amazonWholesalePaint = new AmazonWholesalePaint();
    amazonWholesalePaint.draw({
      conclusionProductEntity,
      productListSel,
      productInfoSel,
      priceSel,
      wholesalePageItemListSel
    });
  }
}
