import React from "react";
import ReactDOM from "react-dom/client";
import { SafeDealPages, initPageDisplay } from "../../constants/display";
import { ScamConclusion } from "../types/anti-scam";
import { debug } from "../../utils/analytics/logger";
import { AntiScamModal } from "../components/AntiScamModal";

export const paintAntiScam = (conclusion: ScamConclusion): void => {
  debug("AntiScam :: paintAntiScam .... ");
  initPageDisplay(document, SafeDealPages.ScamPage);
  const rootElement = document.createElement("div");
  rootElement.id = "safe-deal-anti-scam-root";
  document.body.appendChild(rootElement);
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <AntiScamModal conclusion={conclusion} />
    </React.StrictMode>
  );
  debug("AntiScam :: paintAntiScam Done");
};
