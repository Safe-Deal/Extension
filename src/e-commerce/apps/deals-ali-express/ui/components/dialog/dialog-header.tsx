import RotateRightIcon from "@mui/icons-material/RotateRight";
import React from "react";
import { t } from "../../../../../../constants/messages";
import { ISuperDealProduct } from "../../../common/interfaces";

interface AliSuperDealsDialogContentHeaderProps {
  superDeals: ISuperDealProduct[];
  handleReloadMoreDeals: () => void;
  loadingReloadMoreDeals: boolean;
}
function AliSuperDealsDialogContentHeader({
  superDeals,
  handleReloadMoreDeals,
  loadingReloadMoreDeals
}: AliSuperDealsDialogContentHeaderProps) {
  return (
    <div className="sd-ae-dialog-header">
      <span className="sd-ae-dialog-header__title">{t("deals_ali_found")}</span>
      <span className="sd-ae-dialog-header__count">{superDeals?.length}</span>
      <button
        type="button"
        className="sd-ae-dialog-header__reload-button"
        onClick={handleReloadMoreDeals}
        aria-label="Reload More Deals"
      >
        <RotateRightIcon className={loadingReloadMoreDeals ? "rotate-icon" : ""} /> Refresh
      </button>
    </div>
  );
}
export default AliSuperDealsDialogContentHeader;
