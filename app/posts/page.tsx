import {
  getPostsPaginated,
  getAllAuthors,
  getAllTags,
  getAllCategories,
  searchAuthors,
  searchTags,
  searchCategories,
} from "@/lib/wordpress";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { PostCard } from "@/components/posts/post-card";
import { FilterPosts } from "@/components/posts/filter";
import { SearchInput } from "@/components/posts/search-input";
import { Newspaper } from "lucide-react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Posts | Discover",
  description: "Browse all our blog posts",
};

export const dynamic = "auto";
export const revalidate = 600;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    author?: string;
    tag?: string;
    category?: string;
    page?: string;
    search?: string;
  }>;
}) {
  const params = await searchParams;
  const { author, tag, category, page: pageParam, search } = params;

  // Handle pagination
  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const postsPerPage = 9;

  // Fetch data based on search parameters using efficient pagination
  const [postsResponse, authors, tags, categories] = await Promise.all([
    getPostsPaginated(page, postsPerPage, { author, tag, category, search }),
    search ? searchAuthors(search) : getAllAuthors(),
    search ? searchTags(search) : getAllTags(),
    search ? searchCategories(search) : getAllCategories(),
  ]);

  const { data: posts, headers } = postsResponse;
  const { total, totalPages } = headers;

  // Create pagination URL helper
  const createPaginationUrl = (newPage: number) => {
    const params = new URLSearchParams();
    if (newPage > 1) params.set("page", newPage.toString());
    if (category) params.set("category", category);
    if (author) params.set("author", author);
    if (tag) params.set("tag", tag);
    if (search) params.set("search", search);
    return `/posts${params.toString() ? `?${params.toString()}` : ""}`;
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center gap-3 pb-6 border-b border-border">
            <Newspaper className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">All Posts</h1>
              <p className="text-muted-foreground text-sm">
                {total} {total === 1 ? "post" : "posts"} found
                {search && " matching your search"}
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4 bg-card rounded-xl border border-border p-4">
            <SearchInput defaultValue={search} />
            <FilterPosts
              authors={authors}
              tags={tags}
              categories={categories}
              selectedAuthor={author}
              selectedTag={tag}
              selectedCategory={category}
            />
          </div>

          {/* Posts Grid */}
          {posts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[200px] bg-card rounded-xl border border-border">
              <div className="text-center">
                <p className="text-muted-foreground">No posts found</p>
                {search && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Try adjusting your search or filters
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center py-8">
              <Pagination>
                <PaginationContent>
                  {page > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        href={createPaginationUrl(page - 1)}
                      />
                    </PaginationItem>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((pageNum) => {
                      return (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        Math.abs(pageNum - page) <= 1
                      );
                    })
                    .map((pageNum, index, array) => {
                      const showEllipsis =
                        index > 0 && pageNum - array[index - 1] > 1;
                      return (
                        <div key={pageNum} className="flex items-center">
                          {showEllipsis && <span className="px-2">...</span>}
                          <PaginationItem>
                            <PaginationLink
                              href={createPaginationUrl(pageNum)}
                              isActive={pageNum === page}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        </div>
                      );
                    })}

                  {page < totalPages && (
                    <PaginationItem>
                      <PaginationNext href={createPaginationUrl(page + 1)} />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
