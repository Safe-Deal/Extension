import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { initPegasusZustandStoreBackend, pegasusZustandStoreReady } from "@utils/pegasus/store-zustand";

export const STORE_NAME = "globalThemeState";

export type ThemePreference = "system" | "light" | "dark";
export type EffectiveTheme = "light" | "dark";

type ThemeState = {
  preference: ThemePreference;
  effective: EffectiveTheme;
  setPreference: (preference: ThemePreference) => void;
  setEffective: (effective: EffectiveTheme) => void;
};

export const useThemeStore = create<ThemeState>()(
  subscribeWithSelector((set, get) => ({
    preference: "system",
    effective: "light",
    setPreference: (preference) => {
      set({ preference });
      // Update effective immediately if switching away from system
      if (preference === "light" || preference === "dark") {
        set({ effective: preference });
      } else {
        // System: recompute from media
        const isDark =
          typeof window !== "undefined" &&
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;
        set({ effective: isDark ? "dark" : "light" });
      }
    },
    setEffective: (effective) => set({ effective })
  }))
);

export const initThemeStoreBackend = () =>
  initPegasusZustandStoreBackend(STORE_NAME, useThemeStore, {
    storageStrategy: "indexedDb"
  });

export const themeStoreReady = () => pegasusZustandStoreReady(STORE_NAME, useThemeStore);

/**
 * Attach a listener to system color scheme changes that updates the store's effective theme
 * when the user preference is set to "system".
 */
export function registerSystemThemeListener(): () => void {
  if (typeof window === "undefined" || !window.matchMedia) {
    return () => {};
  }
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const updateFromSystem = () => {
    const { preference, setEffective } = useThemeStore.getState();
    if (preference === "system") {
      setEffective(media.matches ? "dark" : "light");
    }
  };
  // Initialize once
  updateFromSystem();
  media.addEventListener?.("change", updateFromSystem);
  // Fallback for older chromium
  // @ts-ignore
  media.addListener?.(updateFromSystem);
  return () => {
    media.removeEventListener?.("change", updateFromSystem);
    // @ts-ignore
    media.removeListener?.(updateFromSystem);
  };
}
