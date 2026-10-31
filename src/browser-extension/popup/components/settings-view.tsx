import * as React from "react";
import { useThemeStore, ThemePreference } from "@store/ThemeState";
import { t } from "../../../constants/messages";

export default function SettingsView({ tab }: { tab: number }) {
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreference(e.target.value as ThemePreference);
  };

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
      <div style={{ padding: "0 24px 24px" }}>
        <h3 style={{ margin: "0 0 8px 0" }}>{t("appearance") || "Appearance"}</h3>
        <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
          <label
            htmlFor="sd-theme-system"
            style={{ display: "inline-flex", alignItems: "center", marginRight: 16, gap: 6 }}
          >
            <input
              id="sd-theme-system"
              type="radio"
              name="theme"
              value="system"
              checked={preference === "system"}
              onChange={handleChange}
            />
            {t("theme_system") || "System"}
          </label>
          <label
            htmlFor="sd-theme-light"
            style={{ display: "inline-flex", alignItems: "center", marginRight: 16, gap: 6 }}
          >
            <input
              id="sd-theme-light"
              type="radio"
              name="theme"
              value="light"
              checked={preference === "light"}
              onChange={handleChange}
            />
            {t("theme_light") || "Light"}
          </label>
          <label
            htmlFor="sd-theme-dark"
            style={{ display: "inline-flex", alignItems: "center", marginRight: 16, gap: 6 }}
          >
            <input
              id="sd-theme-dark"
              type="radio"
              name="theme"
              value="dark"
              checked={preference === "dark"}
              onChange={handleChange}
            />
            {t("theme_dark") || "Dark"}
          </label>
        </fieldset>
      </div>
    </div>
  );
}
