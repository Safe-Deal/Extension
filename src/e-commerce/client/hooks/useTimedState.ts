import { useEffect, useRef, useState } from "react";

const DEFAULT_TIMEOUT_IN_SECONDS = 120;

export const useTimedState = <T>(
  initialValue: T,
  defaultValue: T,
  timeoutInSeconds: number = DEFAULT_TIMEOUT_IN_SECONDS * 1000
): [T, (newValue: T) => void] => {
  const [value, setValue] = useState<T>(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setValue(defaultValue), timeoutInSeconds);
  };

  const updateValue = (newValue: T) => {
    setValue(newValue);
    resetTimeout();
  };

  useEffect(() => {
    resetTimeout();
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value]);

  return [value, updateValue];
};
