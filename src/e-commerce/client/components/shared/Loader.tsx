import React from "react";
import { t } from "../../../../constants/messages";
import { IMAGE_SAFE_DEAL } from "../../../../constants/visual";
import { LOADER_ELEMENT_ID, MODIFIED_PAGES_CSS_CLASS } from "../../../../constants/display";

export function LoaderSpinner() {
  return (
    <div className="safe-deal-loader">
      <div className="loader">
        <svg className="circular" viewBox="25 25 50 50">
          <circle className="path" cx="50" cy="50" r="20" fill="none" strokeWidth="2" strokeMiterlimit="10" />
        </svg>
      </div>
    </div>
  );
}

export function ProductAnalysisLoader() {
  return (
    <div id={LOADER_ELEMENT_ID}>
      <div className="item-details__details safe-deal-loader-header">
        <img src={IMAGE_SAFE_DEAL} alt="Safe Deal" className="item-details__image__icon" />
        <div className="item-details__title text">{t("loading_product")}</div>
      </div>
      <LoaderSpinner />
    </div>
  );
}

export function ToolbarLoader() {
  return (
    <div className={MODIFIED_PAGES_CSS_CLASS}>
      <div id={LOADER_ELEMENT_ID}>
        <LoaderSpinner />
      </div>
    </div>
  );
}
