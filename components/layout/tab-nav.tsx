"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Newspaper } from "lucide-react";

interface Tab {
  name: string;
  href: string;
  param?: string;
}

const tabs: Tab[] = [
  { name: "For You", href: "/", param: undefined },
  { name: "Top", href: "/?filter=top", param: "top" },
  { name: "Topics", href: "/posts/categories", param: undefined },
];

export function TabNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter");

  const isActive = (tab: Tab) => {
    if (tab.param) {
      return filter === tab.param;
    }
    if (tab.href === "/posts/categories") {
      return pathname === "/posts/categories";
    }
    return pathname === "/" && !filter;
  };

  return (
    <nav className="border-b border-border mb-6">
      <div className="flex items-center gap-1">
        {/* Discover logo/icon */}
        <div className="flex items-center gap-2 pr-4 mr-2 border-r border-border">
          <Newspaper className="h-5 w-5 text-primary" />
          <span className="font-semibold text-lg">Discover</span>
        </div>

        {/* Tab links */}
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "px-4 py-3 text-sm font-medium transition-colors relative",
                isActive(tab)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.name}
              {isActive(tab) && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
