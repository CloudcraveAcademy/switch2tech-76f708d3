// Convert common share URLs (Google Drive, Dropbox) into direct-viewable image URLs
export const normalizeImageUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  const trimmed = url.trim();

  // Google Drive: https://drive.google.com/file/d/<ID>/view?...
  const driveFile = trimmed.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveFile) {
    return `https://drive.google.com/thumbnail?id=${driveFile[1]}&sz=w1000`;
  }
  // Google Drive open?id=<ID>
  const driveOpen = trimmed.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (driveOpen) {
    return `https://drive.google.com/thumbnail?id=${driveOpen[1]}&sz=w1000`;
  }
  // Dropbox share link -> raw
  if (/dropbox\.com/.test(trimmed)) {
    return trimmed.replace("?dl=0", "?raw=1").replace("www.dropbox.com", "dl.dropboxusercontent.com");
  }
  return trimmed;
};
