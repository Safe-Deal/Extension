import React from "react";
import { ext } from "../../../../utils/extension/ext";
import { hideBadge } from "../../../../utils/extension/badges";
import { SHUTAF_GLUE } from "../../../../utils/extension/glue";

import "./AffiliationBanner.scss";
import { t } from "../../../../constants/messages";

const tabUrl = () =>
  new Promise((resolve) => {
    ext.tabs.query({ active: true, currentWindow: true }, ([currentTab]) => {
      const { url } = currentTab;
      resolve(url);
    });
  });

const AffiliationBanner = () => {
  const [affLink, setAffLink] = React.useState(null);

  SHUTAF_GLUE.client((value) => {
    if (value) {
      setAffLink(value);
      hideBadge();
    }
  });

  React.useEffect(() => {
    hideBadge();

    const affShutaf = async () => {
      tabUrl().then(async (url: string) => {
        SHUTAF_GLUE.send(url);
      });
    };
    affShutaf();
  }, []);

  if (!affLink) {
    return null;
  }

  const handleClick = () => {
    window.open(affLink, "_blank");
  };

  return (
    // eslint-disable-next-line
    <div className="affiliation-banner mdl-cell mdl-cell--12-col" onClick={handleClick}>
      {t("popup_support_us_via_affiliate_link")}
    </div>
  );
};

export default AffiliationBanner;
