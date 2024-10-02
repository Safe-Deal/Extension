import React, { forwardRef } from "react";
import { TransitionProps } from "@mui/material/transitions";
import Slide from "@mui/material/Slide";

const Transition = forwardRef(
  (
    props: TransitionProps & {
      children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>
  ) => <Slide direction="up" ref={ref} {...props} />
);

export default Transition;
