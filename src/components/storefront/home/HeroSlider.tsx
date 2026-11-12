"use client";

// Ported from dine-client's components/hero/HeroSlider.tsx, then redesigned: the original used a
// full-bleed stock-photo slideshow with a dark overlay and bottom slide-dots -- visually almost
// identical to the restaurant detail page's own hero banner (OutletHeroCanvas's heroImage section
// uses the exact same "dark gradient over a photo + dot indicators" recipe), so the homepage and
// a restaurant's own page looked like the same screen at a glance. This version drops the photo
// carousel for a distinct brand-gradient + soft-blob treatment (same decorative-blob language
// OutletHeroCanvas's own background already uses elsewhere, just given its own color identity
// here) so the marketplace homepage reads as its own place, not a preview of a restaurant page.
// Search box, city picker and trending chips are unchanged real state, still passed down as props.
type HeroSliderProps = {
  search: string;
  onSearchChange: (value: string) => void;
  city: string;
  cities: string[];
  onCityChange: (value: string) => void;
  /** id of the real listings section (ClosestOutlets) to scroll to. */
  listingsSectionId: string;
};

const TRENDING_KEYWORDS = ["Pizza", "Biryani", "Burger", "Coffee"];

export function HeroSlider({
  search,
  onSearchChange,
  city,
  cities,
  onCityChange,
  listingsSectionId,
}: HeroSliderProps) {
  const handleExplore = () => {
    document.getElementById(listingsSectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-sf-secondary-container via-sf-primary to-sf-ink-wine text-sf-on-primary py-14 lg:py-20 border-b border-sf-border-divider/60">
      <div className="pointer-events-none absolute -left-20 -top-28 h-[28rem] w-[28rem] rounded-full bg-sf-primary-soft/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-sf-primary-container/30 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-8 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-sf-surface/10 backdrop-blur-md px-4 py-1.5 mb-5 border border-sf-surface/20 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-sf-veg-green animate-pulse" />
          <span className="font-sf-body text-xs text-sf-on-primary font-bold tracking-wide uppercase">
            Direct Restaurant Kitchen Routing
          </span>
          <span className="text-sf-on-primary/40 font-bold">•</span>
          <span className="font-sf-body text-xs text-sf-on-primary font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-sf-primary-container">bolt</span>
            Fresh, made-to-order favourites
          </span>
        </div>

        <h1 className="font-sf-headline text-3xl sm:text-4xl lg:text-5xl text-sf-on-primary tracking-tight font-extrabold leading-[1.15] max-w-3xl">
          Find your next favourite meal,{" "}
          <span className="text-sf-primary-container font-black underline decoration-sf-primary-soft decoration-4 underline-offset-4">
            straight from the kitchen
          </span>
          .
        </h1>

        <p className="font-sf-body text-base sm:text-lg text-sf-on-primary/90 mt-3 max-w-2xl leading-relaxed text-center font-normal">
          Daap Dine connects you directly with real restaurant kitchens near you -- no middleman
          menus, no stale listings.
        </p>

        <div className="mt-7 w-full max-w-2xl rounded-2xl bg-sf-surface p-2 shadow-2xl border border-sf-surface/20 text-sf-on-surface text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="flex items-center gap-2 shrink-0 rounded-xl bg-sf-surface-container-low px-3.5 py-2.5 text-sf-on-surface w-full sm:w-auto">
              <span
                className="material-symbols-outlined text-[18px] text-sf-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                my_location
              </span>
              <div className="text-left leading-none">
                <span className="block font-sf-body text-[11px] text-sf-text-muted font-medium">
                  City
                </span>
                <select
                  value={city}
                  onChange={(e) => onCityChange(e.target.value)}
                  className="font-sf-body text-xs font-bold truncate max-w-[130px] bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="">All cities</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative flex-1 w-full flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[20px] text-sf-text-muted">
                search
              </span>
              <input
                className="w-full bg-transparent pl-10 pr-3 py-2 font-sf-body text-sm text-sf-on-surface placeholder:text-sf-text-muted focus:outline-none"
                placeholder="Search restaurants or cuisines..."
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            <button
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sf-primary hover:bg-sf-secondary text-sf-on-primary font-sf-body text-sm font-bold tracking-wide flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer"
              type="button"
              onClick={handleExplore}
            >
              <span>Explore Menu</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="font-sf-body text-xs text-sf-on-primary/70 font-semibold">Trending:</span>
          {TRENDING_KEYWORDS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onSearchChange(tag)}
              className="rounded-full bg-sf-surface/10 backdrop-blur-md px-3 py-1 font-sf-body text-xs text-sf-on-primary hover:text-sf-on-primary hover:bg-sf-primary border border-sf-surface/20 transition-all cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="mt-7 pt-5 border-t border-sf-surface/10 w-full max-w-xl flex items-center justify-center gap-6 sm:gap-8 text-sf-on-primary/90">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sf-veg-green text-[22px]">verified</span>
            <div className="text-left">
              <span className="block font-sf-body text-sm font-bold text-sf-on-primary">
                Real Restaurants
              </span>
              <span className="font-sf-body text-[12px] text-sf-on-primary/70">
                Live menus, straight from the kitchen
              </span>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-sf-surface/20" />
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sf-primary-container text-[22px]">radar</span>
            <div className="text-left">
              <span className="block font-sf-body text-sm font-bold text-sf-on-primary">
                Local Discovery
              </span>
              <span className="font-sf-body text-[12px] text-sf-on-primary/70">
                Filter by city to find what&apos;s open
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
