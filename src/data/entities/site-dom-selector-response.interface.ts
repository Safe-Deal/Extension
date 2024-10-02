import { IDisplaySiteDomSelectorSpec } from "./display-site-dom-selector-spec.interface"
import { ISiteDomSelectorSpec } from "./site-dom-selector-spec.interface"

export interface ISiteDomSelectorResponse {
  domSelector?: ISiteDomSelectorSpec;
  displayDomSelector?: IDisplaySiteDomSelectorSpec;
}
