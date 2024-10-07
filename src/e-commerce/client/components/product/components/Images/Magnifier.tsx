import React from "react";
import Magnifier from "react-magnifier";
import "./Magnifier.scss";

interface MagnifierProps {
  src: string;
}

export const ImageMagnifier: React.FC<MagnifierProps> = ({ src }) => (
  <Magnifier
    width="100%"
    height="auto"
    src={src}
    mgShape="circle"
    mgShowOverflow={false}
    mgWidth={110}
    mgHeight={110}
    zoomFactor={2.14}
  />
);
