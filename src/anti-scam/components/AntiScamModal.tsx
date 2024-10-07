import React, { useEffect, useState } from "react";
import { t } from "../../constants/messages";
import { IMAGE_BAD } from "../../constants/visual";
import { Z_INDEX_MAX } from "../../e-commerce/client/components/constants";
import { ANTI_SCAM_GLUE } from "../../utils/extension/glue";
import { formatString } from "../../utils/text/strings";
import { CLOSE_TAB } from "../anti-scam-worker";
import { whitelist } from "../logic/anti-scam-persistance";
import { ScamConclusion } from "../types/anti-scam";
import "./AntiScamModal.scss";

interface AntiScamProps {
  conclusion: ScamConclusion;
}

export const AntiScamModal: React.FC<AntiScamProps> = ({ conclusion }: { conclusion: ScamConclusion }) => {
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    setOpen(true);
  }, [conclusion]);

  const percent: number = conclusion?.trustworthiness ? 100 - conclusion.trustworthiness : NaN;
  const data = Number.isNaN(percent)
    ? { SafeVsUnsafePercentageAmount: `` }
    : { SafeVsUnsafePercentageAmount: `: ${percent}% ` };
  const message = formatString(t("anti_scam_dangerous_website"), data);
  const handleClose = () => setOpen(false);

  const handleLeave = () => {
    ANTI_SCAM_GLUE.send(CLOSE_TAB);
  };

  const handleStay = () => {
    const response = confirm(t("anti_scam_confirm"));
    if (response) {
      whitelist();
      handleClose();
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: Z_INDEX_MAX - 1
      }}
    >
      <div
        className="safe-deal__scam__page anti-scam-modal"
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "5px",
          maxWidth: "600px",
          width: "100%",
          margin: "0 20px"
        }}
      >
        <h2 id="anti-scam-modal-title" className="anti-scam-modal__title">
          <img src={IMAGE_BAD} alt="Danger" className="anti-scam-modal__title__image" />
          {message}
        </h2>
        <div
          className="anti-scam-modal__divider"
          style={{ margin: "20px 0", height: "1px", backgroundColor: "#ccc" }}
        />
        <div className="anti-scam-modal__actions">
          <button onClick={handleLeave} className="anti-scam-modal__button anti-scam-modal__button--stay" type="button">
            {t("anti_scam_leave")}
          </button>
          <div
            className="anti-scam-modal__divider--vertical"
            style={{ margin: "0 20px", height: "auto", backgroundColor: "#ccc", width: "1px", alignSelf: "stretch" }}
          />
          <button onClick={handleStay} className="anti-scam-modal__button anti-scam-modal__button--leave" type="button">
            {t("anti_scam_stay")}
          </button>
        </div>
      </div>
    </div>
  );
};
