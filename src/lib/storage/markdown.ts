import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

export interface MarkdownDoc {
  frontmatter: Record<string, unknown>;
  content: string;
  slug: string;
  filePath: string;
}

export async function parseMarkdownFile(filePath: string): Promise<MarkdownDoc> {
  const raw = await fs.readFile(filePath, "utf-8");
  const { data, content } = matter(raw);
  const slug = path.basename(filePath, ".md");
  return { frontmatter: data, content: content.trim(), slug, filePath };
}

export function serializeMarkdown(
  frontmatter: Record<string, unknown>,
  content: string
): string {
  return matter.stringify(content ? `\n${content}` : "\n", frontmatter);
}

export async function writeMarkdownFile(
  filePath: string,
  frontmatter: Record<string, unknown>,
  content: string
): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, serializeMarkdown(frontmatter, content), "utf-8");
}

export async function readAllMarkdownFiles(dir: string): Promise<MarkdownDoc[]> {
  try {
    const files = await fs.readdir(dir);
    const mdFiles = files.filter((f) => f.endsWith(".md"));
    return Promise.all(
      mdFiles.map((f) => parseMarkdownFile(path.join(dir, f)))
    );
  } catch {
    return [];
  }
}
