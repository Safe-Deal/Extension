import AttachMoney from "@mui/icons-material/AttachMoney";
import CloseIcon from "@mui/icons-material/Close";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import classNames from "classnames";
import React, { useState } from "react";
import { t } from "../../../../../constants/messages";
import { CouponsTable } from "./CouponsTable";
import { EmptyMessageCoupons } from "./modal/EmptyMessageCoupons";

import "./SdDealsCouponsRoot.scss";

export function SdDealsCouponsStickyBadgeRoot({ theme, deals = [], loadingDeals = false }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fullScreen = window.innerWidth < 600;
  const showDialog = () => setIsDialogOpen(true);
  const handleDialogClose = () => setIsDialogOpen(false);

  return (
    <div className="sd-deals-coupons">
      <Badge
        badgeContent={deals?.length}
        color="primary"
        overlap="rectangular"
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        className="sd-deals-coupons__badge"
        onClick={showDialog}
      >
        <Button
          className={classNames("sd-deals-coupons__inspector-button", {
            "deals-inspector-button--loading": loadingDeals,
            "deals-inspector-button--clickable": deals?.length > 0,
            "deals-inspector-button--none": deals?.length === 0
          })}
          variant="contained"
          color="secondary"
          // onClick={showDialog}
          startIcon={loadingDeals ? <CircularProgress size={24} color="inherit" /> : <AttachMoney />}
          size="large"
          disabled={loadingDeals}
          style={{
            opacity: loadingDeals ? 0.7 : 1,
            pointerEvents: loadingDeals ? "none" : "auto"
          }}
        />
      </Badge>

      <Dialog open={isDialogOpen} fullScreen={fullScreen} onClose={handleDialogClose}>
        <Box className="sd-deals-coupons__modal">
          <Box className="sd-deals-coupons__modal__header">
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleDialogClose}
              aria-label="close"
              style={{ position: "absolute", right: theme.spacing(3), top: theme.spacing(1) }}
            >
              <CloseIcon />
            </IconButton>
            <AttachMoney className="sd-deals-coupons__modal__header__icon" />
            <span className="sd-deals-coupons__modal__header__title">{t("coupon_header")}</span>
          </Box>
          <Box className="sd-deals-coupons__modal__content">
            {deals.length ? <CouponsTable coupons={deals} /> : <EmptyMessageCoupons />}
          </Box>
        </Box>
      </Dialog>
    </div>
  );
}
