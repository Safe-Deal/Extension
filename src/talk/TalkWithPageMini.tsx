import React, { useState } from "react";
import { Button, IconButton } from "@mui/material";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import CloseIcon from "@mui/icons-material/Close";
import { useAuthStore } from "../store/AuthState";
import { t } from "../constants/messages";
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

      <Drawer open={isOpen} onClose={handleOpen} direction="right" size={400} enableOverlay={false}>
        <div className="relative h-full">
          <IconButton
            onClick={handleOpen}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "text.secondary",
              "&:hover": {
                backgroundColor: "action.hover"
              }
            }}
            aria-label="close drawer"
          >
            <CloseIcon />
          </IconButton>
          <ProductChat url={window.location.href} />
        </div>
      </Drawer>
    </>
  );
};

export default TalkWithPageMini;
