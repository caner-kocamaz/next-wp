import { Suspense } from "react";

// Layout Components
import { DiscoverLayout } from "@/components/layout/discover-layout";
import { TabNav } from "@/components/layout/tab-nav";

// Widget Components
import { WeatherWidget } from "@/components/widgets/weather";
import { MarketWidget } from "@/components/widgets/market";
import { TrendingWidget } from "@/components/widgets/trending";

// Post Components
import { HeroCard } from "@/components/posts/hero-card";
import { CompactCard } from "@/components/posts/compact-card";
import { DiscoverMore } from "@/components/posts/scroll-card";

// WordPress
import { getPostsPaginated } from "@/lib/wordpress";

// Types
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover | News & Insights",
  description: "Stay informed with the latest news and insights powered by WordPress and Next.js",
};

export const dynamic = "auto";
export const revalidate = 600;

// Loading skeleton for widgets
function WidgetSkeleton() {
  return (
    <div className="bg-card rounded-xl p-4 border border-border animate-pulse">
      <div className="h-5 bg-muted rounded w-32 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-muted rounded" />
        ))}
      </div>
    </div>
  );
}

// Loading skeleton for cards
function CardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden animate-pulse">
      <div className="aspect-video bg-muted" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
    </div>
  );
}

// Sidebar component with all widgets
function Sidebar() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<WidgetSkeleton />}>
        <WeatherWidget />
      </Suspense>
      <Suspense fallback={<WidgetSkeleton />}>
        <MarketWidget />
      </Suspense>
      <Suspense fallback={<WidgetSkeleton />}>
        <TrendingWidget />
      </Suspense>
    </div>
  );
}

export default async function Home() {
  // Fetch posts for the home page
  const { data: posts } = await getPostsPaginated(1, 10);

  // Split posts: first one is hero, next 3 are compact grid, rest are discover more
  const heroPost = posts[0];
  const gridPosts = posts.slice(1, 4);
  const morePosts = posts.slice(4);

  // If no posts, show empty state
  if (posts.length === 0) {
    return (
      <DiscoverLayout sidebar={<Sidebar />}>
        <Suspense fallback={null}>
          <TabNav />
        </Suspense>
        <div className="flex items-center justify-center min-h-[400px] bg-card rounded-xl border border-border">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">No posts yet</h2>
            <p className="text-muted-foreground">
              Connect your WordPress site to see content here.
            </p>
          </div>
        </div>
      </DiscoverLayout>
    );
  }

  return (
    <DiscoverLayout sidebar={<Sidebar />}>
      <Suspense fallback={null}>
        <TabNav />
      </Suspense>

      {/* Hero Post */}
      {heroPost && (
        <section className="mb-6">
          <Suspense
            fallback={
              <div className="bg-card rounded-xl border border-border overflow-hidden animate-pulse">
                <div className="grid md:grid-cols-2">
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                  <div className="aspect-video bg-muted" />
                </div>
              </div>
            }
          >
            <HeroCard post={heroPost} />
          </Suspense>
        </section>
      )}

      {/* Compact Cards Grid */}
      {gridPosts.length > 0 && (
        <section className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gridPosts.map((post) => (
              <Suspense key={post.id} fallback={<CardSkeleton />}>
                <CompactCard post={post} />
              </Suspense>
            ))}
          </div>
        </section>
      )}

      {/* Discover More Section */}
      {morePosts.length > 0 && (
        <Suspense fallback={null}>
          <DiscoverMore posts={morePosts} />
        </Suspense>
      )}
    </DiscoverLayout>
  );
}
