import React, { useState, useMemo } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import ShoppingCart from "@mui/icons-material/ShoppingCart";
import CloseIcon from "@mui/icons-material/Close";
import { useAuthStore } from "@store/AuthState";
import { ResponsiveIframe } from "@e-commerce/client/components/shared/ResponsiveIframe";
import { SHOPPING_URL } from "@constants/api-params";

function ShoppingApp() {
  const [open, setOpen] = useState(false);
  const { session, loading } = useAuthStore();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const url = useMemo(() => {
    if (!session || loading) return;
    const baseUrl = new URL(SHOPPING_URL);
    // baseUrl.searchParams.set("product", JSON.stringify(productData));
    //baseUrl.searchParams.set("action", action);
    baseUrl.searchParams.set("session", JSON.stringify(session));

    return baseUrl;
  }, [session, loading]);

  return (
    <div>
      <Button
        sx={{ width: "52px", height: "60px", minWidth: "50px", borderRadius: "0 0 0 8px" }}
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
          <ResponsiveIframe onLoad={() => {}} src={url} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ShoppingApp;
