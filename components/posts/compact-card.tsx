import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";

import { Post } from "@/lib/wordpress.d";
import { cn } from "@/lib/utils";
import { getFeaturedMediaById, getCategoryById } from "@/lib/wordpress";

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
  return `${diffDays}d ago`;
}

interface CompactCardProps {
  post: Post;
  className?: string;
  showImage?: boolean;
}

export async function CompactCard({
  post,
  className,
  showImage = true,
}: CompactCardProps) {
  const media =
    showImage && post.featured_media
      ? await getFeaturedMediaById(post.featured_media)
      : null;
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
      {/* Image */}
      {showImage && (
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
              <span className="text-muted-foreground text-xs">No image</span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3
          dangerouslySetInnerHTML={{
            __html: post.title?.rendered || "Untitled Post",
          }}
          className="font-medium text-sm leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors"
        />

        {/* Meta row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {category && (
            <span className="text-primary font-medium">{category.name}</span>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{timeAgo}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
