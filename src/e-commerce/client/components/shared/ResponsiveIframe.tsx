import React from "react";
import Iframe from "react-iframe";

export const ResponsiveIframe = ({ src, onLoad }) => (
  <Iframe
    url={src}
    width="100%"
    height="100%"
    className="sd_opinions__responsive-iframe"
    display="block"
    position="initial"
    onLoad={onLoad}
  />
);
