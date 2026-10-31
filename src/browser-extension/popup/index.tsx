import React from "react";
import { createRoot } from "react-dom/client";
import { initPegasusTransport } from "@utils/pegasus/transport/popup";
import { authStoreReady } from "@store/AuthState";
import { themeStoreReady, initThemeStoreBackend, registerSystemThemeListener } from "@store/ThemeState";
import Popup from "./Popup";

initPegasusTransport();

Promise.all([authStoreReady(), initThemeStoreBackend(), themeStoreReady()]).then(() => {
  registerSystemThemeListener();
  createRoot(document.getElementById("popup") as HTMLElement).render(<Popup />);
});
