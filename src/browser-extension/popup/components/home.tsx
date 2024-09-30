import React from "react";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";

import {
  LINKEDIN_ICON,
  TWITTER_ICON,
  FACEBOOK_ICON,
  WHATSAPP_ICON,
  TELEGRAM_ICON,
  REDDIT_ICON,
  EMAIL_ICON,
  CHAT_ICON,
  IMAGE_SAFE_DEAL
} from "../../../constants/visual";
import { messages, t } from "../../../constants/messages";
import AffiliationBanner from "./affiliation/AffiliationBanner";

export const Home = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const toggleDropdown = () => setIsOpen(!isOpen);

  const safeDealShareLink = "https://www.joinsafedeal.com/go?type=extension-share-button";
  const socialMedia = [
    {
      name: "twitter",
      url: "https://twitter.com/intent/tweet?url=",
      icon: TWITTER_ICON
    },
    {
      name: "linkedin",
      url: "https://www.linkedin.com/shareArticle?url=",
      icon: LINKEDIN_ICON
    },
    {
      name: "facebook",
      url: "https://www.facebook.com/sharer/sharer.php?u=",
      icon: FACEBOOK_ICON
    },
    {
      name: "whatsapp",
      url: "https://api.whatsapp.com/send?text=",
      icon: WHATSAPP_ICON
    },
    {
      name: "telegram",
      url: "https://telegram.me/share/url?url=",
      icon: TELEGRAM_ICON
    },
    {
      name: "reddit",
      url: "https://reddit.com/submit?url=",
      icon: REDDIT_ICON
    },
    {
      name: "email",
      url: "mailto:?body=",
      icon: EMAIL_ICON
    }
  ];

  return (
    <div className="safe-deal-popup__home">
      <div className="safe-deal-popup__home__container">
        <AffiliationBanner />
        <div className="safe-deal-popup__home__share">
          <h5 className="safe-deal-popup__home__share__title">{t("popup_footer_share")}</h5>
          <div className="safe-deal-popup__home__share__icons">
            {socialMedia.map((social) => (
              <a
                className="safe-deal-popup__home__share__icons__link"
                key={social.name}
                href={`${social.url}${encodeURIComponent(safeDealShareLink)}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                <img src={social.icon} alt={social.name} />
              </a>
            ))}
          </div>
          <a
            className="safe-deal-popup__home__share__feedback"
            href="https://www.joinsafedeal.com/feedback/"
            target="_blank"
            rel="noreferrer noopener"
          >
            <img src={CHAT_ICON} alt="chat" />
            {messages.tour_feedback_title}
          </a>
          <a
            className="safe-deal-popup__home__share__feedback"
            href="https://www.joinsafedeal.com/mobile"
            target="_blank"
            rel="noreferrer noopener"
          >
            <img src={IMAGE_SAFE_DEAL} alt="chat" />
            {t("mobile_app")}
          </a>
        </div>

        <div className="safe-deal-popup__home__dropdown">
          <button className="safe-deal-popup__home__dropdown__button" type="button" onClick={toggleDropdown}>
            {t("why_it_free")}
            {isOpen ? <ExpandLess /> : <ExpandMore />}
          </button>
          {isOpen && (
            <div className="safe-deal-popup__home__dropdown__content">
              <p>{t("explanations_why_it_free_line_1")}</p>
              <p>{t("explanations_why_it_free_line_2")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
