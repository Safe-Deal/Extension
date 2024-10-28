import { PaintUtils } from "../paint-utils";
import tippy from "tippy.js";

jest.mock("tippy.js", () => {
  return jest.fn();
});

jest.mock("../../../constants/messages", () => ({
  t: jest.fn((key) => key),
  isRtl: jest.fn(() => false)
}));

describe("PaintUtils - appendProductReliabilityPopover", () => {
  let targetEl: HTMLElement;
  const mockExplanation = "Verify the summary popover appears";

  beforeEach(() => {
    jest.clearAllMocks();

    targetEl = document.createElement("div");
  });

  it("should mount tippy with correct configuration", () => {
    PaintUtils.appendProductReliabilityPopover({
      targetEl,
      explanation: mockExplanation
    });

    expect(tippy).toHaveBeenCalledWith(
      targetEl,
      expect.objectContaining({
        zIndex: 99999,
        theme: "light-border",
        content: expect.stringContaining(mockExplanation),
        allowHTML: true,
        duration: [50, 50],
        placement: "auto",
        animateFill: true,
        trigger: "mouseenter focus",
        maxWidth: 800,
        followCursor: "initial",
        delay: [230, 0],
        plugins: expect.any(Array)
      })
    );
  });

  it("should create tooltip with proper direction", () => {
    document.dir = "rtl";

    PaintUtils.appendProductReliabilityPopover({
      targetEl,
      explanation: mockExplanation
    });

    expect(tippy).toHaveBeenCalledWith(
      targetEl,
      expect.objectContaining({
        content: expect.stringContaining("direction:rtl")
      })
    );
  });
});
