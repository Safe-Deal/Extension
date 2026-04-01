import React, { SyntheticEvent, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Link from "@mui/material/Link";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CloseIcon from "@mui/icons-material/Close";
import { ProductStore } from "@e-commerce/engine/logic/conclusion/conclusion-product-entity.interface";
import { isRtl, t } from "@constants/messages";
import { isDomainSmallLanguage } from "@utils/multilang/languages";
import { getDomain } from "@utils/dom/html";
import { Z_INDEX_MAX } from "../../../../constants";
import { useProductResearch } from "../hooks/useProductResearch";
import { useProductName } from "../hooks/useProductName";
import ProductNameTextBox from "./ProductNameTextBox";

import "./ProductResearchLightbox.scss";

interface IProductResearchLightboxProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  store: ProductStore;
}

export const ProductResearchLightbox = ({ open, onClose, productId, store }: IProductResearchLightboxProps) => {
  const domain = getDomain();
  const isSmall = isDomainSmallLanguage(domain);
  const [productName, setProductName] = useProductName({ productId, store, isSmall });
  const [activeTab, setActiveTab] = useState(0);
  const researchTabs = useProductResearch({ productId, productName, store, isSmall });
  const activeResearchTab = researchTabs[activeTab];

  const handleChange = (_event: SyntheticEvent, selectedTab: number) => {
    setActiveTab(selectedTab);
  };

  const closePosition = isRtl() ? { left: 8 } : { right: 8 };
  const closeStyle = {
    position: "absolute",
    top: 8,
    color: (theme) => theme.palette.grey[500],
    ...closePosition
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      className="sd-product-research__dialog"
      PaperProps={{
        sx: {
          width: "calc(100% - 64px) !important",
          height: "calc(100% - 32px) !important",
          maxWidth: "none !important",
          maxHeight: "none !important"
        },
        className: "sd-product-research__dialog-paper"
      }}
      maxWidth="lg"
      sx={{ zIndex: Z_INDEX_MAX }}
    >
      <DialogTitle className="sd-product-research__header">
        <IconButton aria-label="close" onClick={onClose} sx={closeStyle}>
          <CloseIcon />
        </IconButton>
        <div className="sd-product-research__header-main">
          <div className="sd-product-research__header-title">{t("research_online")}</div>
          <ProductNameTextBox text={productName} setText={setProductName} />
        </div>
        {activeResearchTab?.Link && (
          <IconButton
            component={Link}
            href={`${activeResearchTab.Link}`}
            target="_blank"
            rel="noopener"
            className="sd-product-research__header-link"
            aria-label="open active research tab"
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        )}
      </DialogTitle>
      <AppBar position="sticky" color="transparent" elevation={0} className="sd-product-research__app-bar">
        <Toolbar className="sd-product-research__toolbar">
          <Tabs
            value={activeTab}
            onChange={handleChange}
            selectionFollowsFocus
            variant="scrollable"
            scrollButtons="auto"
            className="sd-product-research__tabs"
          >
            {researchTabs.map((tab) => (
              <Tab
                key={tab.Label}
                className="sd-product-research__tabs-tab"
                label={
                  <Box className="sd-product-research__tabs-tab-label">
                    <div className="sd-product-research__tabs-tab-label-icon">{tab.Icon}</div>
                    <div className="sd-product-research__tabs-tab-label-title">{tab.Label}</div>
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Toolbar>
      </AppBar>
      <div className="sd-product-research__content">{activeResearchTab?.Component}</div>
    </Dialog>
  );
};

export default ProductResearchLightbox;
