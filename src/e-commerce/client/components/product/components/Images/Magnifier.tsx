import React from "react"
import Magnifier from "react-magnifier"

interface MagnifierProps {
  src: string;
}

export const ImageMagnifier: React.FC<MagnifierProps> = ({ src }) => (
	<Magnifier
		width="auto"
		height="99%"
		src={src}
		mgShape="circle"
		mgShowOverflow={false}
		mgWidth={110}
		mgHeight={110}
		zoomFactor={2.14}
	/>
)
