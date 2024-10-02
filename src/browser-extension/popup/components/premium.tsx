import * as React from "react";
import { useState } from "react";
import PremiumTerms from "./premium/premium-terms";
import WebsitesList from "./premium/websites-list";

export default function Premium() {
  const [isWebsitesList, setIsWebsitesList] = useState(false);

  const toggleWebsitesList = () => {
    setIsWebsitesList(!isWebsitesList);
  };

  function PremiumBody() {
    if (!isWebsitesList) {
      return <PremiumTerms toggle={toggleWebsitesList} />;
    }
    return <WebsitesList toggle={toggleWebsitesList} />;
  }

  return <PremiumBody />;
}
