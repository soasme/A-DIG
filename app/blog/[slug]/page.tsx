import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "../../components/Footer";
import { listBlogPostSlugs, loadBlogPostBySlug } from "../../lib/blog";
import styles from "../blog.module.css";

export const dynamic = "force-static";
export const dynamicParams = false;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function renderContent(content: string) {
  const blocks = content.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);

  return blocks.map((block, index) => {
    const lines = block.split(/\n/).map((line) => line.trim());
    const isList = lines.every((line) => /^-\s+/.test(line));

    if (isList) {
      return (
        <ul key={index}>
          {lines.map((line, lineIndex) => (
            <li key={lineIndex}>{line.replace(/^-\s+/, "")}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={index}>
        {lines.map((line, lineIndex) => (
          <span key={lineIndex}>
            {line}
            {lineIndex < lines.length - 1 ? <br /> : null}
          </span>
        ))}
      </p>
    );
  });
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

            <div className={styles.content}>{renderContent(post.content)}</div>
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
