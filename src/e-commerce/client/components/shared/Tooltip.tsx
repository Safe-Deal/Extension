import Tooltip from "@mui/material/Tooltip";
import React from "react";
import { Z_INDEX_TOP } from "../constants";

export const Tooltips = (props) => (
  <Tooltip {...props} PopperProps={{ style: { zIndex: Z_INDEX_TOP } }} enterDelay={600} placement="top" />
);
