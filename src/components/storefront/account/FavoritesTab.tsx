"use client";

import Link from "next/link";
import { Card } from "./Card";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { OutletCard } from "@/components/storefront/home/ClosestOutlets";
import { flattenToOutlets, type RestaurantCard } from "@/components/storefront/types";

/** The REAL "save this restaurant" wishlist -- GET /api/public/favorites
 * (src/lib/useFavorites.ts's useFavoriteRestaurants), a stored toggle action a customer actually
 * took (the heart on any restaurant card/detail hero), not derived from order history the way
 * MostOrderedTab.tsx is. Reuses OutletCard (home page's restaurant card) via flattenToOutlets so
 * a saved restaurant looks exactly like it does everywhere else on the storefront, heart and
 * all. */
export function FavoritesTab({ restaurants }: { restaurants: RestaurantCard[] | null }) {
  if (restaurants === null) {
    return (
      <Card className="p-6">
        <TableSkeleton rows={4} columns={1} />
      </Card>
    );
  }

  if (restaurants.length === 0) {
    return (
      <Card className="p-10 text-center">
        <span className="material-symbols-outlined text-sf-text-muted text-4xl">favorite</span>
        <h3 className="font-sf-headline text-lg font-bold mt-2">No saved restaurants yet</h3>
        <p className="font-sf-body text-sm text-sf-text-muted mt-1">
          Tap the heart on any restaurant to save it here.
        </p>
        <Link
          href="/"
          className="inline-flex mt-4 h-10 px-5 rounded-xl bg-sf-primary hover:bg-sf-secondary text-sf-on-primary font-sf-body text-sm font-bold items-center transition-colors"
        >
          Browse restaurants
        </Link>
      </Card>
    );
  }

  const outlets = flattenToOutlets(restaurants);

  return (
    <div className="space-y-4">
      <p className="font-sf-body text-xs text-sf-text-muted">Restaurants you&apos;ve saved, newest first.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {outlets.map((outlet) => (
          <OutletCard key={outlet.cardKey} outlet={outlet} />
        ))}
      </div>
    </div>
  );
}
