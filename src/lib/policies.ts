"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { publicFetch } from "@/lib/customerAuth";

/** A restaurant's published written policies (portal Settings > Policies): only the ones it has written are present. */
export type PublicPolicies = {
  restaurant_name: string;
  tagline: string | null;
  logo_url: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  policies: Partial<Record<PolicyKind, { title: string; body_html: string }>>;
};
export type PolicyKind = "returns" | "privacy" | "terms" | "contact" | "legal";

/** Footer order. */
export const POLICY_ORDER: PolicyKind[] = ["returns", "privacy", "terms", "contact", "legal"];

const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "").trim().toLowerCase().replace(/^\.+|\.+$/g, "");

/** The tenant slug when the page is on a tenant host (<slug>.localhost, <slug>.<root domain>), else null. Mirrors src/proxy.ts. */
export function tenantFromHost(hostname: string): string | null {
  const h = hostname.toLowerCase();
  for (const suffix of [".localhost", ...(ROOT_DOMAIN ? [`.${ROOT_DOMAIN}`] : [])]) {
    if (h.endsWith(suffix)) {
      const sub = h.slice(0, -suffix.length);
      if (sub && !sub.includes(".") && !["www", "app", "api", "admin"].includes(sub)) return sub;
    }
  }
  return null;
}

/** On a restaurant's own domain (Settings > Domains) the slug is not in the address: ask the backend which restaurant the host belongs to. */
function useCustomDomainSlug(enabled: boolean): string | null {
  const [found, setFound] = useState<{ host: string; slug: string | null } | null>(null);
  const host = typeof window === "undefined" ? "" : window.location.hostname;
  const root = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "").trim().toLowerCase();
  const plain = !host || (root !== "" && (host === root || host === `www.${root}`)) || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".vercel.app") || /^[\d.]+$/.test(host);
  useEffect(() => {
    if (!enabled || plain) return;
    let cancelled = false;
    publicFetch<{ slug: string }>(`/api/public/domains/resolve?host=${encodeURIComponent(host)}`).then((r) => {
      if (!cancelled) setFound({ host, slug: r.ok ? r.data.slug : null });
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, plain, host]);
  return enabled && found?.host === host ? found.slug : null;
}

/** The restaurant this page belongs to and how to link to its policy pages from here: on a tenant host the address bar has no slug prefix. */
export function useStoreContext(): { slug: string | null; home: string; onTenantHost: boolean; policyHref: (kind: PolicyKind) => string } {
  const pathname = usePathname();
  const hostTenant = useSyncExternalStore(
    () => () => {},
    () => tenantFromHost(window.location.hostname),
    () => null,
  );
  const customSlug = useCustomDomainSlug(hostTenant === null);
  const first = pathname.split("/").filter(Boolean)[0] ?? null;
  const onHost = hostTenant ?? customSlug;
  const slug = onHost ?? (first && first !== "order" ? first : null);
  return { slug, home: onHost ? "/" : `/${slug}`, onTenantHost: onHost !== null, policyHref: (kind) => (onHost ? `/policies/${kind}` : `/${slug}/policies/${kind}`) };
}

const cache = new Map<string, Promise<PublicPolicies | null>>();

/** The published policies for a slug (null while loading or if the restaurant is unknown). Cached per slug for the session of the page. */
export function usePublicPolicies(slug: string | null): PublicPolicies | null | undefined {
  const [state, setState] = useState<{ slug: string | null; data: PublicPolicies | null } | undefined>();
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    let p = cache.get(slug);
    if (!p) {
      p = publicFetch<PublicPolicies>(`/api/public/restaurants/${encodeURIComponent(slug)}/policies`).then((r) => (r.ok ? r.data : null));
      cache.set(slug, p);
      // A failed fetch must not stick for the whole session.
      p.then((d) => d ?? cache.delete(slug));
    }
    p.then((data) => !cancelled && setState({ slug, data }));
    return () => {
      cancelled = true;
    };
  }, [slug]);
  return slug && state?.slug === slug ? state.data : undefined;
}
