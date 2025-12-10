import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import Footer from "../../components/Footer";
import { listBlogPostSlugs, loadBlogPostBySlug } from "../../lib/blog";
import styles from "../blog.module.css";

export const dynamic = "force-static";
export const dynamicParams = false;

marked.setOptions({ gfm: true, breaks: true });

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export async function generateStaticParams() {
  const slugs = await listBlogPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await loadBlogPostBySlug(slug);
    return {
      title: `${post.title} | Clues of Who?`,
      description: post.description,
    };
  } catch {
    return {
      title: `${slug} | Clues of Who?`,
      description: "Blog post",
    };
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const post = await loadBlogPostBySlug(slug);
    const html = marked.parse(post.content);

    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <Link href="/blog" className={styles.backLink}>
            ← Back to blog
          </Link>

          <article className={styles.articleShell}>
            <header className={styles.articleHeader}>
              <p className={styles.articleMeta}>Published {formatDate(post.publishedAt)}</p>
              <h1 className={styles.articleTitle}>{post.title}</h1>
              <p className={styles.cardDescription}>{post.description}</p>
              {post.tags.length > 0 && (
                <div className={styles.tags}>
                  {post.tags.map((tag) => (
                    <span key={tag} className={styles.pill}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            <div
              className={styles.content}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </article>

          <Footer
            className={styles.footer}
            navClassName={styles.footerNav}
            linkClassName={styles.footerLink}
          />
        </div>
      </div>
    );
  } catch {
    return notFound();
  }
}
