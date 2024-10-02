import { throttle } from "lodash";
import { useRef, useEffect } from "react";

export const useContentModifiedObserver = (
  callback,
  options = {
    childList: true,
    subtree: true,
    attributes: true
  },
  delay = 4 * 1000
) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const targetNode = document.body;
    const debouncedCallback = throttle(
      () => {
        callbackRef.current();
      },
      delay,
      {
        leading: false,
        trailing: true
      }
    );

    const observer = new MutationObserver(() => {
      debouncedCallback();
    });

    observer.observe(targetNode, options);

    return () => {
      observer.disconnect();
      debouncedCallback.cancel();
    };
  }, [options, delay]);

  return null;
};
