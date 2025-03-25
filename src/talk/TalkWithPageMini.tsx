import React, { useState } from "react";
import { Button, Drawer } from "@mui/material";
import { useAuthStore } from "../store/AuthState";
import { t } from "../constants/messages";
import { Z_INDEX_MAX } from "../e-commerce/client/components/constants";
import ProductChat from "./ProductChat";

const TalkWithPageMini: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { session } = useAuthStore();

  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
        size="small"
        sx={{
          textTransform: "none",
          fontWeight: "bold"
        }}
      >
        {t("talk_with_page")}
      </Button>

      <Drawer
        anchor="right"
        open={isOpen}
        onClose={handleOpen}
        variant="persistent"
        sx={{
          "& .MuiDrawer-paper": {
            position: "relative",
            width: "400px",
            height: "100vh",
            borderLeft: "1px solid rgba(0, 0, 0, 0.12)",
            boxShadow: "none"
          },
          "& .MuiBackdrop-root": {
            display: "none"
          }
        }}
      >
        <ProductChat product={null} />
      </Drawer>
    </>
  );
};

export default TalkWithPageMini;
