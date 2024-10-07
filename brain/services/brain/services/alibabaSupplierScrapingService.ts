import { ServerLogger } from "../../../utils/logging";
import { extractAlibabaData, buildAlibabaFeedbackUrl } from "../utils/alibabaHelper";
import EventSource from "eventsource";

interface AlibabaResponse {
  payload?: {
    productReview?: any;
  };
}

interface EventError extends Event {
  message?: string;
}

export const scrapeAlibabaStoreFeedbackEventStream = (
  alibabaStoreEventSourceUrl: string
): Promise<AlibabaResponse[]> => {
  return new Promise((resolve, reject) => {
    const eventSource = new EventSource(alibabaStoreEventSourceUrl);
    const responses = [];
    let resolved = false;

    eventSource.onmessage = (event: MessageEvent) => {
      const response: AlibabaResponse = JSON.parse(event.data);
      if (response && response?.payload && response?.payload?.productReview) {
        responses.push(response);
      }
    };

    eventSource.onerror = (event: EventError) => {
      const errorDetails = {
        type: event.type,
        message: event.message || "No message provided",
        timestamp: new Date().toISOString()
      };
      console.error("Error occurred:", errorDetails);

      if (!resolved) {
        resolve(responses);
        resolved = true;
        eventSource.close();
      }
    };

    // Close connection after 30 seconds if not resolved
    setTimeout(() => {
      if (!resolved) {
        eventSource.close();
        ServerLogger.gray(`Connection closed after timeout with responses = ${responses}`);
        resolve(responses); // Resolve with whatever messages were collected
        resolved = true;
      }
    }, 30000);
  });
};

export const handleAlibabaFeedback = async (result: {
  result: any;
}): Promise<{ response: AlibabaResponse[]; reviewsValue: number; reviewCount: number }> => {
  try {
    const { aliMemberEncryptId, hostToken, reviewsValue, reviewCount } = extractAlibabaData(result.result);
    const feedbackUrl = buildAlibabaFeedbackUrl(aliMemberEncryptId, hostToken);
    const response = await scrapeAlibabaStoreFeedbackEventStream(feedbackUrl);
    return { response, reviewsValue, reviewCount };
  } catch (error) {
    ServerLogger.error(`AlibabaService:: Error during event stream handling - ${error}`);
    throw error;
  }
};
