import React from "react";
import { createRoot } from "react-dom/client";
import { initPegasusTransport } from "@utils/pegasus/transport/popup";
import { authStoreReady } from "@store/AuthState";
import { themeStoreReady, initThemeStoreBackend, registerSystemThemeListener, useThemeStore } from "@store/ThemeState";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import { getSafeDealTheme } from "@utils/react/theme";
import Popup from "./Popup";

initPegasusTransport();

function PopupApp() {
  const effective = useThemeStore((s) => s.effective);
  return (
    <ThemeProvider theme={getSafeDealTheme(effective)}>
      <Popup />
    </ThemeProvider>
  );
}

// Render immediately; initialize stores asynchronously to avoid blocking UI
const root = createRoot(document.getElementById("popup") as HTMLElement);
root.render(<PopupApp />);

(async () => {
  try {
    await initThemeStoreBackend();
    await themeStoreReady();
    registerSystemThemeListener();
    // Kick off auth store readiness without blocking render
    authStoreReady().catch(() => {});
  } catch {
    // ignore for popup rendering
  }
})();
