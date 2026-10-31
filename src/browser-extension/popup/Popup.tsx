import * as React from "react";
import { useThemeStore } from "@store/ThemeState";
import { Home } from "./components/home";
import Footer from "./components/shared/footer";
import Navigation from "./components/shared/navigation";
import Title from "./components/shared/title";

import { LOCALE, LOCALE_DIRECTION } from "../../utils/extension/locale";
import "./Popup.scss";
import SettingsView from "./components/settings-view";

type ActiveView = "home" | "settings";

export default function Popup() {
  const [activeView, setActiveView] = React.useState<ActiveView>("home");
  const effectiveTheme = useThemeStore((s) => s.effective);
  return (
    <div
      lang={LOCALE}
      style={{
        direction: LOCALE_DIRECTION
      }}
      className="safe-deal-popup safe-deal-popup__container"
      data-theme={effectiveTheme}
    >
      <header className="safe-deal-popup__header">
        <div className="safe-deal-popup__header__row">
          <Title />
          <Navigation onOpenSettings={() => setActiveView("settings")} onOpenHome={() => setActiveView("home")} />
        </div>
      </header>
      <main className="safe-deal-popup__content">
        <div>{activeView === "home" ? <Home /> : <SettingsView tab={0} />}</div>
      </main>
      <Footer />
    </div>
  );
}
