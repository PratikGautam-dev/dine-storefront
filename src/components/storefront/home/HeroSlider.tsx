"use client";

// Ported from dine-client's components/hero/HeroSlider.tsx, then redesigned twice: first to a
// full-bleed background photo (too close to OutletHeroCanvas's own "dark gradient over a photo"
// recipe, and the photo made the hero read as too dark overall), now a two-column split -- a
// solid-dark text panel on the left (headline, search, trending chips) and the food photo
// (public/hero/homepage-hero.png) confined to the right column, blended into the dark panel via
// a left-edge gradient mask instead of a hard seam. Search box, city picker and trending chips
// are unchanged real state, still passed down as props.
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
    <section className="relative w-full overflow-hidden rounded-b-[2rem] bg-sf-ink text-sf-on-primary sm:rounded-b-[2.5rem]">
      <div className="pointer-events-none absolute -left-16 -top-16 h-72 w-72 rounded-full bg-sf-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 top-1/3 h-56 w-56 rounded-full bg-sf-primary-container/20 blur-3xl" />

      <div className="relative mx-auto flex max-w-7xl flex-col lg:flex-row lg:items-stretch">
        <div className="relative z-10 flex flex-1 flex-col justify-center gap-4 px-4 py-10 sm:px-8 lg:max-w-xl lg:py-16">
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-sf-primary px-3.5 py-1.5 shadow-[0_0_0_4px_rgba(183,18,42,0.15)]">
            <span className="material-symbols-outlined text-[15px]">bolt</span>
            <span className="font-sf-body text-xs font-bold tracking-wide">Food. Faster. Better.</span>
          </div>

          <h1 className="font-sf-headline text-3xl sm:text-4xl lg:text-[2.75rem] text-sf-on-primary tracking-tight font-extrabold leading-[1.12]">
            Find your next favourite meal,{" "}
            <span className="text-sf-primary-container">straight from the kitchen.</span>
          </h1>

          <p className="font-sf-body text-base text-sf-on-primary/80 leading-relaxed max-w-lg">
            Dine Connect brings the best restaurants near you — no middleman menus, no stale
            listings.
          </p>

          <div className="mt-2 w-full max-w-lg rounded-2xl bg-sf-surface p-2 shadow-2xl border border-sf-surface/20 text-sf-on-surface">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center gap-2 shrink-0 rounded-xl bg-sf-surface-container-low px-3.5 py-2.5 text-sf-on-surface w-full sm:w-auto">
                <span
                  className="material-symbols-outlined text-[18px] text-sf-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  my_location
                </span>
                <select
                  value={city}
                  onChange={(e) => onCityChange(e.target.value)}
                  className="font-sf-body text-xs font-bold truncate max-w-[110px] bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="">All cities</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
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
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sf-primary hover:bg-sf-secondary text-sf-on-primary font-sf-body text-sm font-bold tracking-wide flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer"
                type="button"
                onClick={handleExplore}
              >
                <span>Explore Menu</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="font-sf-body text-xs text-sf-on-primary/60 font-semibold">Trending:</span>
            {TRENDING_KEYWORDS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onSearchChange(tag)}
                className="rounded-full bg-sf-surface/10 backdrop-blur-md px-3 py-1 font-sf-body text-xs text-sf-on-primary hover:bg-sf-primary border border-sf-surface/20 transition-all cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mx-4 mb-6 aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl ring-1 ring-sf-surface/10 sm:mx-8 sm:aspect-[16/9] lg:m-0 lg:aspect-auto lg:h-auto lg:flex-1 lg:rounded-none lg:shadow-none lg:ring-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero/homepage-hero.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[78%_center] lg:object-right"
          />
          {/* Blends the photo into the left panel's solid dark background instead of a hard seam. */}
          <div className="absolute inset-0 hidden bg-gradient-to-r from-sf-ink via-sf-ink/15 to-transparent lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-sf-ink/70 via-transparent to-transparent" />

          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-sf-surface/15 px-3 py-1.5 backdrop-blur-md border border-sf-surface/20 sm:bottom-4 sm:left-4">
            <span
              className="material-symbols-outlined text-[15px] text-sf-rating-amber"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
            <span className="font-sf-body text-[11px] font-bold tracking-wide text-sf-on-primary">
              Made fresh, served hot
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
