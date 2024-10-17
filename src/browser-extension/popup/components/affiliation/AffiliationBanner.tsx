import React from "react";
import { useShutafStore, shutafStoreReady } from "@store/ShutafState";
import { ShutafMessageType, IShutafMessageBus } from "@shutaf/shutaf-worker";
import { definePegasusMessageBus } from "@utils/pegasus/transport";
import { ext } from "../../../../utils/extension/ext";
import { hideBadge } from "../../../../utils/extension/badges";

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
  const { affiliateLink: affLink } = useShutafStore();
  const { sendMessage } = definePegasusMessageBus<IShutafMessageBus>();

  React.useEffect(() => {
    hideBadge();
    const affShutaf = async () => {
      tabUrl().then(async (url: string) => {
        sendMessage(ShutafMessageType.GENERATE_AFFILIATE_LINK, url);
      });
    };
    shutafStoreReady().then(() => {
      affShutaf();
    });
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
