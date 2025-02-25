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

    if (!container) {
      // If sidebar doesn't exist, create it
      initialize();
    }

    // The toggle functionality is now handled by the TalkWithPageMini component
    // We just need to make sure the sidebar is injected
    sendResponse({ success: true });
  }
});

initialize();
