import React, { forwardRef } from "react";

export const ResponsiveIframe = forwardRef<HTMLIFrameElement, { src: string; onLoad?: () => void }>((props, ref) => (
  <iframe ref={ref} {...props} style={{ width: "100%", height: "100%", border: "none" }} title=" " />
));
