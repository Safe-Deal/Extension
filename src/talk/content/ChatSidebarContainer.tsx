import React from "react";
import { createRoot } from "react-dom/client";
import ProductChat from "../ProductChat";

const CONTAINER_ID = "safe-deal-chat-sidebar-container";

const ChatSidebarContainer: React.FC = () => (
  <div id={CONTAINER_ID} className="fixed left-0 top-0 h-screen bg-white">
    <ProductChat product={{ product: { url: window.location.href } }} width="100%" height="100%" />
  </div>
);

// Function to inject the sidebar into the page
export function injectChatSidebar() {
  const existingContainer = document.getElementById(CONTAINER_ID);
  if (existingContainer) {
    return;
  }

  const container = document.createElement("div");
  container.id = `${CONTAINER_ID}-root`;
  document.body.appendChild(container);

  // Push body content to the right
  const bodyStyle = document.createElement("style");
  bodyStyle.textContent = `
    body {
      margin-left: 400px !important;
      width: calc(100% - 400px) !important;
      transition: margin-left 0.3s ease-in-out;
    }
  `;
  document.head.appendChild(bodyStyle);

  const root = createRoot(container);
  root.render(<ChatSidebarContainer />);
}

export default ChatSidebarContainer;
