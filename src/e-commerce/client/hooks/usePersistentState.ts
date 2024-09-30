import { useState, useEffect } from "react";
import { browserLocalStorage } from "../../../utils/site/site-storage";

export const usePersistentState = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    const storedValue = browserLocalStorage.getItem(key);
    return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
  });

  useEffect(() => {
    browserLocalStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
};
