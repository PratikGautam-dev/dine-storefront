// Order History (GET /api/public/orders), Profile/Addresses (GET/PUT /api/public/profile,
// useAccountProfile.ts), Membership/Credits (GET /api/public/profile/loyalty, /loyalty-ledger),
// Most Ordered (GET /api/public/profile/favorites, an order-history-derived insight -- see
// MostOrderedTab.tsx), and Favorites (GET /api/public/favorites, the REAL "save this restaurant"
// wishlist -- see FavoritesTab.tsx/src/lib/useFavorites.ts) are all real -- this file now only
// holds the tab list/type and the shared date formatters those real data hooks' components use.

export type AccountTab = "orders" | "membership" | "ledger" | "addresses" | "mostOrdered" | "favorites" | "settings";

export const TAB_LIST: { id: AccountTab; label: string; icon: string }[] = [
  { id: "orders", label: "Order History", icon: "receipt_long" },
  { id: "membership", label: "Membership & Rewards", icon: "military_tech" },
  { id: "ledger", label: "Credits Ledger", icon: "wallet" },
  { id: "addresses", label: "Saved Addresses", icon: "home_pin" },
  { id: "mostOrdered", label: "Most Ordered", icon: "local_fire_department" },
  { id: "favorites", label: "Favorites", icon: "favorite" },
  { id: "settings", label: "Profile Settings", icon: "manage_accounts" },
];

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const MONTH_YEAR_FORMAT = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

/** ISO dates are parsed and formatted in UTC so server and client always agree */
export function formatShortDate(iso: string) {
  return DATE_FORMAT.format(new Date(iso));
}

export function formatMonthYear(iso: string) {
  return MONTH_YEAR_FORMAT.format(new Date(iso));
}
