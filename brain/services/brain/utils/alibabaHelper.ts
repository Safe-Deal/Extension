import { debug } from "@utils/analytics/logger";
import { parseAsHtml, querySelector, querySelectorAll } from "@utils/dom/html";
import { get } from "lodash";
import { HTMLElement } from "node-html-parser";

const extractScore = (parseAsHtml: string | HTMLElement) => {
  const scoreElement = querySelector([".star-average-score"], parseAsHtml);
  if (scoreElement) {
    const scoreText = scoreElement.firstChild.textContent;
    return parseFloat(scoreText);
  }
  return null;
};

const extractReviewCount = (parseAsHtml: string | HTMLElement): number | null => {
  const reviewElement = querySelector([".star-review-count"], parseAsHtml);
  if (reviewElement) {
    const countText = reviewElement.childNodes[0].textContent?.trim() || "";
    return parseInt(countText, 10);
  }
  return null;
};

export const extractAlibabaData = (
  html: string
): { aliMemberEncryptId: string; hostToken: string; reviewsValue: number; reviewCount: number } => {
  const parsedHtml = parseAsHtml(html);

  // Extract the reviews
  const reviewsValue = extractScore(parsedHtml);
  debug(`reviewsValue =  ${reviewsValue}`);

  // Extract the review count
  const reviewCount = extractReviewCount(parsedHtml);
  debug(`reviewCount = ${reviewCount}`);

  // Extract the module Data JSON which include aliMemberId
  const element = querySelectorAll(["[module-id]"], parsedHtml)[0];
  const moduleData = element.getAttribute("module-data");
  const decodedModuleData = decodeURIComponent(moduleData);
  const moduleDataObj = JSON.parse(decodedModuleData);
  const aliMemberEncryptId = get(moduleDataObj, "gdc.aliMemberEncryptId");

  // Extract the host_token
  const elementMiniSite = querySelector(['[sense="minisite"]'], parsedHtml);
  const hostToken = elementMiniSite?.getAttribute("hosttoken");

  return { aliMemberEncryptId, hostToken, reviewsValue, reviewCount };
};

export const buildAlibabaFeedbackUrl = (aliMemberEncryptId: string, hostToken: string): string => {
  const currentPage = 1;
  const timestamp = Date.now();
  return `https://fb.alibaba.com/reactive/modules?_host_token_=${hostToken}&protocol=%7B%22api%22%3A%22interplay%22%2C%22modules%22%3A%5B%7B%22name%22%3A%22interplay.minisite.tag%22%2C%22param%22%3A%7B%22aliMemberId%22%3A%22${aliMemberEncryptId}%22%2C%22clusterId%22%3A-1%7D%7D%2C%7B%22name%22%3A%22interplay.minisite.review.list%22%2C%22param%22%3A%7B%22aliMemberId%22%3A%22${aliMemberEncryptId}%22%2C%22clusterId%22%3A-1%2C%22currentPage%22%3A${currentPage}%2C%22pageSize%22%3A5%7D%7D%2C%7B%22name%22%3A%22interplay.minisite.review.pagination%22%2C%22param%22%3A%7B%22aliMemberId%22%3A%22${aliMemberEncryptId}%22%2C%22clusterId%22%3A-1%2C%22currentPage%22%3A${currentPage}%2C%22pageSize%22%3A5%7D%7D%5D%2C%22version%22%3A%221.0%22%2C%22param%22%3A%7B%22sense%22%3A%22minisite%22%7D%2C%22streamId%22%3A2%2C%22timestamp%22%3A${timestamp}%2C%22timeout%22%3A%223000%22%7D`;
};
