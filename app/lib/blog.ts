import fs from "fs/promises";
import path from "path";

export type BlogPostSummary = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  tags: string[];
};

export type BlogPost = BlogPostSummary & {
  content: string;
};

const POSTS_DIR = path.join(process.cwd(), "posts");

function assertValidSlug(slug: string) {
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error(`Invalid blog slug: ${slug}`);
  }
}

type ParsedFrontmatter = {
  metadata: Record<string, unknown>;
  content: string;
};

const FRONTMATTER_REGEX = /^---\s*\n([\s\S]*?)\n---\s*\n?/;

function parseFrontmatter(raw: string): ParsedFrontmatter {
  const match = raw.match(FRONTMATTER_REGEX);
  if (!match) {
    return { metadata: {}, content: raw.trim() };
  }

  const metadataBlock = match[1];
  const content = raw.slice(match[0].length).trim();
  const metadata: Record<string, unknown> = {};
  let currentKey: string | null = null;

  for (const line of metadataBlock.split(/\r?\n/)) {
    const keyMatch = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (keyMatch) {
      const [, key, value] = keyMatch;
      currentKey = key;

      if (!value || value === "|") {
        metadata[key] = [];
        continue;
      }

      if (value.startsWith("[")) {
        const entries = value
          .replace(/^[[]|[]]$/g, "")
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean);
        metadata[key] = entries;
        continue;
      }

      metadata[key] = value.trim();
      continue;
    }

    const listMatch = line.match(/^\s*-\s*(.*)$/);
    if (listMatch && currentKey) {
      const value = listMatch[1].trim();
      const existing = metadata[currentKey];
      if (Array.isArray(existing)) {
        existing.push(value);
        metadata[currentKey] = existing;
      } else if (existing !== undefined) {
        metadata[currentKey] = [String(existing), value];
      } else {
        metadata[currentKey] = [value];
      }
    }
  }

  return { metadata, content };
}

function normalizeString(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const hasWrappingQuotes =
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"));

  if (hasWrappingQuotes && trimmed.length >= 2) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
}

async function readPost(slug: string): Promise<BlogPost> {
  assertValidSlug(slug);
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
  const [raw, stats] = await Promise.all([fs.readFile(filePath, "utf-8"), fs.stat(filePath)]);
  const { metadata, content } = parseFrontmatter(raw);

  const title = normalizeString(metadata.title) || slug.replace(/-/g, " ");
  const description = normalizeString(metadata.description) || "";
  const explicitPublishedAt = normalizeString(metadata.publishedAt);
  const publishedAt = explicitPublishedAt
    ? explicitPublishedAt
    : metadata.publishedAt instanceof Date
      ? (metadata.publishedAt as Date).toISOString()
      : stats.mtime.toISOString();
  const tags = normalizeTags(metadata.tags);

  return {
    slug,
    title,
    description,
    publishedAt,
    tags,
    content: content.trim(),
  };
}

export async function listBlogPostSummaries(): Promise<BlogPostSummary[]> {
  const entries = await fs.readdir(POSTS_DIR);
  const slugs = entries
    .map((file) => {
      const match = file.match(/^([a-z0-9-]+)\.mdx$/);
      return match ? match[1] : null;
    })
    .filter((value): value is string => Boolean(value));

  const posts = await Promise.all(slugs.map((slug) => readPost(slug)));

  return posts
    .map(({ content, ...summary }) => summary)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export async function listBlogPostSlugs(): Promise<string[]> {
  const summaries = await listBlogPostSummaries();
  return summaries.map((post) => post.slug);
}

export async function loadBlogPostBySlug(slug: string): Promise<BlogPost> {
  return readPost(slug);
}
