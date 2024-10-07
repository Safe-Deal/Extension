import "@testing-library/jest-dom";
import { waitForElement } from "../html";

describe("waitForElement", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = `
      <div id="container"></div>
    `;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("rejects the promise after the max wait time", async () => {
    const selector = ".non-existent-element";
    const elementPromise = waitForElement(selector, document);

    jest.runAllTimers();

    await expect(elementPromise).rejects.toThrow(`Timeout waiting for element: ${selector}`);
  });
});
