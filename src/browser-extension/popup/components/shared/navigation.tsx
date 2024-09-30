import * as React from "react";
import { t } from "../../../../constants/messages";
import { ICON_CLOSE_POPUP } from "../../../../constants/visual";

export default function Navigation() {
  const navigationItems = [
    { href: "https://shop.joinsafedeal.com/", text: t("popup_shop_tab") },
    {
      href: "https://www.joinsafedeal.com/#benefits",
      text: t("popup_benefits_tab")
    },
    { href: "https://www.joinsafedeal.com/#about", text: t("popup_about_tab") },
    {
      href: "https://www.joinsafedeal.com/#support",
      text: t("popup_contact_us_tab")
    }
  ];

  const handleCloseClick = (event: React.MouseEvent) => {
    event.preventDefault();
    window.close();
  };
  return (
    <ul className="safe-deal-popup__navigation">
      {navigationItems.map((item) => (
        <li key={item.href} className="safe-deal-popup__navigation__item">
          <a href={item.href} target="_blank" rel="noreferrer" className="safe-deal-popup__navigation__link">
            {item.text}
          </a>
        </li>
      ))}
      <li className="safe-deal-popup__navigation__item">
        <button
          type="button"
          className="safe-deal-popup__navigation__link safe-deal-popup__navigation__link--close"
          onClick={handleCloseClick}
        >
          <img src={ICON_CLOSE_POPUP} alt={t("close")} />
        </button>
      </li>
    </ul>
  );
}
