import { ClientQue } from "../que";

// Reset the singleton between tests by re-importing
// Jest module isolation resets module state across describe blocks via jest.isolateModules

describe("ClientProcessingQue", () => {
  beforeEach(() => {
    // Clear processed state between tests by draining any leftover
    // The singleton's alreadyProcessed cache expires after 15min so we rely on
    // using unique IDs per test to avoid cross-contamination.
  });

  describe("isAllDone", () => {
    it("returns true when queue is empty and nothing is in-progress", () => {
      let que: typeof ClientQue;
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        que = require("../que").ClientQue;
      });
      expect(que.isAllDone()).toBe(true);
    });

    it("returns false after a product is popped (in-progress)", () => {
      let que: typeof ClientQue;
      jest.isolateModules(() => {
        que = require("../que").ClientQue;
      });
      const product = { id: "p-s3-001", url: "https://amazon.com/dp/B001" } as any;
      que.addProductToQue(product);
      que.getNextProductFromQue();
      expect(que.isAllDone()).toBe(false);
    });

    it("returns true once progressingDone is called for the last in-progress product", () => {
      let que: typeof ClientQue;
      jest.isolateModules(() => {
        que = require("../que").ClientQue;
      });
      const product = { id: "p-s3-002", url: "https://amazon.com/dp/B002" } as any;
      que.addProductToQue(product);
      que.getNextProductFromQue();
      que.progressingDone("p-s3-002");
      expect(que.isAllDone()).toBe(true);
    });

    it("tracks concurrent in-progress items correctly with integer counter", () => {
      let que: typeof ClientQue;
      jest.isolateModules(() => {
        que = require("../que").ClientQue;
      });
      const p1 = { id: "p-s3-c1", url: "https://amazon.com/dp/C1" } as any;
      const p2 = { id: "p-s3-c2", url: "https://amazon.com/dp/C2" } as any;
      const p3 = { id: "p-s3-c3", url: "https://amazon.com/dp/C3" } as any;

      que.addProductToQue(p1);
      que.addProductToQue(p2);
      que.addProductToQue(p3);

      que.getNextProductFromQue(); // p3 (stack: pop)
      que.getNextProductFromQue(); // p2
      que.getNextProductFromQue(); // p1

      expect(que.isAllDone()).toBe(false);
      expect(que.getProcessingAmount()).toBe(3);

      que.progressingDone("p-s3-c3");
      expect(que.getProcessingAmount()).toBe(2);
      expect(que.isAllDone()).toBe(false);

      que.progressingDone("p-s3-c2");
      que.progressingDone("p-s3-c1");
      expect(que.getProcessingAmount()).toBe(0);
      expect(que.isAllDone()).toBe(true);
    });
  });
});
