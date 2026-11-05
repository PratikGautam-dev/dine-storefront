"use client";

// The restaurant page's Reviews section -- fetches GET /api/public/restaurants/{slug}/reviews on
// mount and renders them newest-first via ReviewCard. Read-only here; submitting a review is
// gated to a completed order and lives on the order tracker page instead (orders/[id]/page.tsx),
// not on this page a customer could reach without ever having ordered.
import { useEffect, useState } from "react";
import { publicFetch } from "@/lib/customerAuth";
import { Skeleton } from "@/components/ui/Skeleton";
import { ReviewCard, type Review } from "@/components/storefront/reviews/ReviewCard";

export function ReviewsSection({ slug }: { slug: string }) {
  const [reviews, setReviews] = useState<Review[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await publicFetch<{ reviews: Review[] }>(
        `/api/public/restaurants/${slug}/reviews`,
      );
      if (!cancelled && result.ok) setReviews(result.data.reviews);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (reviews !== null && reviews.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-8 py-2">
      <h2 className="font-sf-headline text-lg font-extrabold text-sf-on-surface mb-3">Reviews</h2>
      {reviews === null ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </section>
  );
}
