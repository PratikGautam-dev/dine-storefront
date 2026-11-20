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

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get("host") || request.nextUrl.host;
  const hostname = host.split(":")[0].toLowerCase();
  const tenant = tenantFrom(hostname);

  if (tenant) {
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = `/${tenant}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // Marketplace host: /<slug> -> <slug>.<host> (only where a root domain is known, so a preview or
  // Vercel URL with no wildcard DNS keeps working with plain /<slug> paths).
  const isMarketplaceHost =
    hostname === "localhost" ||
    (ROOT_DOMAIN !== "" &&
      (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`));
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
