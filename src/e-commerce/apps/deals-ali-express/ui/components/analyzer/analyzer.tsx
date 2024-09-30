import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import React, { useEffect, useState } from "react";
import { browserWindow, querySelector } from "../../../../../../utils/dom/html";
import { ALI_SUPER_DEALS_GLUE } from "../../../../../../utils/extension/glue";
import { SiteMetadata } from "../../../../../../utils/site/site-information";
import { ISuperDealProduct } from "../../../common/interfaces";
import { isAliexpressCampaignPage } from "../../utils/ali-super-deals-utils-ui";
import AliSuperDealsDatatable from "../datatable/datatable";
import AliSuperDealsDialogContentHeader from "../dialog/dialog-header";
import Transition from "../dialog/dialog-transition";
import AliSuperDealsAppBar from "../toolbar/toolbar";
import { SiteUtil } from "../../../../../engine/logic/utils/site-utils";
import { ProductStore } from "../../../../../engine/logic/conclusion/conclusion-product-entity.interface";

function SuperDealsAnalyzer(): JSX.Element {
  const [open, setOpen] = useState(false);
  const [superDeals, setSuperDeals] = useState<ISuperDealProduct[]>([]);
  const [loadingSuperDeals, setLoadingSuperDeals] = useState(false);
  const [loadingReloadMoreDeals, setLoadingReloadMoreDeals] = useState(false);
  const store = SiteUtil.getStore();
  const isItemDetail = SiteUtil.isItemDetails();
  const isWholesale = SiteUtil.isWholesale();

  const isSolo = store === ProductStore.ALI_EXPRESS && !isItemDetail && !isWholesale;

  const scrollToBottom = () => {
    window.scroll({
      top: document.body.scrollHeight,
      left: 0,
      behavior: "smooth"
    });
  };

  const reloadMoreDealsMechanism = (): void => {
    setLoadingReloadMoreDeals(true);
    let count = 1;

    function myAutoScroll(): void {
      if (count) {
        count -= 1;
        // Call a function to extract the data after the lazy loading has occurred
        scrollToBottom();
        setTimeout(myAutoScroll, 1000);
      }
      if (count === 0) {
        setLoadingSuperDeals(false);
        setLoadingReloadMoreDeals(false);

        ALI_SUPER_DEALS_GLUE.send({
          pageDocument: SiteMetadata.getDomOuterHTML(browserWindow().document)
        });

        ALI_SUPER_DEALS_GLUE.client((response: any) => {
          const { result } = response;
          const { deals }: { deals: ISuperDealProduct[] } = result;
          setSuperDeals(deals);
        });
      }
    }
    setTimeout(myAutoScroll, 1000);
  };

  const handleClickOpen = () => {
    if (!isAliexpressCampaignPage()) {
      const url = querySelector(['[data-spm="superdeal"]'], document).attributes.getNamedItem("href")?.value;
      if (url) {
        window.location.href = url;
        return;
      }
      return;
    }

    setOpen(true);
    setLoadingSuperDeals(true);
    reloadMoreDealsMechanism();
  };

  const handleClose = (): void => setOpen(false);
  const handleReloadMoreDeals = (): void => reloadMoreDealsMechanism();

  useEffect(() => {
    if (isAliexpressCampaignPage()) {
      handleClickOpen();
    }
  }, []);

  return (
    <div className="sd-ae-deals">
      <button
        className={`sd-ae-deals__button ${isSolo ? "sd-ae-deals__button--solo" : ""}`}
        aria-label="add to shopping cart"
        onClick={handleClickOpen}
        type="button"
      >
        <CurrencyExchangeIcon />
      </button>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
        fullScreen
        fullWidth
        className="sd-ae-deals__dialog"
      >
        <AliSuperDealsAppBar close={handleClose} />
        <DialogContent className="sd-ae-deals__dialog__content">
          <AliSuperDealsDialogContentHeader
            loadingReloadMoreDeals={loadingReloadMoreDeals}
            handleReloadMoreDeals={handleReloadMoreDeals}
            superDeals={superDeals}
          />
          <div id="alert-dialog-slide-description">
            <AliSuperDealsDatatable deals={superDeals} loading={loadingSuperDeals} />
          </div>
        </DialogContent>
        <DialogActions className="sd-ae-deals__dialog__actions" />
      </Dialog>
    </div>
  );
}

export default SuperDealsAnalyzer;
