import { useCallback } from "react";
import { useLocalStoragePosition } from "./useLocalStoragePosition";
import { useInitialPosition } from "./useInitialPosition";

export interface Position {
  y: number;
}

export const useDraggable = (elementRef: React.RefObject<HTMLElement>) => {
  const initialPosition = useInitialPosition(elementRef);
  const [position, setPosition] = useLocalStoragePosition(initialPosition);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (elementRef.current) {
        event.preventDefault();
        event.stopPropagation();

        const startY = event.clientY - position.y;

        const handleMouseMove = (moveEvent: MouseEvent) => {
          let newY = moveEvent.clientY - startY;
          if (elementRef.current) {
            const elementHeight = elementRef.current.offsetHeight;
            newY = Math.max(0, Math.min(newY, window.innerHeight - elementHeight));
          }
          setPosition((prevPosition) => ({ ...prevPosition, y: newY }));
        };

        const handleMouseUp = () => {
          window.removeEventListener("mousemove", handleMouseMove);
          window.removeEventListener("mouseup", handleMouseUp);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
      }
    },
    [position, setPosition, elementRef]
  );

  return { position, handleMouseDown };
};
