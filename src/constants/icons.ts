export const PASSED_SYMBOL: string = `✓`;
export const FAILED_SYMBOL: string = `✗ `;

export const getSymbolClassByText = (text: string): string =>
  text.trim().startsWith(PASSED_SYMBOL) ? "sd-reason-good" : "sd-reason-bad";
