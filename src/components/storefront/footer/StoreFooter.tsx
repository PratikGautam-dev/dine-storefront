"use client";

import Link from "next/link";
import { POLICY_ORDER, useStoreContext, usePublicPolicies } from "@/lib/policies";

const heading = "mb-3 font-sf-headline text-[12px] font-bold uppercase tracking-wider text-sf-text-muted";
const link = "text-[13.5px] text-sf-text-body transition-colors hover:text-sf-primary hover:underline";

/** The restaurant storefront's footer: brand, quick links, contact details and every policy the restaurant has published (portal Settings >
 * Policies). Shows only on a restaurant's own pages (its host, or /<slug>), never on the marketplace. */
export function StoreFooter() {
  const { slug, home, policyHref } = useStoreContext();
  const data = usePublicPolicies(slug);
  if (!slug || !data) return null;
  const policies = POLICY_ORDER.filter((k) => data.policies[k]);
  const quick = [
    { label: "Menu", href: home },
    { label: "Book a table", href: "/order/book-table" },
    { label: "My orders", href: "/order/orders" },
    { label: "My account", href: "/order/account" },
  ];
  const hasContact = data.phone || data.email || data.address;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-sf-border-divider bg-sf-surface font-sf-body">
      <div className="mx-auto grid max-w-[1100px] gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1.3fr_1.2fr]">
        <div>
          <div className="flex items-center gap-3">
            {data.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.logo_url} alt="" className="h-11 w-11 rounded-xl border border-sf-border-divider object-cover" />
            ) : (
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sf-primary text-sf-on-primary">
                <span className="material-symbols-outlined text-[22px]">restaurant</span>
              </span>
            )}
            <p className="font-sf-headline text-[18px] font-extrabold text-sf-on-surface">{data.restaurant_name}</p>
          </div>
          {data.tagline && <p className="mt-3 max-w-[280px] text-[13.5px] leading-relaxed text-sf-text-body">{data.tagline}</p>}
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-sf-primary-light px-3 py-1 text-[12px] font-semibold text-sf-primary">
            <span className="material-symbols-outlined text-[15px]">shopping_bag</span> Order online
          </p>
        </div>

        <nav aria-label="Quick links">
          <h3 className={heading}>Explore</h3>
          <ul className="space-y-2.5">
            {quick.map((q) => (
              <li key={q.label}>
                <Link href={q.href} className={link}>{q.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        {hasContact && (
          <div>
            <h3 className={heading}>Contact</h3>
            <ul className="space-y-2.5 text-[13.5px] text-sf-text-body">
              {data.address && (
                <li className="flex gap-2">
                  <span className="material-symbols-outlined mt-0.5 text-[17px] text-sf-primary">location_on</span>
                  <span>{data.address}</span>
                </li>
              )}
              {data.phone && (
                <li className="flex gap-2">
                  <span className="material-symbols-outlined mt-0.5 text-[17px] text-sf-primary">call</span>
                  <a href={`tel:${data.phone}`} className="hover:text-sf-primary hover:underline">{data.phone}</a>
                </li>
              )}
              {data.email && (
                <li className="flex gap-2">
                  <span className="material-symbols-outlined mt-0.5 text-[17px] text-sf-primary">mail</span>
                  <a href={`mailto:${data.email}`} className="break-all hover:text-sf-primary hover:underline">{data.email}</a>
                </li>
              )}
            </ul>
          </div>
        )}

        {policies.length > 0 && (
          <nav aria-label="Policies">
            <h3 className={heading}>Policies</h3>
            <ul className="space-y-2.5">
              {policies.map((k) => (
                <li key={k}>
                  <Link href={policyHref(k)} className={link}>{data.policies[k]!.title}</Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      <div className="border-t border-sf-border-divider">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-1 px-5 py-4 text-[12px] text-sf-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {data.restaurant_name}. All rights reserved.</p>
          <p>Powered by Dine Connect</p>
        </div>
      </div>
    </footer>
  );
}
