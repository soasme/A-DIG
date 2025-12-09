import { notFound } from "next/navigation";
import BlogListPage, { POSTS_PER_PAGE } from "../../BlogListPage";
import { listBlogPostSummaries } from "../../../lib/blog";

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await listBlogPostSummaries();
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));

  return Array.from({ length: totalPages }, (_, index) => ({
    page: String(index + 1),
  }));
}

export default function BlogPaginationPage({
  params,
}: {
  params: { page: string };
}) {
  const pageNumber = Number(params.page);

  if (!Number.isFinite(pageNumber)) {
    return notFound();
  }

  return <BlogListPage pageNumber={pageNumber} />;
}
