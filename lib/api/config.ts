export function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (url) {
    return url.replace(/\/$/, '');
  }
  // Same-origin proxy via Next.js rewrites (see next.config.mjs).
  return '';
}
