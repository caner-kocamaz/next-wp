import {
  getPostBySlug,
  getFeaturedMediaById,
  getAuthorById,
  getCategoryById,
  getAllPostSlugs,
  getPostsPaginated,
} from "@/lib/wordpress";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/site.config";
import { DiscoverMore } from "@/components/posts/scroll-card";

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock, BookOpen, Share2, Link as LinkIcon, ChevronLeft } from "lucide-react";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return await getAllPostSlugs();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {};
  }

  const ogUrl = new URL(`${siteConfig.site_domain}/api/og`);
  ogUrl.searchParams.append("title", post.title.rendered);
  const description = post.excerpt.rendered.replace(/<[^>]*>/g, "").trim();
  ogUrl.searchParams.append("description", description);

  return {
    title: post.title.rendered,
    description: description,
    openGraph: {
      title: post.title.rendered,
      description: description,
      type: "article",
      url: `${siteConfig.site_domain}/posts/${post.slug}`,
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
          alt: post.title.rendered,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title.rendered,
      description: description,
      images: [ogUrl.toString()],
    },
  };
}

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

// Extract headings from HTML content for table of contents
function extractHeadings(html: string): { id: string; text: string; level: number }[] {
  const headingRegex = /<h([2-3])[^>]*>([^<]+)<\/h[2-3]>/gi;
  const headings: { id: string; text: string; level: number }[] = [];
  let match;

  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const text = match[2].trim();
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    headings.push({ id, text, level });
  }

  return headings;
}

// Add IDs to headings in HTML content
function addHeadingIds(html: string): string {
  return html.replace(/<h([2-3])([^>]*)>([^<]+)<\/h[2-3]>/gi, (match, level, attrs, text) => {
    const id = text.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return `<h${level}${attrs} id="${id}">${text}</h${level}>`;
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const [featuredMedia, author, category, relatedPostsResponse] = await Promise.all([
    post.featured_media ? getFeaturedMediaById(post.featured_media) : null,
    getAuthorById(post.author),
    getCategoryById(post.categories[0]),
    getPostsPaginated(1, 6),
  ]);

  const timeAgo = getTimeAgo(new Date(post.date));
  const headings = extractHeadings(post.content.rendered);
  const contentWithIds = addHeadingIds(post.content.rendered);

  // Filter out current post from related posts
  const relatedPosts = relatedPostsResponse.data.filter(p => p.id !== post.id).slice(0, 5);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Discover
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main content */}
          <article className="lg:col-span-8">
            {/* Header */}
            <header className="mb-8">
              {/* Category */}
              <Link
                href={`/posts/?category=${category.id}`}
                className="inline-block text-sm font-medium text-primary hover:underline mb-3"
              >
                {category.name}
              </Link>

              {/* Title */}
              <h1
                dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                className="text-3xl md:text-4xl font-bold leading-tight mb-4"
              />

              {/* Excerpt/Lead */}
              <p
                className="text-lg text-muted-foreground leading-relaxed mb-6"
                dangerouslySetInnerHTML={{
                  __html: post.excerpt.rendered.replace(/<[^>]*>/g, ""),
                }}
              />

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-6 border-b border-border">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Published {timeAgo}</span>
                </div>
                {author?.name && (
                  <Link
                    href={`/posts/?author=${author.id}`}
                    className="hover:text-foreground transition-colors"
                  >
                    by {author.name}
                  </Link>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button className="p-2 rounded-lg hover:bg-muted transition-colors" title="Share">
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-muted transition-colors" title="Copy link">
                    <LinkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </header>

            {/* Featured Image */}
            {featuredMedia?.source_url && (
              <div className="relative aspect-video rounded-xl overflow-hidden mb-8 border border-border">
                <Image
                  src={featuredMedia.source_url}
                  alt={post.title.rendered}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
              </div>
            )}

            {/* Article Content */}
            <div
              className={cn(
                "prose prose-lg max-w-none",
                "dark:prose-invert",
                // Headings
                "prose-headings:font-semibold prose-headings:tracking-tight",
                "prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4",
                "prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3",
                // Paragraphs
                "prose-p:text-foreground/90 prose-p:leading-relaxed",
                // Links
                "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
                // Lists
                "prose-ul:my-4 prose-ol:my-4",
                "prose-li:text-foreground/90",
                // Blockquotes
                "prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg",
                // Code
                "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
                "prose-pre:bg-muted prose-pre:border prose-pre:border-border",
                // Images
                "prose-img:rounded-xl prose-img:border prose-img:border-border"
              )}
              dangerouslySetInnerHTML={{ __html: contentWithIds }}
            />

            {/* Tags/Footer */}
            <footer className="mt-12 pt-8 border-t border-border">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Topics:</span>
                <Link
                  href={`/posts/?category=${category.id}`}
                  className="px-3 py-1 text-sm bg-muted rounded-full hover:bg-muted/80 transition-colors"
                >
                  {category.name}
                </Link>
              </div>
            </footer>
          </article>

          {/* Sidebar - Table of Contents */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24">
              {headings.length > 0 && (
                <nav className="bg-card rounded-xl border border-border p-4 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm">On this page</h3>
                  </div>
                  <ul className="space-y-2">
                    {headings.map((heading, index) => (
                      <li key={index}>
                        <a
                          href={`#${heading.id}`}
                          className={cn(
                            "block text-sm text-muted-foreground hover:text-foreground transition-colors",
                            heading.level === 3 && "pl-4"
                          )}
                        >
                          {heading.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}

              {/* Author card */}
              {author && (
                <div className="bg-card rounded-xl border border-border p-4">
                  <h3 className="font-semibold text-sm mb-3">Written by</h3>
                  <Link
                    href={`/posts/?author=${author.id}`}
                    className="flex items-center gap-3 hover:bg-muted/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {author.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{author.name}</p>
                      <p className="text-xs text-muted-foreground">View all posts</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <DiscoverMore posts={relatedPosts} title="Discover more" className="mt-12" />
        )}
      </div>
    </div>
  );
}
