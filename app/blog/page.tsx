import BlogListPage from "./BlogListPage";

export const dynamic = "force-static";

export default function BlogHomePage() {
  return <BlogListPage pageNumber={1} />;
}
