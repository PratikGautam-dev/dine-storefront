// types.ts -- real API response shapes (GET /api/public/restaurants and the detail route) plus
// the flattened "one card per active branch" Outlet type the ported dine-client home/outlet UI
// renders. No fake fields (distance, discountBadge, highlights) are invented here; anything
// dine-client's original Outlet had that has no real backend data is simply absent from this
// type, and components read it defensively (e.g. `rating ?? null` → "New").

export type Branch = { id: string; slug: string | null; name: string; address_line: string | null; city: string | null };

export type RestaurantCard = {
  restaurant_id: number;
  name: string;
  slug: string;
  cuisines: string[];
  tagline: string | null;
  address_line: string | null;
  city: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  min_order_paise: number | null;
  avg_prep_minutes: number | null;
  is_open: boolean;
  storefront_locked: boolean;
  branches: Branch[];
  rating: { average: number; count: number } | null;
  has_veg: boolean;
  has_non_veg: boolean;
};

/** One card per active branch (2+ branches) or exactly one card for the restaurant itself
 * (0/1 branches) -- the "restaurant×branch flattened" home-page model. `branchId: null` means
 * the card should route to /order/{slug} with no branch pre-selected (today's single-location
 * behavior, unchanged); a non-null branchId pre-selects that branch via
 * /order/{slug}?branch=<branchSlug ?? branchId> -- branchSlug is preferred (a readable
 * "bandra-west" instead of the opaque h3_2bfb1b5b id) and falls back to branchId only for a
 * branch that predates the slug column somehow still being NULL. */
export type Outlet = {
  cardKey: string;
  slug: string;
  restaurantId: number;
  name: string;
  branchLabel: string | null;
  branchId: string | null;
  branchSlug: string | null;
  addressLine: string | null;
  city: string | null;
  cuisines: string[];
  logoUrl: string | null;
  coverImageUrl: string | null;
  isOpen: boolean;
  avgPrepMinutes: number | null;
  minOrderPaise: number | null;
  rating: { average: number; count: number } | null;
  hasVeg: boolean;
  hasNonVeg: boolean;
};

/** Zomato-style ₹/₹₹/₹₹₹ price-tier badge, bucketed off min_order_paise (the only real
 * price-ish signal on a restaurant card today -- there's no separate "average dish price"
 * field). Thresholds are a starting point, not a measured distribution; null below ₹1 of min
 * order (a restaurant with no minimum at all doesn't imply "cheap," it implies "unset"). */
export function priceTier(minOrderPaise: number | null): "₹" | "₹₹" | "₹₹₹" | null {
  if (minOrderPaise == null || minOrderPaise <= 0) return null;
  if (minOrderPaise < 20000) return "₹";
  if (minOrderPaise < 50000) return "₹₹";
  return "₹₹₹";
}

/** GET /api/public/dishes?q=... -- one row per matching menu item, paired with the full
 * restaurant card it belongs to (same shape list_public_restaurants() already builds). */
export type DishSearchResult = {
  item: {
    id: string;
    name: string;
    price_paise: number;
    image_url: string | null;
    is_veg: boolean | null;
  };
  restaurant: RestaurantCard;
};

export function flattenToOutlets(restaurants: RestaurantCard[]): Outlet[] {
  return restaurants.flatMap((r): Outlet[] => {
    if (r.branches.length === 0) {
      return [{
        cardKey: r.slug,
        slug: r.slug,
        restaurantId: r.restaurant_id,
        name: r.name,
        branchLabel: null,
        branchId: null,
        branchSlug: null,
        addressLine: r.address_line,
        city: r.city,
        cuisines: r.cuisines,
        logoUrl: r.logo_url,
        coverImageUrl: r.cover_image_url,
        isOpen: r.is_open,
        avgPrepMinutes: r.avg_prep_minutes,
        minOrderPaise: r.min_order_paise,
        rating: r.rating,
        hasVeg: r.has_veg,
        hasNonVeg: r.has_non_veg,
      }];
    }
    return r.branches.map((b) => ({
      cardKey: `${r.slug}:${b.id}`,
      slug: r.slug,
      restaurantId: r.restaurant_id,
      name: r.name,
      branchLabel: b.name,
      branchId: b.id,
      branchSlug: b.slug,
      addressLine: b.address_line ?? r.address_line,
      city: b.city ?? r.city,
      cuisines: r.cuisines,
      logoUrl: r.logo_url,
      coverImageUrl: r.cover_image_url,
      isOpen: r.is_open,
      avgPrepMinutes: r.avg_prep_minutes,
      minOrderPaise: r.min_order_paise,
      rating: r.rating,
      hasVeg: r.has_veg,
      hasNonVeg: r.has_non_veg,
    }));
  });
}
