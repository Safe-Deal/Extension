import Box from "@mui/material/Box";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import React, { useState } from "react";
import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  MailruIcon,
  MailruShareButton,
  OKIcon,
  OKShareButton,
  RedditIcon,
  RedditShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton,
  VKIcon,
  VKShareButton,
  ViberIcon,
  ViberShareButton,
  WeiboIcon,
  WeiboShareButton,
  WhatsappIcon,
  WhatsappShareButton
} from "react-share";
import { t } from "../../constants/messages";
import { SHARE_ICON } from "../../constants/visual";

interface SharePopupProps {
  shareLink: string;
}

export const SocialShare = ({ shareLink }: SharePopupProps) => {
  const [open, setOpen] = useState(false);
  const handleClickAway = () => {
    setOpen(false);
  };
  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Tooltip
        title={
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              margin: "4px 4px 1px 4px",
              padding: "4px 4px 1px 4px",
              maxWidth: "260px"
            }}
          >
            <FacebookShareButton url={shareLink}>
              <FacebookIcon size={32} round />
            </FacebookShareButton>
            <TwitterShareButton url={shareLink}>
              <TwitterIcon size={32} round />
            </TwitterShareButton>
            <WhatsappShareButton url={shareLink}>
              <WhatsappIcon size={32} round />
            </WhatsappShareButton>
            <LinkedinShareButton url={shareLink}>
              <LinkedinIcon size={32} round />
            </LinkedinShareButton>
            <EmailShareButton url={shareLink}>
              <EmailIcon size={32} round />
            </EmailShareButton>
            <TelegramShareButton url={shareLink}>
              <TelegramIcon size={32} round />
            </TelegramShareButton>
            <VKShareButton url={shareLink}>
              <VKIcon size={32} round />
            </VKShareButton>
            <OKShareButton url={shareLink}>
              <OKIcon size={32} round />
            </OKShareButton>
            <RedditShareButton url={shareLink}>
              <RedditIcon size={32} round />
            </RedditShareButton>
            <MailruShareButton url={shareLink}>
              <MailruIcon size={32} round />
            </MailruShareButton>
            <ViberShareButton url={shareLink}>
              <ViberIcon size={32} round />
            </ViberShareButton>
            <WeiboShareButton url={shareLink}>
              <WeiboIcon size={32} round />
            </WeiboShareButton>
          </Box>
        }
        onClick={() => setOpen(!open)}
        open={open}
        arrow
      >
        <Button className="deals-table__cell--share__button">
          {t("share")} <img className="deals-table__cell--share__button__icon" src={SHARE_ICON} alt="share" />
        </Button>
      </Tooltip>
    </ClickAwayListener>
  );
};
