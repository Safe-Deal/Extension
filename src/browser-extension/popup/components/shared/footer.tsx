import * as React from "react";
import { t } from "../../../../constants/messages";
import { VERSION } from "../../../../utils/extension/utils";

export default function Footer() {
  return (
    <footer className="safe-deal-popup__footer">
      <div className="safe-deal-popup__footer__container">
        <div className="safe-deal-popup__footer__message">{t("popup_title")}</div>
        <div className="safe-deal-popup__footer__version">
          {new Date().getFullYear()} &copy; - <small>v{VERSION}</small>
        </div>
      </div>
    </footer>
  );
}
