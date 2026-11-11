"use client";

// Shared heart/save button for a restaurant -- used on home-page cards (ClosestOutlets'
// OutletCard, ChainsDirectory's restaurant card) and the restaurant detail hero
// (OutletHeroCanvas). Reads/writes the real favorites store (src/lib/useFavorites.ts), not the
// order-history-derived "most ordered dishes" feature. Renders filled/unfilled purely off the
// shared useFavoriteIds() cache (not a prop), so every heart on screen for the same restaurant
// stays in sync the instant one of them is tapped.
import { useRouter } from "next/navigation";
import { useCustomerSession } from "@/lib/customerAuth";
import { useFavoriteIds, useFavoriteToggle } from "@/lib/useFavorites";
import { cn } from "@/lib/cn";

type Props = {
  restaurantId: number;
  className?: string;
  size?: "sm" | "md";
};

export function FavoriteHeartButton({ restaurantId, className, size = "md" }: Props) {
  const router = useRouter();
  const session = useCustomerSession();
  const favoriteIds = useFavoriteIds(!!session);
  const toggleFavorite = useFavoriteToggle();
  const isFavorited = favoriteIds.has(restaurantId);
  const dimension = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const iconSize = size === "sm" ? "text-[16px]" : "text-[18px]";

  function handleClick(e: React.MouseEvent) {
    // Every card this renders inside is itself a <Link> -- stop the click from also navigating.
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      router.push("/order/login");
      return;
    }
    void toggleFavorite(restaurantId);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isFavorited ? "Remove from favorites" : "Save to favorites"}
      aria-pressed={isFavorited}
      className={cn(
        "flex items-center justify-center rounded-full bg-sf-surface/90 backdrop-blur-sm shadow-md transition-colors cursor-pointer hover:bg-sf-surface",
        dimension,
        className,
      )}
    >
      <span
        className={cn("material-symbols-outlined", iconSize, isFavorited ? "text-sf-primary" : "text-sf-text-muted")}
        style={isFavorited ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        favorite
      </span>
    </button>
  );
}
