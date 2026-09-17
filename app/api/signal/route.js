const API_URL = "https://api.twelvedata.com/time_series";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const pair = searchParams.get("pair") || "EUR/USD";

    const apiKey = process.env.TWELVE_DATA_API_KEY;

    if (!apiKey) {
      return Response.json(
        {
          error: "TWELVE_DATA_API_KEY is not configured"
        },
        { status: 500 }
      );
    }

    const url =
      `${API_URL}?symbol=${encodeURIComponent(pair)}` +
      `&interval=1min&outputsize=50` +
      `&apikey=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url, {
      cache: "no-store"
    });

    const data = await response.json();

    if (!response.ok || data.status === "error") {
      return Response.json(
        {
          error:
            data.message ||
            "Market data request failed"
        },
        { status: 400 }
      );
    }

    if (!data.values || data.values.length < 20) {
      return Response.json(
        {
          error: "Not enough market data"
        },
        { status: 400 }
      );
    }

    const candles = [...data.values].reverse();

    const closes = candles.map((c) => Number(c.close));

    const current = closes[closes.length - 1];

    const ema9 = EMA(closes, 9);
    const ema21 = EMA(closes, 21);

    const rsi = RSI(closes, 14);

    let score = 0;

    if (ema9 > ema21) score += 2;
    if (ema9 < ema21) score -= 2;

    if (rsi > 55) score += 1;
    if (rsi < 45) score -= 1;

    let signal = "WAIT";

    if (score >= 2) signal = "CALL";
    if (score <= -2) signal = "PUT";

    const confidence = Math.min(
      95,
      Math.max(
        50,
        Math.round(60 + Math.abs(score) * 8)
      )
    );

    return Response.json({
      success: true,
      pair,
      signal,
      confidence,
      price: current.toFixed(5),
      indicators: {
        ema9: ema9.toFixed(5),
        ema21: ema21.toFixed(5),
        rsi: Number(rsi.toFixed(2))
      },
      source: "Twelve Data"
    });

  } catch (error) {
    return Response.json(
      {
        error: "Internal server error"
      },
      { status: 500 }
    );
  }
}


function EMA(values, period) {
  const multiplier = 2 / (period + 1);

  let ema = values[0];

  for (let i = 1; i < values.length; i++) {
    ema =
      (values[i] - ema) * multiplier +
      ema;
  }

  return ema;
}


function RSI(values, period) {
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const difference =
      values[i] - values[i - 1];

    if (difference >= 0) {
      gains += difference;
    } else {
      losses += Math.abs(difference);
    }
  }

  let averageGain = gains / period;
  let averageLoss = losses / period;

  for (let i = period + 1; i < values.length; i++) {

    const difference =
      values[i] - values[i - 1];

    const gain =
      difference > 0 ? difference : 0;

    const loss =
      difference < 0
        ? Math.abs(difference)
        : 0;

    averageGain =
      ((averageGain * (period - 1)) + gain) /
      period;

    averageLoss =
      ((averageLoss * (period - 1)) + loss) /
      period;
  }

  if (averageLoss === 0) return 100;

  const rs = averageGain / averageLoss;

  return 100 - 100 / (1 + rs);
}
