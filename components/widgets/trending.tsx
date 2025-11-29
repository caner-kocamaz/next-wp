"use client";

import Link from "next/link";
import Image from "next/image";
import { TrendingUp, TrendingDown, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendingItem {
  id: number;
  name: string;
  symbol?: string;
  price?: number;
  change?: number;
  imageUrl?: string;
  href: string;
}

interface TrendingWidgetProps {
  items?: TrendingItem[];
}

// Default trending items (can be replaced with real data)
const defaultItems: TrendingItem[] = [
  {
    id: 1,
    name: "United Therapeutics Cor...",
    symbol: "UTHR",
    price: 486.0,
    change: -0.5,
    href: "#",
  },
  {
    id: 2,
    name: "Kohl's Corporation",
    symbol: "KSS",
    price: 24.59,
    change: 2.03,
    href: "#",
  },
  {
    id: 3,
    name: "KeyCorp",
    symbol: "KEY",
    price: 18.39,
    change: -0.05,
    href: "#",
  },
  {
    id: 4,
    name: "Intel Corporation",
    symbol: "INTC",
    price: 40.56,
    change: 10.28,
    href: "#",
  },
  {
    id: 5,
    name: "Apple Inc.",
    symbol: "AAPL",
    price: 278.36,
    change: 0.29,
    href: "#",
  },
];

export function TrendingWidget({ items = defaultItems }: TrendingWidgetProps) {
  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <h3 className="font-semibold text-sm mb-4">Trending Companies</h3>

      <div className="space-y-1">
        {items.map((item, index) => (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "flex items-center justify-between py-2 hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors",
              index < items.length - 1 && "border-b border-border"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                {item.symbol && (
                  <p className="text-xs text-muted-foreground">{item.symbol}</p>
                )}
              </div>
            </div>

            {item.price !== undefined && item.change !== undefined && (
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-medium">${item.price.toFixed(2)}</p>
                <div
                  className={cn(
                    "flex items-center justify-end gap-1 text-xs",
                    item.change >= 0 ? "text-positive" : "text-negative"
                  )}
                >
                  {item.change >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>
                    {item.change >= 0 ? "+" : ""}
                    {item.change.toFixed(2)}%
                  </span>
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
