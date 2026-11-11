"use client";

// Autocomplete dropdown for the Header search box -- "recent searches" (client-side only,
// localStorage) when the box is focused but empty, plus live restaurant/dish suggestions as the
// customer types, reusing the SAME two endpoints the home page's own debounced search already
// calls (GET /api/public/restaurants?search= and GET /api/public/dishes?q=). No new backend
// endpoint for this part.
import Link from "next/link";
import { useEffect, useState } from "react";
import { publicFetch } from "@/lib/customerAuth";
import type { DishSearchResult, RestaurantCard } from "@/components/storefront/types";
import { rupees } from "@/lib/foodOrders";

const RECENT_KEY = "dc_recent_searches";
const MAX_RECENT = 8;

export function loadRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(term: string) {
  const trimmed = term.trim();
  if (!trimmed || typeof window === "undefined") return;
  try {
    const existing = loadRecentSearches().filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
    const next = [trimmed, ...existing].slice(0, MAX_RECENT);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // localStorage can throw in private browsing / blocked storage -- recent search is a
    // convenience, not a feature worth breaking the search box over.
  }
}

type Props = {
  query: string;
  recent: string[];
  onClearRecent: () => void;
  onNavigate: () => void; // call after any navigation so the caller can close/blur the dropdown
};

export function SearchDropdown({ query, recent, onClearRecent, onNavigate }: Props) {
  const [restaurants, setRestaurants] = useState<RestaurantCard[]>([]);
  const [dishes, setDishes] = useState<DishSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const trimmed = query.trim();

  useEffect(() => {
    if (!trimmed) {
      setRestaurants([]);
      setDishes([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timeout = setTimeout(async () => {
      const [restaurantResult, dishResult] = await Promise.all([
        publicFetch<{ restaurants: RestaurantCard[] }>(`/api/public/restaurants?search=${encodeURIComponent(trimmed)}`),
        publicFetch<{ results: DishSearchResult[] }>(`/api/public/dishes?q=${encodeURIComponent(trimmed)}`),
      ]);
      if (cancelled) return;
      setRestaurants(restaurantResult.ok ? restaurantResult.data.restaurants.slice(0, 5) : []);
      setDishes(dishResult.ok ? dishResult.data.results.slice(0, 5) : []);
      setLoading(false);
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [trimmed]);

  const showRecent = !trimmed && recent.length > 0;
  const showSuggestions = trimmed.length > 0;
  const hasSuggestionResults = restaurants.length > 0 || dishes.length > 0;

  if (!showRecent && !showSuggestions) return null;

  return (
    <div className="absolute left-0 top-full mt-2 w-full max-h-[70vh] overflow-y-auto rounded-xl border border-sf-border-divider bg-sf-surface shadow-lg z-50 py-2">
      {showRecent && (
        <div>
          <div className="flex items-center justify-between px-3.5 pb-1 pt-1">
            <span className="font-sf-body text-[11px] font-bold uppercase tracking-wide text-sf-text-muted">
              Recent searches
            </span>
            <button
              type="button"
              className="font-sf-body text-[11px] font-semibold text-sf-primary hover:underline"
              onClick={onClearRecent}
            >
              Clear
            </button>
          </div>
          {recent.map((term) => (
            <Link
              key={term}
              href={`/?search=${encodeURIComponent(term)}`}
              onClick={onNavigate}
              className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-sf-surface-container-low"
            >
              <span className="material-symbols-outlined text-[18px] text-sf-text-muted">history</span>
              <span className="font-sf-body text-[13.5px] text-sf-on-surface truncate">{term}</span>
            </Link>
          ))}
        </div>
      )}

      {showSuggestions && (
        <div>
          {loading && (
            <p className="px-3.5 py-2 font-sf-body text-[12.5px] text-sf-text-muted">Searching…</p>
          )}

          {!loading && !hasSuggestionResults && (
            <p className="px-3.5 py-2 font-sf-body text-[12.5px] text-sf-text-muted">
              No matches -- press Enter to search anyway.
            </p>
          )}

          {restaurants.length > 0 && (
            <div>
              <p className="px-3.5 pb-1 pt-1 font-sf-body text-[11px] font-bold uppercase tracking-wide text-sf-text-muted">
                Restaurants
              </p>
              {restaurants.map((r) => (
                <Link
                  key={r.slug}
                  href={`/${r.slug}`}
                  onClick={onNavigate}
                  className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-sf-surface-container-low"
                >
                  <span className="material-symbols-outlined text-[18px] text-sf-primary">storefront</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-sf-body text-[13.5px] font-semibold text-sf-on-surface truncate">
                      {r.name}
                    </span>
                    {(r.city || r.cuisines.length > 0) && (
                      <span className="block font-sf-body text-[11.5px] text-sf-text-muted truncate">
                        {[r.city, r.cuisines.join(", ")].filter(Boolean).join(" • ")}
                      </span>
                    )}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {dishes.length > 0 && (
            <div>
              <p className="px-3.5 pb-1 pt-1 font-sf-body text-[11px] font-bold uppercase tracking-wide text-sf-text-muted">
                Dishes
              </p>
              {dishes.map(({ item, restaurant }) => (
                <Link
                  key={item.id}
                  href={`/${restaurant.slug}`}
                  onClick={onNavigate}
                  className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-sf-surface-container-low"
                >
                  <span className="material-symbols-outlined text-[18px] text-sf-text-muted">restaurant</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-sf-body text-[13.5px] font-semibold text-sf-on-surface truncate">
                      {item.name}
                    </span>
                    <span className="block font-sf-body text-[11.5px] text-sf-text-muted truncate">
                      {restaurant.name} • {rupees(item.price_paise)}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
