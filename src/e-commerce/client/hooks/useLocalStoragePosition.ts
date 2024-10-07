import { useState, useEffect } from "react";
import { debug } from "../../../utils/analytics/logger";
import { browserLocalStorage } from "../../../utils/site/site-storage";

const STORAGE_KEY = "safe_deal_position";

export const useLocalStoragePosition = (initialPosition) => {
  const [position, setPosition] = useState(() => {
    try {
      const storedData = browserLocalStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const { position, screenSize } = JSON.parse(storedData);
        const currentScreenSize = { width: window.innerWidth, height: window.innerHeight };

        if (screenSize.width === currentScreenSize?.width && screenSize.height === currentScreenSize.height) {
          return position;
        }
        return initialPosition;
      }
      return initialPosition;
    } catch (e) {
      debug(e);
      return initialPosition;
    }
  });

  useEffect(() => {
    const currentScreenSize = { width: window.innerWidth, height: window.innerHeight };
    const dataToStore = { position, screenSize: currentScreenSize };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
  }, [position]);

  return [position, setPosition];
};
