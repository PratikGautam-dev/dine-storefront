"use client";

// Zomato-style sort/filter bar for the home page's "Browse All Restaurants" grid
// (ClosestOutlets). Sort is a client-side re-order of the already-fetched outlets list (rating,
// price tier, or prep time -- all real fields every card already carries, no second fetch).
// Filters are client-side too: veg-only (Outlet.hasVeg) and open-now (Outlet.isOpen, already
// shown as a badge on every card). Same "rounded pill, active = sf-primary fill" chip styling
// ChainsDirectory.tsx's own cuisine filter already established, reused here rather than a new
// one-off look.
import { priceTier, type Outlet } from "@/components/storefront/types";

export type SortKey = "rating" | "price" | "eta";
export type Filters = { vegOnly: boolean; openOnly: boolean };

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "rating", label: "Rating" },
  { key: "price", label: "Price: Low to High" },
  { key: "eta", label: "Delivery Time" },
];

const PRICE_RANK: Record<string, number> = { "₹": 0, "₹₹": 1, "₹₹₹": 2 };

export function applySortAndFilters(outlets: Outlet[], sort: SortKey, filters: Filters): Outlet[] {
  let result = outlets;
  // "Pure Veg" means ONLY vegetarian items, not merely "has some veg options" -- a restaurant
  // that serves both veg and non-veg items must NOT pass this filter, same as Zomato's own.
  if (filters.vegOnly) result = result.filter((o) => o.hasVeg && !o.hasNonVeg);
  if (filters.openOnly) result = result.filter((o) => o.isOpen);

  const sorted = [...result];
  if (sort === "rating") {
    sorted.sort((a, b) => (b.rating?.average ?? -1) - (a.rating?.average ?? -1));
  } else if (sort === "price") {
    sorted.sort((a, b) => {
      const ap = priceTier(a.minOrderPaise);
      const bp = priceTier(b.minOrderPaise);
      return (ap ? PRICE_RANK[ap] : 99) - (bp ? PRICE_RANK[bp] : 99);
    });
  } else if (sort === "eta") {
    sorted.sort((a, b) => (a.avgPrepMinutes ?? 999) - (b.avgPrepMinutes ?? 999));
  }
  return sorted;
}

type Props = {
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
};

export function FilterBar({ sort, onSortChange, filters, onFiltersChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      {SORT_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onSortChange(opt.key)}
          className={`rounded-full px-4 py-2 font-sf-body text-xs font-bold transition-all shrink-0 cursor-pointer ${
            sort === opt.key
              ? "bg-sf-primary text-sf-on-primary shadow-sm"
              : "bg-sf-surface-container-low text-sf-text-body hover:bg-sf-surface-container-high"
          }`}
        >
          {opt.label}
        </button>
      ))}
      <span className="mx-1 h-5 w-px bg-sf-border-divider shrink-0" />
      <button
        type="button"
        onClick={() => onFiltersChange({ ...filters, vegOnly: !filters.vegOnly })}
        className={`rounded-full px-4 py-2 font-sf-body text-xs font-bold transition-all shrink-0 cursor-pointer inline-flex items-center gap-1.5 ${
          filters.vegOnly
            ? "bg-sf-veg-green text-sf-on-primary shadow-sm"
            : "bg-sf-surface-container-low text-sf-text-body hover:bg-sf-surface-container-high"
        }`}
      >
        <span
          className={`h-2.5 w-2.5 rounded-full border ${filters.vegOnly ? "border-sf-on-primary bg-sf-on-primary" : "border-sf-veg-green"}`}
        />
        Pure Veg
      </button>
      <button
        type="button"
        onClick={() => onFiltersChange({ ...filters, openOnly: !filters.openOnly })}
        className={`rounded-full px-4 py-2 font-sf-body text-xs font-bold transition-all shrink-0 cursor-pointer ${
          filters.openOnly
            ? "bg-sf-primary text-sf-on-primary shadow-sm"
            : "bg-sf-surface-container-low text-sf-text-body hover:bg-sf-surface-container-high"
        }`}
      >
        Open Now
      </button>
    </div>
  );
}
