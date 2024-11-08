import styled from "@emotion/styled";
import CloseIcon from "@mui/icons-material/Close";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Paper from "@mui/material/Paper";
import classNames from "classnames";
import React, { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../../../../store/AuthState";
import { isRtl, messages, t } from "../../../../constants/messages";
import { SdDealsCouponsApp } from "../../../apps/deals-amazon/ui/DealsCouponsApp";
import { ProductStore } from "../../../engine/logic/conclusion/conclusion-product-entity.interface";
import { SiteUtil } from "../../../engine/logic/utils/site-utils";
import { useDraggable } from "../../hooks/useDraggable";
import { usePersistentState } from "../../hooks/usePersistentState";
import { Z_INDEX_TOP } from "../constants";
import { InitialLoader } from "../shared/InitialLoader";
import { Tooltips } from "../shared/Tooltip";
import { PinButton } from "./components/PinButton";
import LoginPrompt from "./LoginPrompt";

const DELAY_BEFORE_OPEN_AGAIN = 250;
const IS_PINNED_STORAGE_KEY = "safe_deal_pinned_toolbar";

export interface FloatingToolbarProps {
  Minimal: JSX.Element;
  Full: JSX.Element;
  isLoading: boolean;
}

export enum ToolbarSize {
  MAXIMAL,
  MINIMAL
}

const MinimalWrapper = styled.div`
  background-color: #fff;
`;

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ Minimal, Full, isLoading }) => {
  const { session } = useAuthStore((state) => ({
    session: state.session
  }));
  const isAlibabaSite = SiteUtil.getStore() === ProductStore.ALIBABA;
  const toolbarRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const dialogueRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<ToolbarSize>(ToolbarSize.MINIMAL);
  const [isPinned, setIsPinned] = usePersistentState(IS_PINNED_STORAGE_KEY, false);
  const { position, handleMouseDown } = useDraggable(handleRef);
  const [location, setLocation] = useState<{ y: number }>(position);
  const [isClosing, setIsClosing] = useState(false);
  const timeoutId = useRef(null);
  const canMaximize = !(Full === null || Full === undefined);
  const isWholeSale = SiteUtil.isWholesale();
  const store = SiteUtil.getStore();
  const showCoupons = store === ProductStore.AMAZON && isWholeSale;
  const showDeals = store === ProductStore.ALI_EXPRESS;
  const isItemDetail = SiteUtil.isItemDetails();
  const isWholesale = SiteUtil.isWholesale();
  const isMinimalList =
    (store === ProductStore.ALI_EXPRESS && isItemDetail) || (store === ProductStore.ALI_EXPRESS && isWholesale);

  useEffect(() => {
    if (toolbarRef.current) {
      const { offsetHeight } = toolbarRef.current;
      const dialogueHeight = dialogueRef.current?.offsetHeight;
      setLocation({ y: Math.max(position.y - offsetHeight - (dialogueHeight || 0), 0) });
    }
  }, [position.y, toolbarRef.current?.offsetHeight, dialogueRef.current?.offsetHeight, isLoading, size]);

  const handleMinimize = () => {
    setIsClosing(true);
    timeoutId.current = setTimeout(() => {
      setIsClosing(false);
    }, DELAY_BEFORE_OPEN_AGAIN);
    setIsPinned(false);
    setSize(ToolbarSize.MINIMAL);
  };

  const handleMaximize = () => {
    if (isClosing || !Full) {
      return;
    }

    if (size === ToolbarSize.MINIMAL) {
      setSize(ToolbarSize.MAXIMAL);
    }
  };

  const handleToggleSize = () => {
    setSize((currentSize) => (currentSize === ToolbarSize.MINIMAL ? ToolbarSize.MAXIMAL : ToolbarSize.MINIMAL));
  };

  const handleClose = (e) => {
    e.stopPropagation();
    e.preventDefault();
    handleMinimize();
  };

  const handlePin = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsPinned(!isPinned);
  };

  const handleClickAway = () => {
    if (!isPinned && !isLoading) {
      handleMinimize();
    }
  };

  const handleKeyboardShortcut = (event) => {
    if (event.key === "Escape") {
      handleMinimize();
      return;
    }

    if (event.altKey && event.code === "KeyD") {
      handleToggleSize();
    }
  };

  useEffect(() => {
    if (isPinned && Full) {
      handleMaximize();
    }
    window.addEventListener("keydown", handleKeyboardShortcut);

    return () => {
      window.removeEventListener("keydown", handleKeyboardShortcut);
      clearTimeout(timeoutId.current);
    };
  }, []);

  const isRtlLang = isRtl();

  const renderContent = () => {
    if (isLoading) {
      return <InitialLoader coupons={showCoupons} isMinimal={isMinimalList} data-testid="initial-loader" />;
    }

    switch (size) {
      case ToolbarSize.MAXIMAL:
        if (Full) {
          return (
            <div ref={dialogueRef} className="floating-toolbar">
              <div
                className={classNames("floating-toolbar__action-buttons", {
                  "floating-toolbar__action-buttons--rtl": isRtlLang,
                  "floating-toolbar__action-buttons--ltr": !isRtlLang
                })}
              >
                <PinButton isPinned={isPinned} onClick={handlePin} />
                <Tooltips title={t("click_to_hide")}>
                  <CloseIcon onClick={(e) => handleClose(e)} data-testid="close-icon" />
                </Tooltips>
              </div>
              {isAlibabaSite ? session ? Full : <LoginPrompt /> : Full}
            </div>
          );
        }
        break;

      case ToolbarSize.MINIMAL:
        if (canMaximize && Minimal) {
          return (
            <Tooltips title={messages.open_client}>
              <div
                onClick={handleMaximize}
                className={`floating-toolbar__minimal-wrapper ${isMinimalList && "floating-toolbar__minimal-wrapper--list"}`}
                role="button"
                tabIndex={0}
                onKeyDown={handleKeyboardShortcut}
              >
                {Minimal}
              </div>
            </Tooltips>
          );
        }
        return <MinimalWrapper>{Minimal}</MinimalWrapper>;

      default:
        return null;
    }
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Paper
        className="floating-toolbar"
        elevation={3}
        ref={toolbarRef}
        style={{ top: location.y, zIndex: Z_INDEX_TOP }}
        data-testid="floating-toolbar"
      >
        <div
          className="floating-toolbar__drag-handle"
          ref={handleRef}
          onMouseDown={handleMouseDown}
          data-testid="drag-handle"
          role="button"
          aria-label="Drag Handle"
          tabIndex={0}
        >
          <DragIndicatorIcon />
        </div>
        <div className="floating-toolbar__content">
          {renderContent()}
          {showCoupons && <SdDealsCouponsApp />}
          {/*
		  // need to fix according to deals new structure
		  {showDeals && <AliSuperDealsApp />} */}
        </div>
      </Paper>
    </ClickAwayListener>
  );
};
