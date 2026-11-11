"use client";

// Real restaurant favorites/wishlist (backend migration 0087) -- distinct from
// useAccountLoyalty.ts's useAccountFavorites(), which is really "most-ordered dishes" derived
// from order history, not an actual save action. This is the real thing: a customer taps a heart
// on a restaurant card (or the restaurant detail hero) to save/unsave it, backed by
// POST/DELETE /api/public/favorites/{restaurant_id} and GET /api/public/favorites.
//
// Module-level store (same "shared state without a Provider" shape customerAuth.ts's
// useCustomerSession already uses via useSyncExternalStore) rather than a React Context -- a
// heart tapped on a home-page card and the same restaurant's heart on its own detail page should
// both reflect the toggle immediately, with no prop-drilling or new Provider wiring needed.
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { publicFetch } from "@/lib/customerAuth";
import { toast } from "@/lib/toast";
import type { RestaurantCard } from "@/components/storefront/types";

let favoriteIds: Set<number> | null = null; // null = not loaded yet this session
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return favoriteIds;
}

async function ensureLoaded(): Promise<void> {
  if (favoriteIds !== null) return;
  if (!loadPromise) {
    loadPromise = (async () => {
      const result = await publicFetch<{ restaurants: RestaurantCard[] }>("/api/public/favorites");
      favoriteIds = new Set(result.ok ? result.data.restaurants.map((r) => r.restaurant_id) : []);
      emit();
    })();
  }
  await loadPromise;
}

/** Resets the in-memory favorites cache -- call this on logout so a new customer's session
 * doesn't briefly see the previous customer's saved restaurants before their own list loads. */
export function resetFavoritesCache() {
  favoriteIds = null;
  loadPromise = null;
  emit();
}

/** Loads (once per session) and subscribes to the set of this customer's favorited restaurant
 * ids -- cheap, id-only state for showing heart-filled on any card. `ready` gates the initial
 * load the same way every other account/* hook does (wait for the logged-in check first). */
export function useFavoriteIds(ready: boolean): Set<number> {
  const ids = useSyncExternalStore(subscribe, getSnapshot, () => null);
  useEffect(() => {
    if (ready) void ensureLoaded();
  }, [ready]);
  return ids ?? new Set<number>();
}

/** Optimistic toggle -- flips the local Set (and every subscribed heart) immediately, then calls
 * the real endpoint; rolls back and toasts an error if the request fails. Safe to call before
 * the initial load finishes (toggling against an empty Set briefly, corrected once ensureLoaded()
 * resolves). */
export function useFavoriteToggle() {
  return useCallback(async (restaurantId: number) => {
    const current = favoriteIds ?? new Set<number>();
    const wasFavorited = current.has(restaurantId);

    const optimistic = new Set(current);
    if (wasFavorited) optimistic.delete(restaurantId);
    else optimistic.add(restaurantId);
    favoriteIds = optimistic;
    emit();

    const result = wasFavorited
      ? await publicFetch(`/api/public/favorites/${restaurantId}`, { method: "DELETE" })
      : await publicFetch(`/api/public/favorites/${restaurantId}`, { method: "POST" });

    if (!result.ok) {
      // Roll back on failure -- the heart snaps back to what it actually is server-side.
      const rolledBack = new Set(favoriteIds ?? new Set<number>());
      if (wasFavorited) rolledBack.add(restaurantId);
      else rolledBack.delete(restaurantId);
      favoriteIds = rolledBack;
      emit();
      toast.error(result.error);
      return;
    }
    toast.success(wasFavorited ? "Removed from favorites" : "Saved to favorites");
  }, []);
}

/** Account page's real Favourites tab -- the full saved-restaurant card list
 * (GET /api/public/favorites), not derived from order history. Its own small fetch rather than
 * reusing useFavoriteIds()'s cache: card data (rating, is_open, etc.) can go stale while the id
 * Set alone stays fresh, so the tab always asks for a fresh full list when it mounts. */
export function useFavoriteRestaurants(ready: boolean) {
  const [restaurants, setRestaurants] = useState<RestaurantCard[] | null>(null);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    (async () => {
      const result = await publicFetch<{ restaurants: RestaurantCard[] }>("/api/public/favorites");
      if (!cancelled && result.ok) setRestaurants(result.data.restaurants);
    })();
    return () => {
      cancelled = true;
    };
  }, [ready]);

  return { restaurants };
}
