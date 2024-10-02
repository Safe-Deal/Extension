import { IConclusionResponse } from "../../../../../data/rules-conclusion/conclusion-response.interface";
import { DisplaySite } from "../../../logic/site/display-site";

export class AmazonProductDisplayPage extends DisplaySite {
  constructor(conclusionResponse: IConclusionResponse) {
    super(conclusionResponse);
  }

  public apply() {
    return null;
  }
}
