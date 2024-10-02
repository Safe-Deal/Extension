import { logError } from "../analytics/logger";
import { ext } from "./ext";

export const showBadge = async () => {
  try {
    if (ext.action) {
      await ext.action.setBadgeBackgroundColor({ color: "#dff7ec" });
      await ext.action.setBadgeText({ text: "1" });
    }
  } catch (error) {
    logError(error, "Shutaf Worker:: showBubble");
  }
};

export const hideBadge = async () => {
  try {
    if (ext.action) {
      await ext.action.setBadgeText({ text: "" });
    }
  } catch (error) {
    logError(error, "Shutaf Worker:: hideBubble");
  }
};
