export function extractPublicId(url: string): string | null {
  try {
    const parts = url.split("/");
    const filename = parts[parts.length - 1];
    if (!filename) return null;
    const folder = parts.slice(parts.indexOf("upload") + 1, -1).join("/");
    const publicId = filename.split(".")[0];
    if (!publicId) return null;
    return folder ? `${folder}/${publicId}` : publicId;
  } catch (e) {
    return null;
  }
}