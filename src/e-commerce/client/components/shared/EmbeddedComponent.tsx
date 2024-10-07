import React, { useEffect, useState } from "react";
import { addParameterToUrl } from "@utils/dom/location";
import { LOCALE } from "../../../../utils/extension/locale";
import { ResponsiveIframe } from "./ResponsiveIframe";
import { LoaderSpinner } from "./Loader";
import "./EmbeddedComponent.scss";

interface IEmbeddedComponent {
  iframeUrl: string;
  className: string;
}

const ORIGIN = "https://www.joinsafedeal.com";
// const ORIGIN = "http://localhost:3000";

export const EmbeddedComponent = ({ iframeUrl, className }: IEmbeddedComponent) => {
  const [loading, setLoading] = useState(true);
  const [targetUrl, setTargetUrl] = useState(iframeUrl);

  useEffect(() => {
    setLoading(true);
    let url = addParameterToUrl(`${ORIGIN}${iframeUrl}`, "lang", LOCALE);
    url = addParameterToUrl(url, "rnd", Math.random().toString());

    setTargetUrl(url);
  }, [iframeUrl]);

  const onIframeLoad = () => {
    setLoading(false);
  };

  return (
    <div className={`sd-embedded_container ${className}`}>
      {loading && <LoaderSpinner />}
      <ResponsiveIframe src={targetUrl} onLoad={onIframeLoad} />
    </div>
  );
};
