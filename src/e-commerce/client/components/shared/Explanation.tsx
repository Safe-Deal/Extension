import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import Tooltip from "@mui/material/Tooltip";
import React from "react";
import { getDirection } from "../../../../utils/paint/paint-utils";

export const Explanation = ({ text }) => (
  <Tooltip
    classes={{ tooltip: "sd-rules__explanation__reason__tooltip" }}
    title={<span style={{ direction: getDirection() }}>{text}</span>}
    placement="top"
    followCursor
  >
    <HelpOutlineIcon className="sd-rules__explanation__reason__tooltip__icon" />
  </Tooltip>
);
