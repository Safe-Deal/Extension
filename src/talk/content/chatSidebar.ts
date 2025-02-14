import { injectChatSidebar } from "./ChatSidebarContainer";

// Initialize the chat sidebar
function initialize() {
  // Wait for the page to be fully loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectChatSidebar);
  } else {
    injectChatSidebar();
  }
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "TOGGLE_CHAT_SIDEBAR") {
    const container = document.getElementById("safe-deal-chat-sidebar-container");
    if (container) {
      // If sidebar exists, toggle it
      const isVisible = container.style.display !== "none";
      container.style.display = isVisible ? "none" : "block";
      document.body.classList.toggle("sidebar-open", !isVisible);
    } else {
      // If sidebar doesn't exist, create it
      initialize();
      document.body.classList.add("sidebar-open");
    }
    sendResponse({ success: true });
  }
});

// Initialize on script load
initialize();
