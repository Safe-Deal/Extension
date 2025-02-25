import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import TalkWithPageMini from "../../e-commerce/client/components/talk/TalkWithPageMini";

const CONTAINER_ID = "safe-deal-chat-sidebar-container";

const ChatSidebarContainer: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleMinimize = () => {
    setIsMaximized(false);
  };

  return (
    <div id={CONTAINER_ID}>
      <TalkWithPageMini isMaximized={isMaximized} onMaximize={handleMaximize} onMinimize={handleMinimize} />
    </div>
  );
};

export function injectChatSidebar() {
  const existingContainer = document.getElementById(CONTAINER_ID);
  if (existingContainer) {
    return;
  }

  const container = document.createElement("div");
  container.id = `${CONTAINER_ID}-root`;
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<ChatSidebarContainer />);
}

export default ChatSidebarContainer;
