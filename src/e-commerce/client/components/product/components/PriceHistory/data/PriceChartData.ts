export const processChartData = (prices) => {
  const hasData = prices && prices.length > 0;
  const data = [[], []];

  if (hasData) {
    const datePriceMap = new Map();

    for (const price of prices) {
      const dateValue = new Date(price.date).getTime();
      const priceValue = parseFloat(price.price);

      if (!isNaN(dateValue) && !isNaN(priceValue)) {
        if (!datePriceMap.has(dateValue) || datePriceMap.get(dateValue) !== priceValue) {
          datePriceMap.set(dateValue, priceValue);
        }
      }
    }

    const sortedEntries = Array.from(datePriceMap.entries()).sort((a, b) => a[0] - b[0]);

    for (const [dateValue, priceValue] of sortedEntries) {
      data[0].push(dateValue);
      data[1].push(parseFloat(priceValue.toFixed(2)));
    }
  }

  if (data[0].length === 1) {
    const singleDate = new Date(data[0][0]);
    const twoDaysBefore = new Date(singleDate);
    twoDaysBefore.setDate(singleDate.getDate() - 2);
    const oneDayAfter = new Date(singleDate);
    oneDayAfter.setDate(singleDate.getDate() + 1);
    data[0] = [twoDaysBefore.getTime(), ...data[0], oneDayAfter.getTime()];
    data[1] = [data[1][0], ...data[1], data[1][0]];
  }

  return { hasData, data };
};
