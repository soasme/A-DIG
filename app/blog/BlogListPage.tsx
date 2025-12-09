import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "../components/Footer";
import { listBlogPostSummaries } from "../lib/blog";
import styles from "./blog.module.css";

export const POSTS_PER_PAGE = 12;

type BlogListPageProps = {
  pageNumber: number;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function pageHref(page: number) {
  return page === 1 ? "/blog" : `/blog/page/${page}`;
}

export default async function BlogListPage({ pageNumber }: BlogListPageProps) {
  const posts = await listBlogPostSummaries();
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));

  if (pageNumber < 1 || pageNumber > totalPages) {
    return notFound();
  }

  const start = (pageNumber - 1) * POSTS_PER_PAGE;
  const currentPosts = posts.slice(start, start + POSTS_PER_PAGE);
  const previousHref = pageNumber > 1 ? pageHref(pageNumber - 1) : null;
  const nextHref = pageNumber < totalPages ? pageHref(pageNumber + 1) : null;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Developer Notes</p>
          <h1 className={styles.title}>Clues of Who? Blog</h1>
          <p className={styles.subtitle}>
            Release announcements, puzzle design diaries, and progress updates as the world of Clues of
            Who? grows. Stay in the loop with the latest behind-the-scenes notes.
          </p>
        </header>

        {currentPosts.length === 0 ? (
          <p className={styles.empty}>No blog posts yet. Check back soon for fresh updates.</p>
        ) : (
          <div className={styles.grid}>
            {currentPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className={styles.card}>
                <div className={styles.meta}>
                  <span className={`${styles.pill} ${styles.timestamp}`}>
                    Published {formatDate(post.publishedAt)}
                  </span>
                </div>
                <h2 className={styles.cardTitle}>{post.title}</h2>
                <p className={styles.cardDescription}>{post.description}</p>
                {post.tags.length > 0 && (
                  <div className={styles.meta}>
                    {post.tags.map((tag) => (
                      <span key={tag} className={styles.pill}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className={styles.pagination} aria-label="Blog pagination">
            {previousHref ? (
              <Link className={styles.pageLink} href={previousHref}>
                Previous
              </Link>
            ) : (
              <span className={`${styles.pageLink} ${styles.pageLinkDisabled}`} aria-disabled="true">
                Previous
              </span>
            )}

            {Array.from({ length: totalPages }, (_, index) => {
              const page = index + 1;
              const href = pageHref(page);
              const isActive = page === pageNumber;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={`${styles.pageLink} ${isActive ? styles.pageLinkActive : ""}`}
                >
                  {page}
                </Link>
              );
            })}

            {nextHref ? (
              <Link className={styles.pageLink} href={nextHref}>
                Next
              </Link>
            ) : (
              <span className={`${styles.pageLink} ${styles.pageLinkDisabled}`} aria-disabled="true">
                Next
              </span>
            )}
          </nav>
        )}

        <Footer
          className={styles.footer}
          navClassName={styles.footerNav}
          linkClassName={styles.footerLink}
        />
      </div>
    </div>
  );
}
