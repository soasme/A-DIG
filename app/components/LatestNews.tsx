import Link from "next/link";
import { BlogPostSummary } from "../lib/blog";

type LatestNewsProps = {
  posts: BlogPostSummary[];
};

export default function LatestNews({ posts }: LatestNewsProps) {
  const latestPosts = posts.slice(0, 5);

  return (
    <section className="rules-section">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <h2 className="section-title" style={{ margin: 0 }}>
          Latest News
        </h2>
        <Link
          href="/blog"
          style={{
            color: "var(--accent-red)",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: 0.4,
          }}
        >
          View all
        </Link>
      </div>

      {latestPosts.length === 0 ? (
        <p className="rules-content" style={{ marginBottom: 0 }}>
          No news posts yet. Check back soon for updates.
        </p>
      ) : (
        <ul className="rules-content" style={{ marginBottom: 0, paddingLeft: 22 }}>
          {latestPosts.map((post) => (
            <li key={post.slug} style={{ marginBottom: 8 }}>
              {post.description || post.title}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
