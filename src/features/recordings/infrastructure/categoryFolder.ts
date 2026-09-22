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

/**
 * Storage folder for a recording's blob key:
 *   clip practice  → `clips/<clipId>/`   (all attempts of one clip together)
 *   retell         → `retell/<videoRef>/` (free recap of a whole video)
 *   anything else  → its category folder
 */
export function recordingFolder(meta: {
  category?: string;
  videoRef?: string;
  clipId?: string;
}): string {
  if (meta.clipId) return `clips/${meta.clipId}`;
  if (meta.videoRef) return `retell/${meta.videoRef}`;
  return categoryFolder(meta.category);
}
