import React from "react";
import { createRoot } from "react-dom/client";
import { initPegasusTransport } from "@utils/pegasus/transport/popup";
import { authStoreReady } from "@store/AuthState";
import Popup from "./Popup";

initPegasusTransport();

authStoreReady().then(() => {
  createRoot(document.getElementById("popup") as HTMLElement).render(<Popup />);
});
