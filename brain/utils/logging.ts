/* eslint-disable no-console */
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { IS_DEBUG } from "@utils/analytics/logger";

export class ServerLogger {
  static error(message: string) {
    Sentry.captureEvent({
      message,
      level: "error",
      platform: "BRAIN_SERVER"
    });
    console.error(`\x1b[31mBrain-Server:: ${message}\x1b[0m`);
  }

  static log(message: string) {
    if (IS_DEBUG) {
      console.log(`\x1b[37mBrain-Server:: ${message}\x1b[0m`);
    }
  }

  static green(message: string) {
    if (IS_DEBUG) {
      console.log(`\x1b[32mBrain-Server:: ${message}\x1b[0m`);
    }
  }

  static gray(message: string) {
    if (IS_DEBUG) {
      console.log(`\x1b[90mMiddleware:: ${message}\x1b[0m`);
    }
  }

  static warn(message: string) {
    console.warn(`\x1b[33mBrain-Server:: ${message}\x1b[0m`);
  }
}

export const initSentry = () => {
  Sentry.init({
    dsn: "https://56dfa5505f0f7538406b8d2555bf96f3@o4506154135912448.ingest.sentry.io/4506788042244096",
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0
  });
};

export const setupSentry = (app) => {
  Sentry.setupExpressErrorHandler(app);
  app.use((err, req, res, next) => {
    ServerLogger.error(err.message);
    res.statusCode = 500;
    res.end(`${res.sentry}\n`);
  });
};
