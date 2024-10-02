import * as React from "react";
import { Home } from "./components/home";
import Footer from "./components/shared/footer";
import Navigation from "./components/shared/navigation";
import Title from "./components/shared/title";

import { LOCALE, LOCALE_DIRECTION } from "../../utils/extension/locale";
import "./Popup.scss";

export default function Popup() {
  return (
    <div
      lang={LOCALE}
      style={{
        direction: LOCALE_DIRECTION
      }}
      className="safe-deal-popup safe-deal-popup__container"
    >
      <header className="safe-deal-popup__header">
        <div className="safe-deal-popup__header__row">
          <Title />
          <Navigation />
        </div>
      </header>
      <main className="safe-deal-popup__content">
        <div>
          <Home />
        </div>
      </main>
      <Footer />
    </div>
  );
}
