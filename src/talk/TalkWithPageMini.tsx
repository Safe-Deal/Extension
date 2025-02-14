import React, { useState } from "react";
import { Button, Dialog } from "@mui/material";
import { useAuthStore } from "../store/AuthState";
import { t } from "../constants/messages";
import { Z_INDEX_MAX } from "../e-commerce/client/components/constants";
import ProductChat from "./ProductChat";

interface TalkWithPageMiniProps {}

const TalkWithPageMini: React.FC<TalkWithPageMiniProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { session } = useAuthStore();

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
        size="medium"
        sx={{
          minWidth: "120px",
          textTransform: "none",
          fontWeight: "bold"
        }}
      >
        {t("talk_with_page")}
      </Button>

      <Dialog
        open={isOpen}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            height: "80vh",
            maxHeight: "80vh"
          }
        }}
        sx={{ zIndex: Z_INDEX_MAX }}
      >
        <ProductChat product={null} />
      </Dialog>
    </>
  );
};

export default TalkWithPageMini;
