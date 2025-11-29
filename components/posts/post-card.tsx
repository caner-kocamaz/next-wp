import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";

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
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface PostCardProps {
  post: Post;
  className?: string;
  variant?: "default" | "compact" | "horizontal";
}

export async function PostCard({
  post,
  className,
  variant = "default",
}: PostCardProps) {
  const media = post.featured_media
    ? await getFeaturedMediaById(post.featured_media)
    : null;
  const author = post.author ? await getAuthorById(post.author) : null;
  const category = post.categories?.[0]
    ? await getCategoryById(post.categories[0])
    : null;
  const timeAgo = getTimeAgo(new Date(post.date));

  if (variant === "horizontal") {
    return (
      <Link
        href={`/posts/${post.slug}`}
        className={cn(
          "group flex gap-4 bg-card rounded-xl border border-border p-4",
          "hover:border-primary/50 transition-all duration-200",
          className
        )}
      >
        {/* Thumbnail */}
        <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
          {media?.source_url ? (
            <Image
              src={media.source_url}
              alt={post.title?.rendered || "Post thumbnail"}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="128px"
            />
          ) : (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-xs">No image</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {category && (
            <span className="text-xs font-medium text-primary mb-1 block">
              {category.name}
            </span>
          )}
          <h3
            dangerouslySetInnerHTML={{
              __html: post.title?.rendered || "Untitled Post",
            }}
            className="font-medium text-sm leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors"
          />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{timeAgo}</span>
            {author && (
              <>
                <span>•</span>
                <span>{author.name}</span>
              </>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Default card style (Perplexity-inspired)
  return (
    <Link
      href={`/posts/${post.slug}`}
      className={cn(
        "group block bg-card rounded-xl border border-border overflow-hidden",
        "hover:border-primary/50 transition-all duration-200",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-video">
        {media?.source_url ? (
          <Image
            src={media.source_url}
            alt={post.title?.rendered || "Post thumbnail"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-sm">No image</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        {category && (
          <span className="text-xs font-medium text-primary mb-2 block">
            {category.name}
          </span>
        )}

        {/* Title */}
        <h3
          dangerouslySetInnerHTML={{
            __html: post.title?.rendered || "Untitled Post",
          }}
          className="font-semibold text-base leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors"
        />

        {/* Excerpt */}
        <p
          className="text-sm text-muted-foreground line-clamp-2 mb-3"
          dangerouslySetInnerHTML={{
            __html:
              post.excerpt?.rendered?.replace(/<[^>]*>/g, "").slice(0, 100) +
                "..." || "",
          }}
        />

        {/* Meta row */}
        <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{timeAgo}</span>
          </div>
          {author && <span className="truncate max-w-[120px]">{author.name}</span>}
        </div>
      </div>
    </Link>
  );
}
