import CloseIcon from "@mui/icons-material/Close";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import AppBar from "@mui/material/AppBar";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Slide from "@mui/material/Slide";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { TransitionProps } from "@mui/material/transitions";
import React from "react";

import { t } from "../../../../../../constants/messages";
import { ISuperDealProduct } from "../../../common/interfaces";
import { dialogActionsStyle, dialogContentStyle, dialogToolbarStyle } from "../analyzer/analyzer.style";
import AliSuperDealsDatatable from "../datatable/datatable";

interface SuperDealsDialogProps {
  open: boolean;
  handleClose: () => void;
  superDeals: ISuperDealProduct[];
  loadingSuperDeals: boolean;
  loadingReloadMoreDeals: boolean;
  handleReloadMoreDeals: () => void;
}

const Transition = React.forwardRef(
  (props: TransitionProps & { children?: React.ReactElement<any, any> }, ref: React.Ref<unknown>) => (
    <Slide direction="up" ref={ref} {...props} children={props.children} />
  )
);

const SuperDealsDialog: React.FC<SuperDealsDialogProps> = ({
  open,
  handleClose,
  superDeals,
  loadingSuperDeals,
  loadingReloadMoreDeals,
  handleReloadMoreDeals
}) => (
  <Dialog open={open} TransitionComponent={Transition} keepMounted onClose={handleClose} fullScreen fullWidth>
    <AppBar position="static">
      <Toolbar sx={dialogToolbarStyle}>
        <IconButton
          edge="start"
          color="inherit"
          onClick={handleReloadMoreDeals}
          disabled={loadingReloadMoreDeals}
          aria-label="reload"
        >
          <RotateRightIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {t("deals_ali_express")}
        </Typography>
        <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
    <DialogContent sx={dialogContentStyle}>
      <AliSuperDealsDatatable deals={superDeals} loading={loadingSuperDeals} />
    </DialogContent>
    <DialogActions sx={dialogActionsStyle} />
  </Dialog>
);

export default SuperDealsDialog;
