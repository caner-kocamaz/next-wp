"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface MarketWidgetData {
  indices: MarketData[];
  crypto: MarketData[];
}

function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return price.toFixed(2);
}

function formatChange(change: number, isPercent: boolean = false): string {
  const prefix = change >= 0 ? "+" : "";
  if (isPercent) {
    return `${prefix}${change.toFixed(2)}%`;
  }
  return `${prefix}${change.toFixed(2)}`;
}

export function MarketWidget() {
  const [marketData, setMarketData] = useState<MarketWidgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMarketData() {
      try {
        const response = await fetch("/api/market");
        if (!response.ok) {
          throw new Error("Failed to fetch market data");
        }
        const data = await response.json();
        setMarketData(data);
      } catch (err) {
        setError("Unable to load market data");
        // Set fallback data
        setMarketData({
          indices: [
            {
              symbol: "SPY",
              name: "S&P Futu...",
              price: 6859.5,
              change: 8.45,
              changePercent: 0.12,
            },
            {
              symbol: "QQQ",
              name: "NASDAQ ...",
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
        });
      } finally {
        setLoading(false);
      }
    }

    fetchMarketData();
  }, []);

  if (loading) {
    return (
      <div className="bg-card rounded-xl p-4 border border-border animate-pulse">
        <div className="h-5 bg-muted rounded w-32 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!marketData) return null;

  const allItems = [...marketData.indices, ...marketData.crypto];

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <h3 className="font-semibold text-sm mb-4">Market Outlook</h3>

      <div className="space-y-1">
        {allItems.map((item, index) => (
          <div
            key={item.symbol}
            className={cn(
              "flex items-center justify-between py-2",
              index < allItems.length - 1 && "border-b border-border"
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                  item.changePercent >= 0
                    ? "bg-positive/10 text-positive"
                    : "bg-negative/10 text-negative"
                )}
              >
                {item.symbol.slice(0, 3)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.symbol}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-medium">
                {item.symbol === "BTC" ? "$" : ""}
                {formatPrice(item.price)}
              </p>
              <div
                className={cn(
                  "flex items-center justify-end gap-1 text-xs",
                  item.changePercent >= 0 ? "text-positive" : "text-negative"
                )}
              >
                {item.changePercent >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{formatChange(item.changePercent, true)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {error}
        </p>
      )}
    </div>
  );
}
