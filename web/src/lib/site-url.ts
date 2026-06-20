/**
 * Public origin of the site, used to build absolute redirect URLs server-side.
 *
 * Behind the Caddy reverse proxy, `request.url` / `request.nextUrl.origin`
 * resolve to the container's internal bind address (e.g. 0.0.0.0:3000) instead
 * of the real domain, which leaks into auth redirects. Always build redirects
 * against this configured value instead.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

/** Resolve a relative path (e.g. "/app") to an absolute URL on the public site. */
export function siteUrl(path: string): URL {
  return new URL(path, SITE_URL)
}
