/* eslint-disable import/order */
/* eslint-disable import/first */
import { ServerLogger, initSentry, setupSentry } from "./utils/logging";

initSentry();

import express from "express";
import { apiAuth } from "./middleware/auth";
import { registerFetchProxy } from "./middleware/fetch-proxy";
import { processProduct } from "./services/brain-worker";
import { initProcessProductDataFromUrl, serializeToJson } from "./utils/utils";
import { scrape } from "./services/scrapingService";
import { printVersion } from "./utils/monitoring";
import { isAlibabaSite } from "../src/supplier/utils/alibaba-site-utils";
import { handleAlibabaFeedback } from "./services/brain/services/alibabaSupplierScrapingService";

const { PORT = 80 } = process.env;
const INTERNAL_NETWORK_PORT = 8081;

registerFetchProxy();
const app = express();
setupSentry(app);

app.get("/think", apiAuth(), async (req, res) => {
  const targetUrl = req.query.url as string;
  const lang = req.query.lang as string;
  const regenerate = req.query.regenerate !== undefined;

  if (!targetUrl) {
    return res.status(400).send("URL parameter is required");
  }
  const productRequest = initProcessProductDataFromUrl(targetUrl, lang, regenerate);
  const response = await processProduct(productRequest);
  res.setHeader("Content-Type", "application/json");
  res.end(serializeToJson(response));
});

app.get("/extract", apiAuth(), async (req, res) => {
  const url: string = req.query.url as string;
  const waitForCssSelector: string | undefined = req.query.waitForCssSelector as string | undefined;
  const regenerate: boolean = req.query.regenerate !== undefined;

  try {
    const result = await scrape({ url, waitForCssSelector, regenerate });

    if (result.status !== 200) {
      ServerLogger.error(`Extract:: Failed to extract data from ${url}`);
      return res.status(result.status).send("Failed to extract data");
    }

    if (isAlibabaSite(url)) {
      try {
        const response = await handleAlibabaFeedback(result);
        return res.status(200).send(response);
      } catch (error) {
        return res.status(500).send(error);
      }
    } else {
      ServerLogger.green(`Extract:: Successfully extracted data from ${url}`);
      res.setHeader("Content-Type", "text/html");
      return res.end(result.result);
    }
  } catch (error) {
    ServerLogger.error(`Extract:: Error during scraping - ${error}`);
    return res.status(500).send("Internal Server Error");
  }
});

app.get("/", async (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.send("Brain server is running");
});

printVersion();
app.listen(PORT, () => {
  ServerLogger.green(`Brain Server listening at port:${PORT} (IPv4)`);
});

app.listen(INTERNAL_NETWORK_PORT, "::", () => {
  ServerLogger.log(`\x1b[35mBrain Server listening at port:${INTERNAL_NETWORK_PORT} (IPv6)\x1b[0m`);
});
