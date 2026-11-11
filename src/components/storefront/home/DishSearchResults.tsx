"use client";

// Zomato puts a "Dishes" section under "Restaurants" on a search -- this is that section. Each
// row is a small dish card (photo, name, price, veg dot) linking straight to that dish's
// restaurant, rather than making the customer hunt through the restaurant for it themselves.
import Link from "next/link";
import { rupees } from "@/lib/foodOrders";
import type { DishSearchResult } from "@/components/storefront/types";

type Props = {
  results: DishSearchResult[];
};

export function DishSearchResults({ results }: Props) {
  if (results.length === 0) return null;

  return (
    <section className="w-full py-8 px-4 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-sf-headline text-xl font-extrabold text-sf-on-surface mb-4">
          Dishes matching your search
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map(({ item, restaurant }) => (
            <Link
              key={item.id}
              href={`/${restaurant.slug}`}
              className="flex items-center gap-3 rounded-xl bg-sf-surface border border-sf-border-divider/70 p-3 shadow-sm hover:shadow-md transition-all"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-sf-surface-container-low">
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="h-full w-full object-cover" src={item.image_url} alt={item.name} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sf-text-muted">
                    <span className="material-symbols-outlined text-[24px]">restaurant</span>
                  </div>
                )}
                {item.is_veg != null && (
                  <span
                    className={`absolute top-1 left-1 h-2.5 w-2.5 rounded-full border ${
                      item.is_veg ? "border-sf-veg-green bg-sf-veg-green" : "border-sf-error bg-sf-error"
                    }`}
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-sf-body text-sm font-bold text-sf-on-surface truncate">{item.name}</p>
                <p className="font-sf-body text-xs text-sf-text-muted truncate">{restaurant.name}</p>
                <p className="font-sf-body text-xs font-semibold text-sf-primary mt-0.5">
                  {rupees(item.price_paise)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
