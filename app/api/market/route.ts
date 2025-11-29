import { NextResponse } from "next/server";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

interface QuoteData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

// Cache the response for 5 minutes
export const revalidate = 300;

// Fallback mock data
const mockData = {
  indices: [
    {
      symbol: "SPY",
      name: "S&P 500",
      price: 6859.5,
      change: 8.45,
      changePercent: 0.12,
    },
    {
      symbol: "QQQ",
      name: "NASDAQ",
      price: 25482,
      change: 171.75,
      changePercent: 0.68,
    },
  ],
  crypto: [
    {
      symbol: "BTC",
      name: "Bitcoin",
      price: 90505.05,
      change: -880.11,
      changePercent: -0.96,
    },
    {
      symbol: "VIX",
      name: "VIX",
      price: 16.35,
      change: -0.84,
      changePercent: -4.89,
    },
  ],
};

async function fetchFinnhubQuote(symbol: string): Promise<QuoteData | null> {
  if (!FINNHUB_API_KEY) return null;

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) return null;

    const data = await response.json();

    return {
      symbol,
      name: symbol,
      price: data.c || 0, // Current price
      change: data.d || 0, // Change
      changePercent: data.dp || 0, // Change percent
    };
  } catch (error) {
    console.error(`Finnhub error for ${symbol}:`, error);
    return null;
  }
}

async function fetchAlphaVantageQuote(
  symbol: string
): Promise<QuoteData | null> {
  if (!ALPHA_VANTAGE_API_KEY) return null;

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const quote = data["Global Quote"];

    if (!quote) return null;

    return {
      symbol,
      name: symbol,
      price: parseFloat(quote["05. price"]) || 0,
      change: parseFloat(quote["09. change"]) || 0,
      changePercent: parseFloat(quote["10. change percent"]?.replace("%", "")) || 0,
    };
  } catch (error) {
    console.error(`Alpha Vantage error for ${symbol}:`, error);
    return null;
  }
}

async function fetchCryptoPrice(symbol: string): Promise<QuoteData | null> {
  if (!ALPHA_VANTAGE_API_KEY) return null;

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${symbol}&to_currency=USD&apikey=${ALPHA_VANTAGE_API_KEY}`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const rate = data["Realtime Currency Exchange Rate"];

    if (!rate) return null;

    const price = parseFloat(rate["5. Exchange Rate"]) || 0;

    return {
      symbol,
      name: symbol === "BTC" ? "Bitcoin" : symbol,
      price,
      change: 0, // Alpha Vantage doesn't provide change for crypto
      changePercent: 0,
    };
  } catch (error) {
    console.error(`Crypto API error for ${symbol}:`, error);
    return null;
  }
}

export async function GET() {
  // If no API keys configured, return mock data
  if (!FINNHUB_API_KEY && !ALPHA_VANTAGE_API_KEY) {
    return NextResponse.json(mockData);
  }

  const symbols = {
    indices: ["SPY", "QQQ"],
    vix: "VIX",
    crypto: ["BTC"],
  };

  const nameMap: Record<string, string> = {
    SPY: "S&P 500",
    QQQ: "NASDAQ",
    VIX: "VIX",
    BTC: "Bitcoin",
  };

  try {
    // Fetch indices
    const indicesPromises = symbols.indices.map(async (symbol) => {
      const quote = FINNHUB_API_KEY
        ? await fetchFinnhubQuote(symbol)
        : await fetchAlphaVantageQuote(symbol);

      if (quote) {
        quote.name = nameMap[symbol] || symbol;
      }
      return quote;
    });

    // Fetch VIX
    const vixPromise = FINNHUB_API_KEY
      ? fetchFinnhubQuote(symbols.vix)
      : fetchAlphaVantageQuote(symbols.vix);

    // Fetch crypto
    const cryptoPromises = symbols.crypto.map((symbol) =>
      fetchCryptoPrice(symbol)
    );

    const [indicesResults, vixResult, ...cryptoResults] = await Promise.all([
      Promise.all(indicesPromises),
      vixPromise,
      ...cryptoPromises,
    ]);

    const indices = indicesResults.filter(
      (q): q is QuoteData => q !== null
    );
    const crypto: QuoteData[] = [];

    // Add crypto results
    cryptoResults.forEach((result) => {
      if (result) {
        crypto.push(result);
      }
    });

    // Add VIX to crypto section (as it's a volatility index)
    if (vixResult) {
      vixResult.name = "VIX";
      crypto.push(vixResult);
    }

    // If we got any real data, return it; otherwise fall back to mock
    if (indices.length > 0 || crypto.length > 0) {
      return NextResponse.json({
        indices: indices.length > 0 ? indices : mockData.indices,
        crypto: crypto.length > 0 ? crypto : mockData.crypto,
      });
    }

    return NextResponse.json(mockData);
  } catch (error) {
    console.error("Market API error:", error);
    return NextResponse.json(mockData);
  }
}
