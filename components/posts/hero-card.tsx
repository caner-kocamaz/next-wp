import Image from "next/image";
import Link from "next/link";
import { Clock, MessageCircle } from "lucide-react";

import { Post } from "@/lib/wordpress.d";
import { cn } from "@/lib/utils";
import {
  getFeaturedMediaById,
  getAuthorById,
  getCategoryById,
} from "@/lib/wordpress";

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return `${diffMins} minutes ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hours ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
}

interface HeroCardProps {
  post: Post;
  className?: string;
}

export async function HeroCard({ post, className }: HeroCardProps) {
  const media = post.featured_media
    ? await getFeaturedMediaById(post.featured_media)
    : null;
  const author = post.author ? await getAuthorById(post.author) : null;
  const category = post.categories?.[0]
    ? await getCategoryById(post.categories[0])
    : null;
  const timeAgo = getTimeAgo(new Date(post.date));

  return (
    <Link
      href={`/posts/${post.slug}`}
      className={cn(
        "group block bg-card rounded-xl border border-border overflow-hidden",
        "hover:border-primary/50 transition-all duration-200",
        className
      )}
    >
      <div className="grid md:grid-cols-2 gap-0">
        {/* Content */}
        <div className="p-6 flex flex-col justify-between order-2 md:order-1">
          <div>
            {/* Category badge */}
            {category && (
              <span className="inline-block text-xs font-medium text-primary mb-3">
                {category.name}
              </span>
            )}

            {/* Title - larger, serif-like */}
            <h2
              dangerouslySetInnerHTML={{
                __html: post.title?.rendered || "Untitled Post",
              }}
              className="text-2xl md:text-3xl font-semibold leading-tight mb-4 group-hover:text-primary transition-colors"
            />

            {/* Excerpt */}
            <div
              className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4"
              dangerouslySetInnerHTML={{
                __html:
                  post.excerpt?.rendered?.replace(/<[^>]*>/g, "").slice(0, 200) +
                    "..." || "",
              }}
            />
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Published {timeAgo}</span>
            </div>
            {author && (
              <span className="text-muted-foreground">by {author.name}</span>
            )}
          </div>
        </div>

        {/* Image */}
        <div className="relative aspect-video md:aspect-auto md:h-full order-1 md:order-2">
          {media?.source_url ? (
            <Image
              src={media.source_url}
              alt={post.title?.rendered || "Post thumbnail"}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">No image</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
