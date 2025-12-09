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

type MarkdownBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

function parseMarkdownBlocks(content: string): MarkdownBlock[] {
  const lines = content.split(/\r?\n/);
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const rawLine = lines[index];
    const line = rawLine.trim();

    if (!line) {
      index += 1;
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      blocks.push({ type: "heading", level: headingMatch[1].length, text: headingMatch[2].trim() });
      index += 1;
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (index < lines.length) {
        const listLine = lines[index].trim();
        if (!listLine.startsWith("- ")) break;
        items.push(listLine.slice(2).trim());
        index += 1;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    const paragraphLines: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,6})\s+/.test(lines[index].trim()) &&
      !lines[index].trim().startsWith("- ")
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    if (paragraphLines.length) {
      blocks.push({ type: "paragraph", text: paragraphLines.join(" ") });
    }
  }

  return blocks;
}

function renderInline(text: string, keyPrefix: string) {
  const nodes: Array<string | JSX.Element> = [];
  let remaining = text;
  let tokenIndex = 0;

  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+]\([^\)]+\))/;

  while (remaining.length) {
    const match = remaining.match(pattern);
    if (!match || match.index === undefined) {
      nodes.push(remaining);
      break;
    }

    const matchIndex = match.index;
    if (matchIndex > 0) {
      nodes.push(remaining.slice(0, matchIndex));
    }

    const token = match[0];
    const content = token.startsWith("**")
      ? token.slice(2, -2)
      : token.startsWith("*")
        ? token.slice(1, -1)
        : token.slice(1, token.lastIndexOf("]"));

    if (token.startsWith("**")) {
      nodes.push(
        <strong key={`${keyPrefix}-bold-${tokenIndex}`}>
          {content}
        </strong>
      );
    } else if (token.startsWith("*")) {
      nodes.push(
        <em key={`${keyPrefix}-em-${tokenIndex}`}>
          {content}
        </em>
      );
    } else if (token.startsWith("[")) {
      const href = token.slice(token.lastIndexOf("(") + 1, -1);
      const linkContent = content;
      const isInternal = href.startsWith("/");
      nodes.push(
        isInternal ? (
          <Link key={`${keyPrefix}-link-${tokenIndex}`} href={href}>
            {linkContent}
          </Link>
        ) : (
          <a
            key={`${keyPrefix}-link-${tokenIndex}`}
            href={href}
            target="_blank"
            rel="noreferrer"
          >
            {linkContent}
          </a>
        )
      );
    }

    remaining = remaining.slice(matchIndex + token.length);
    tokenIndex += 1;
  }

  return nodes;
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
    const blocks = parseMarkdownBlocks(post.content);

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

            <div className={styles.content}>
              {blocks.map((block, index) => {
                if (block.type === "heading") {
                  const HeadingTag = block.level === 1 ? "h2" : block.level === 2 ? "h3" : "h4";
                  return (
                    <HeadingTag key={`heading-${index}`} className={styles.articleSubheading}>
                      {renderInline(block.text, `heading-${index}`)}
                    </HeadingTag>
                  );
                }

                if (block.type === "list") {
                  return (
                    <ul key={`list-${index}`}>
                      {block.items.map((item, itemIndex) => (
                        <li key={`list-${index}-${itemIndex}`}>{renderInline(item, `list-${index}-${itemIndex}`)}</li>
                      ))}
                    </ul>
                  );
                }

                return (
                  <p key={`paragraph-${index}`}>
                    {renderInline(block.text, `paragraph-${index}`)}
                  </p>
                );
              })}
            </div>
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
