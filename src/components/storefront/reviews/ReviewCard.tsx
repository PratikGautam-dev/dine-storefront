"use client";

export type Review = {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  photo_urls: string[];
  customer_name: string | null;
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 1) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-xl bg-sf-surface border border-sf-border-divider/70 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-sf-warning-soft px-2 py-0.5 font-sf-body text-xs font-bold text-sf-rating-amber">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
            {review.rating}
          </span>
          <span className="font-sf-body text-sm font-semibold text-sf-on-surface">
            {review.customer_name || "Guest"}
          </span>
        </div>
        <span className="font-sf-body text-xs text-sf-text-muted shrink-0">
          {timeAgo(review.created_at)}
        </span>
      </div>
      {review.comment && (
        <p className="mt-2 font-sf-body text-sm text-sf-text-body">{review.comment}</p>
      )}
      {review.photo_urls.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {review.photo_urls.map((url) => (
            <a key={url} href={url} target="_blank" rel="noreferrer" className="block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt="Review photo"
                className="h-16 w-16 rounded-lg object-cover border border-sf-border-divider/70 hover:opacity-80 transition-opacity"
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
