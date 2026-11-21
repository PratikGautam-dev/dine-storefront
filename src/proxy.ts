import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Tenant subdomains: <slug>.localhost:3001 (dev) and <slug>.<NEXT_PUBLIC_ROOT_DOMAIN> (prod) show that
// restaurant's storefront; the plain host (localhost:3001, <root domain>, www.<root domain>) is the
// marketplace. Pages themselves stay at /[slug], so this only:
//   1. rewrites "/" on a tenant host to "/<slug>" (the address bar keeps showing haldiram.domain.com), and
//   2. redirects the marketplace's "/<slug>" links to "<slug>.<host>".
// Everything under /order (cart, login, account...) is the same on every host.

const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "")
  .trim()
  .toLowerCase()
  .replace(/^\.+|\.+$/g, "");
const RESERVED = new Set(["www", "app", "api", "admin"]);
// First path segments that are real routes, not restaurant slugs.
const NON_SLUG_SEGMENTS = new Set(["order"]);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
type Resolved = { slug: string; redirect_host: string | null } | null;
const resolved = new Map<string, { at: number; value: Resolved }>();

/** Which restaurant answers on a host (Settings > Domains), and the primary domain to send visitors to instead, if any. Cached for a minute;
 * a backend that can't be reached counts as "unknown" for this request only. */
async function resolveHost(hostname: string): Promise<Resolved> {
  const hit = resolved.get(hostname);
  if (hit && Date.now() - hit.at < 60_000) return hit.value;
  try {
    const res = await fetch(`${API_BASE_URL}/api/public/domains/resolve?host=${encodeURIComponent(hostname)}`, { cache: "no-store" });
    const value: Resolved = res.ok ? await res.json() : null;
    if (res.ok || res.status === 404) resolved.set(hostname, { at: Date.now(), value });
    return value;
  } catch {
    return null;
  }
}

/** A host that could be a restaurant's own domain: not the marketplace, not a preview/dev address, not an IP. */
function maybeCustomDomain(hostname: string, isMarketplaceHost: boolean): boolean {
  return !isMarketplaceHost && hostname !== "localhost" && !hostname.endsWith(".vercel.app") && !hostname.endsWith(".localhost") && !/^[\d.]+$/.test(hostname) && hostname.includes(".");
}

function redirectTo(request: NextRequest, host: string) {
  const protocol = host.endsWith(".localhost") || host === "localhost" ? "http" : "https";
  const port = protocol === "http" && request.nextUrl.port ? `:${request.nextUrl.port}` : "";
  return NextResponse.redirect(new URL(`${protocol}://${host}${port}${request.nextUrl.pathname}${request.nextUrl.search}`), 307);
}

/** The tenant slug from a Host header, or null for the marketplace host. */
function tenantFrom(hostname: string): string | null {
  const suffixes = [".localhost", ...(ROOT_DOMAIN ? [`.${ROOT_DOMAIN}`] : [])];
  for (const suffix of suffixes) {
    if (hostname.endsWith(suffix)) {
      const sub = hostname.slice(0, -suffix.length);
      if (sub && !sub.includes(".") && !RESERVED.has(sub)) return sub;
    }
  }
  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get("host") || request.nextUrl.host;
  const hostname = host.split(":")[0].toLowerCase();
  const tenant = tenantFrom(hostname);

  const isMarketplaceHost =
    hostname === "localhost" ||
    (ROOT_DOMAIN !== "" && (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`));

  if (tenant) {
    // A restaurant with a primary custom domain sends its other addresses there.
    const known = await resolveHost(hostname);
    if (known?.redirect_host) return redirectTo(request, known.redirect_host);
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = `/${tenant}`;
      return NextResponse.rewrite(url);
    }
    // /policies/<kind> is the restaurant's written policy page, which lives at /[slug]/policies/<kind>.
    if (pathname.startsWith("/policies/")) {
      const url = request.nextUrl.clone();
      url.pathname = `/${tenant}${pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // A restaurant's own domain (Settings > Domains): show its storefront, or send the visitor to its primary domain.
  if (maybeCustomDomain(hostname, isMarketplaceHost)) {
    const known = await resolveHost(hostname);
    if (known?.redirect_host) return redirectTo(request, known.redirect_host);
    if (known) {
      if (pathname === "/" || pathname.startsWith("/policies/")) {
        const url = request.nextUrl.clone();
        url.pathname = `/${known.slug}${pathname === "/" ? "" : pathname}`;
        return NextResponse.rewrite(url);
      }
      return NextResponse.next();
    }
  }

  // Marketplace host: /<slug> -> <slug>.<host> (only where a root domain is known, so a preview or
  // Vercel URL with no wildcard DNS keeps working with plain /<slug> paths).
  const segments = pathname.split("/").filter(Boolean);
  if (
    isMarketplaceHost &&
    segments.length === 1 &&
    !NON_SLUG_SEGMENTS.has(segments[0]) &&
    !segments[0].includes(".")
  ) {
    const base = hostname === "localhost" ? "localhost" : ROOT_DOMAIN;
    const port = host.includes(":") ? `:${host.split(":")[1]}` : "";
    const target = new URL(
      `${request.nextUrl.protocol}//${segments[0]}.${base}${port}/${search}`,
    );
    return NextResponse.redirect(target);
  }
  return NextResponse.next();
}

export const config = {
  // skip Next internals and files in /public (anything with an extension)
  matcher: ["/((?!_next/|api/|.*\\..*).*)"],
};
