"use client";

// A restaurant's photo gallery (migration 0087) -- interior/food/ambience shots, separate from
// the single logo/cover-image fields OutletHeroCanvas already renders. A simple horizontal
// scrollable strip placed just below the hero, same "below the fold of the main card, above the
// menu" slot Zomato's own restaurant page uses for this. Only rendered when there's at least one
// real photo -- no empty-state placeholder.
type Props = { photos: string[]; restaurantName: string };

export function RestaurantPhotoGallery({ photos, restaurantName }: Props) {
  if (photos.length === 0) return null;

  return (
    <div className="relative mx-auto max-w-7xl px-4 pt-4 sm:px-8">
      <h2 className="mb-2 font-sf-headline text-sm font-bold text-sf-on-surface">Photos</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {photos.map((url, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={url + i}
            src={url}
            alt={`${restaurantName} photo ${i + 1}`}
            className="h-32 w-44 shrink-0 rounded-xl object-cover sm:h-40 sm:w-56"
          />
        ))}
      </div>
    </div>
  );
}
