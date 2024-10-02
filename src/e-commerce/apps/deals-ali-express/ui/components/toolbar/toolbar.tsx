import CloseIcon from "@mui/icons-material/Close";
import PercentIcon from "@mui/icons-material/Percent";
import React from "react";
import { t } from "../../../../../../constants/messages";

interface AppBarProps {
  close: () => void;
}

const AliSuperDealsAppBar: React.FC<AppBarProps> = ({ close }) => (
  <div className="sd-ae-toolbar">
    <div className="sd-ae-toolbar__content">
      <h6 className="sd-ae-toolbar__content__title">
        <PercentIcon fontSize="medium" /> {t("deals_ali_express")}
      </h6>
    </div>
    <button type="button" className="sd-ae-toolbar__close-button" onClick={close} aria-label="Close">
      <CloseIcon />
    </button>
  </div>
);

export default AliSuperDealsAppBar;
