"use client";

import { cn } from "@/lib/utils";

interface DiscoverLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}

export function DiscoverLayout({
  children,
  sidebar,
  className,
}: DiscoverLayoutProps) {
  return (
    <div className={cn("min-h-screen", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main content area */}
          <main className="lg:col-span-8">{children}</main>

          {/* Sidebar */}
          {sidebar && (
            <aside className="lg:col-span-4 space-y-6">{sidebar}</aside>
          )}
        </div>
      </div>
    </div>
  );
}
