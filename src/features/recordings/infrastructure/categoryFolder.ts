/**
 * Maps a recording's category to a storage "folder" segment used as a key
 * prefix (S3 object key / local file path). Recordings without a category
 * land in "uncategorized". Path separators are stripped so a category name
 * can never create nested folders.
 */
export function categoryFolder(category?: string): string {
  const name = category?.trim();
  if (!name) return "uncategorized";
  return name.replace(/[/\\]/g, "_");
}
