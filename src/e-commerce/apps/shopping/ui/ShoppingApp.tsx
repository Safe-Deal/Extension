import { SHOPPING_URL } from "@constants/api-params";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCart from "@mui/icons-material/ShoppingCart";
import { Button, Dialog, DialogContent, DialogTitle } from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import { useAuthStore } from "@store/AuthState";
import { shoppingAppStoreReady, useShoppingAppStore } from "@store/ShoppingAppState";
import { useSupplierStore } from "@store/SupplierState";
import React, { useEffect, useMemo } from "react";
import IframeComm from "react-iframe-comm";

function ShoppingApp() {
  const { open, setOpen, action } = useShoppingAppStore();
  const { session, loading } = useAuthStore();
  const { supplierAiDTO } = useSupplierStore();

  useEffect(() => {
    shoppingAppStoreReady();
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const url = useMemo(() => {
    if (!session || loading) return;
    const baseUrl = new URL(SHOPPING_URL);
    baseUrl.searchParams.set("session", JSON.stringify(session));
    return baseUrl;
  }, [session, loading]);

  const data = useMemo(
    () => ({
      type: "DATA",
      supplierAiDTO,
      action
    }),
    [supplierAiDTO, action]
  );

  const attributes = {
    src: url?.toString(),
    width: "100%",
    height: "100%",
    frameBorder: 1
  };

  const onReceiveMessage = (data: any) => {
    // console.log("Message received from iframe:", data);
    // TODO: Handle the successful addition and removal here to manage favorite state
  };

  const onReady = () => {
    console.log("Iframe is fully loaded and ready for communication.");
  };

  return (
    <div>
      <Button
        sx={{ width: "52px", height: "30px", minWidth: "50px", borderRadius: "8px 0 0 8px" }}
        variant="contained"
        onClick={handleClickOpen}
      >
        <ShoppingCart />
      </Button>
      <Dialog sx={{ zIndex: "9999" }} open={open} onClose={handleClose} fullWidth fullScreen keepMounted>
        <DialogTitle>
          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <p>Shopping Lists</p>
            </Grid2>
            <Grid2
              sx={{
                display: "flex",
                justifyContent: "flex-end"
              }}
              size={6}
            >
              <Button onClick={handleClose} color="primary">
                <CloseIcon color="success" />
              </Button>
            </Grid2>
          </Grid2>
        </DialogTitle>
        <DialogContent>
          <IframeComm
            attributes={attributes}
            postMessageData={data}
            handleReceiveMessage={onReceiveMessage}
            handleReady={onReady}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ShoppingApp;
