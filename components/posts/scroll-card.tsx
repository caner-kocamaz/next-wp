import Image from "next/image";
import Link from "next/link";

import { Post } from "@/lib/wordpress.d";
import { cn } from "@/lib/utils";
import { getFeaturedMediaById, getCategoryById } from "@/lib/wordpress";

interface ScrollCardProps {
  post: Post;
  className?: string;
}

export async function ScrollCard({ post, className }: ScrollCardProps) {
  const media = post.featured_media
    ? await getFeaturedMediaById(post.featured_media)
    : null;
  const category = post.categories?.[0]
    ? await getCategoryById(post.categories[0])
    : null;

  return (
    <Link
      href={`/posts/${post.slug}`}
      className={cn(
        "group flex-shrink-0 w-64 bg-card rounded-xl border border-border overflow-hidden",
        "hover:border-primary/50 transition-all duration-200",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3]">
        {media?.source_url ? (
          <Image
            src={media.source_url}
            alt={post.title?.rendered || "Post thumbnail"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="256px"
          />
        ) : (
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-xs">No image</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Category */}
        {category && (
          <span className="text-xs font-medium text-primary mb-1 block">
            {category.name}
          </span>
        )}

        {/* Title */}
        <h4
          dangerouslySetInnerHTML={{
            __html: post.title?.rendered || "Untitled Post",
          }}
          className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors"
        />

        {/* Brief excerpt */}
        <p
          className="text-xs text-muted-foreground mt-1 line-clamp-2"
          dangerouslySetInnerHTML={{
            __html:
              post.excerpt?.rendered?.replace(/<[^>]*>/g, "").slice(0, 80) +
                "..." || "",
          }}
        />
      </div>
    </Link>
  );
}

interface DiscoverMoreProps {
  posts: Post[];
  title?: string;
  className?: string;
}

export async function DiscoverMore({
  posts,
  title = "Discover more",
  className,
}: DiscoverMoreProps) {
  if (posts.length === 0) return null;

  return (
    <section className={cn("mt-8 pt-8 border-t border-border", className)}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">✨</span>
        <h3 className="font-semibold">{title}</h3>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
        {posts.map((post) => (
          <ScrollCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
