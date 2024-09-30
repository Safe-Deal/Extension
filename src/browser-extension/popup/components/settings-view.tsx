import * as React from "react";
import { t } from "../../../constants/messages";

export default function SettingsView({ tab }: { tab: number }) {
  return (
    <div className="content">
      <div
        style={{
          width: "100%",
          textAlign: "center",
          verticalAlign: "middle",
          marginBottom: "14px",
          marginTop: "24px"
        }}
        className="mdl-layout-title"
      >
        {t("supported_websites")}
      </div>
    </div>
  );
}
