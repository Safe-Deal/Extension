export const clearCookiesAndLocalStorage = async ({ page, context }) => {
  const cookies = await context.cookies();
  await context.clearCookies(cookies);

  await page.evaluate(() => {
    localStorage.clear();
  });
};
