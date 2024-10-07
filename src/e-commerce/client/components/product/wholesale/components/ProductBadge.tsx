import React from "react";
import Box from "@mui/material/Box";
import { Tooltips } from "@e-commerce/client/components/shared/Tooltip";

export function CircleNumber({ number, style, description }) {
  style = style || {};
  return (
    <Tooltips title={description}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 16,
          height: 16,
          borderRadius: "50%",
          backgroundColor: style.backgroundColor,
          color: "white",
          fontSize: "8px",
          border: `1px solid ${style.borderColor}`,
          boxShadow: `0 0 6px ${style.borderColor}`,
          ...style
        }}
      >
        {number}
      </Box>
    </Tooltips>
  );
}
