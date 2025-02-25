import React, { useState, useRef, useEffect } from "react";
import { Box, Button, Card, CardContent, IconButton, InputBase, Paper, Typography, Fab } from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import LanguageIcon from "@mui/icons-material/Language";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import ImageIcon from "@mui/icons-material/Image";
import CodeIcon from "@mui/icons-material/Code";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import MinimizeIcon from "@mui/icons-material/Minimize";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import ChatIcon from "@mui/icons-material/Chat";
import { t } from "../../../../constants/messages";
import { useAuthStore } from "../../../../store/AuthState";
import "./TalkWithPageMini.scss";

interface ChatOption {
  icon: React.ReactNode;
  title: string;
  description?: string;
}

const chatOptions: ChatOption[] = [
  {
    icon: <InsertDriveFileIcon />,
    title: "Chat with your Documents",
    description: "pdf, doc, pptx, txt"
  },
  {
    icon: <LanguageIcon />,
    title: "Chat with this Webpage"
  },
  {
    icon: <SmartToyIcon />,
    title: "Chatbots"
  },
  {
    icon: <ImageIcon />,
    title: "Generate Images"
  },
  {
    icon: <CodeIcon />,
    title: "Code Interpreter",
    description: "Perform Data Analysis"
  }
];

interface TalkWithPageMiniProps {
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
  children?: React.ReactNode;
}

const TalkWithPageMini: React.FC<TalkWithPageMiniProps> = ({
  onClose,
  onMinimize,
  onMaximize,
  isMaximized = false,
  children
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [width, setWidth] = useState(380); // Default width
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleOptionClick = (index: number) => {
    setSelectedOption(index);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    // Handle sending message
    setInputValue("");
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    if (isCollapsed) return;
    e.preventDefault();
    resizingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    document.body.style.cursor = "ew-resize";
    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizingRef.current) return;
    const deltaX = startXRef.current - e.clientX;
    const newWidth = Math.max(300, Math.min(800, startWidthRef.current + deltaX));
    setWidth(newWidth);
  };

  const handleResizeEnd = () => {
    resizingRef.current = false;
    document.body.style.cursor = "default";
    document.removeEventListener("mousemove", handleResizeMove);
    document.removeEventListener("mouseup", handleResizeEnd);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Clean up event listeners
  useEffect(
    () => () => {
      document.removeEventListener("mousemove", handleResizeMove);
      document.removeEventListener("mouseup", handleResizeEnd);
    },
    []
  );

  // Add body margin when sidebar is expanded
  useEffect(() => {
    if (!isCollapsed) {
      document.body.style.transition = "margin-right 0.3s ease-in-out";
      document.body.style.marginRight = `${width}px`;
    } else {
      document.body.style.marginRight = "0";
    }

    return () => {
      document.body.style.marginRight = "0";
    };
  }, [isCollapsed, width]);

  return (
    <>
      <Fab
        color="primary"
        aria-label="chat"
        className={`talk-with-page-toggle-button ${!isCollapsed ? "hidden" : ""}`}
        onClick={toggleCollapse}
      >
        <ChatIcon />
      </Fab>

      <Paper
        className={`talk-with-page-sidebar ${isMaximized ? "maximized" : ""} ${isCollapsed ? "collapsed" : ""}`}
        elevation={3}
        ref={sidebarRef}
        style={{ width: isMaximized ? "50%" : `${width}px` }}
      >
        <div
          className="resize-handle"
          onMouseDown={handleResizeStart}
          role="button"
          tabIndex={0}
          aria-label="Resize sidebar"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              // Toggle between min and max width on keyboard interaction
              setWidth(width === 380 ? 600 : 380);
            }
          }}
        >
          <DragHandleIcon />
        </div>
        <Box className="talk-header">
          <Box className="talk-header-actions">
            <IconButton size="small" onClick={onMinimize}>
              <MinimizeIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onMaximize}>
              <OpenInFullIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={toggleCollapse}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        <Box className="talk-content">
          {selectedOption === null ? (
            <Box className="chat-options">
              {chatOptions.map((option, index) => (
                <Card key={index} className="chat-option-card" onClick={() => handleOptionClick(index)}>
                  <CardContent>
                    <Box className="chat-option-content">
                      {option.icon}
                      <Box>
                        <Typography variant="subtitle1">{option.title}</Typography>
                        {option.description && (
                          <Typography variant="caption" color="textSecondary">
                            {option.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Box className="chat-interface">
              {/* Chat messages would go here */}
              <Box className="chat-input-container">
                <Paper className="chat-input-wrapper">
                  <InputBase
                    className="chat-input"
                    placeholder="Start Chatting Now"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    multiline
                    maxRows={4}
                  />
                  <Box className="chat-input-actions">
                    <IconButton size="small">
                      <MicIcon />
                    </IconButton>
                    <IconButton size="small">
                      <AttachFileIcon />
                    </IconButton>
                    <IconButton size="small" color="primary" onClick={handleSendMessage} disabled={!inputValue.trim()}>
                      <SendIcon />
                    </IconButton>
                  </Box>
                </Paper>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </>
  );
};

export default TalkWithPageMini;
