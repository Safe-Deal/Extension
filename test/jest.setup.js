require("cross-fetch/polyfill");

global.IS_DEBUGGER_ON = true;
global.chrome = {
  i18n: {
    getMessage: (msg) => msg
  },
  runtime: {
    getURL: (url) => url,
    sendMessage: jest.fn(),
    connect: jest.fn(),
    onConnect: {
      addListener: jest.fn((callback) => {
        const mockPort = {
          name: "safe-deal-port",
          postMessage: jest.fn(),
          onMessage: { addListener: jest.fn() },
          onDisconnect: { addListener: jest.fn() }
        };
        callback(mockPort);
      })
    }
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn()
    }
  },
  tabs: {
    get: jest.fn().mockResolvedValue({
      title: " test title",
      url: " test url",
      pendingUrl: "test pending url",
      favIconUrl: "/ test favicon"
    })
  }
};

jest.mock("../src/utils/analytics/logger", () => ({
  debug: jest.fn((msg, ruleName = "") => {
    const formattedMessage = `SafeDeal :: ${ruleName ? `${ruleName} ::` : ""} ${msg}`;
    console.log(`${formattedMessage}`, " --debug");
  }),
  logError: jest.fn((exception, ruleName = "N/A - General Exception") => {
    const errorMessage = exception instanceof Error ? `${exception.message} -> ${exception.stack}` : exception;
    const formattedMessage = `SafeDeal :: ${ruleName} :: ${errorMessage}`;
    console.error(`${formattedMessage}`, " --logError");
  }),
  sendLog: jest.fn((logData) => {
    console.log(`${logData}`, " --sendLog");
  }),
  initLog: jest.fn(() => {
    console.log("initLog");
  }),
  sendInstall: jest.fn(() => {
    console.log("sendInstall");
  })
}));

jest.mock("p-queue", () => {
  return jest.fn().mockImplementation((concurrency) => {
    const tasks = [];
    let activeCount = 0;

    const tryRunNextTask = () => {
      if (activeCount < concurrency && tasks.length > 0) {
        activeCount++;
        const { fn, resolve, reject } = tasks.shift();
        fn()
          .then(resolve, reject)
          .finally(() => {
            activeCount--;
            tryRunNextTask();
          });
      }
    };

    const limitFunction = (fn, ...args) => {
      return new Promise((resolve, reject) => {
        tasks.push({
          fn: () => fn(...args),
          resolve,
          reject
        });
        tryRunNextTask();
      });
    };

    limitFunction.activeCount = () => activeCount;
    limitFunction.pendingCount = () => tasks.length;
    limitFunction.clearQueue = () => {
      tasks.splice(0, tasks.length);
    };

    return limitFunction;
  });
});

global.IntersectionObserver = class {
  constructor() {}
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
};
