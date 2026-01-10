export function resolveDatasourceData(ds) {
  const now = Math.floor(Date.now() / 1000);

  switch (ds.seriesType) {
    case "candlestick":
      return makeCandlestickData(now);

    case "boolean":
      return makeBooleanData(now);

    case "histogram":
      return makeHistogramData(now);

    case "line":
    default:
      return makeLineData(now);
  }
}

/* ===== generators (POC) ===== */

function makeLineData(now) {
  return Array.from({ length: 50 }, (_, i) => ({
    time: now - (50 - i) * 60,
    value: 100 + Math.sin(i / 3) * 5,
  }));
}

function makeCandlestickData(now) {
  let price = 100;

  return Array.from({ length: 50 }, (_, i) => {
    const open = price;
    const close = open + (Math.random() - 0.5) * 4;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;
    price = close;

    return {
      time: now - (50 - i) * 60,
      open,
      high,
      low,
      close,
    };
  });
}

function makeBooleanData(now) {
  return Array.from({ length: 50 }, (_, i) => ({
    time: now - (50 - i) * 60,
    value: Math.random() > 0.7 ? 1 : 0,
  }));
}

function makeHistogramData(now) {
  return Array.from({ length: 50 }, (_, i) => ({
    time: now - (50 - i) * 60,
    value: Math.floor(Math.random() * 100),
  }));
}
