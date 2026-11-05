"use client";

// Review submission form, opened from the order tracker page once an order is completed (the
// only entry point -- the backend's own POST /api/public/restaurants/{slug}/reviews gate requires
// a completed order at this restaurant anyway, so there's no other page this form could usefully
// live on). Same backdrop/overlay visual convention ConfirmDialog.tsx already established,
// custom body since a star-picker + comment + photo-picker form doesn't fit that component's
// plain yes/no shape.
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { API_BASE_URL, getCustomerToken, publicFetch } from "@/lib/customerAuth";
import { toast } from "@/lib/toast";

const MAX_PHOTOS = 5;

type Props = {
  open: boolean;
  slug: string;
  restaurantName: string;
  onClose: () => void;
  onSubmitted: () => void;
};

export function ReviewFormModal({ open, slug, restaurantName, onClose, onSubmitted }: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handlePhotoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (photoUrls.length >= MAX_PHOTOS) {
      setError(`You can add at most ${MAX_PHOTOS} photos.`);
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const token = getCustomerToken();
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE_URL}/api/public/restaurants/${slug}/reviews/upload-image`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Couldn't upload that photo.");
        return;
      }
      setPhotoUrls((prev) => [...prev, data.image_url as string]);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(url: string) {
    setPhotoUrls((prev) => prev.filter((u) => u !== url));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      setError("Please pick a star rating.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await publicFetch(`/api/public/restaurants/${slug}/reviews`, {
      method: "POST",
      body: JSON.stringify({ rating, comment: comment.trim(), photo_urls: photoUrls }),
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success("Thanks for your review!");
    onSubmitted();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-xl bg-sf-surface p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-sf-headline text-lg font-bold text-sf-on-surface">
          Rate {restaurantName}
        </h2>

        <div className="mt-4 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              className="text-sf-rating-amber"
            >
              <span
                className="material-symbols-outlined text-[32px]"
                style={{ fontVariationSettings: n <= rating ? "'FILL' 1" : "'FILL' 0" }}
              >
                star
              </span>
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="How was your order? (optional)"
          rows={3}
          className="mt-3 w-full rounded-lg border border-sf-border-divider bg-sf-surface p-2.5 font-sf-body text-sm text-sf-on-surface"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {photoUrls.map((url) => (
            <div key={url} className="relative h-14 w-14">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(url)}
                aria-label="Remove photo"
                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-sf-on-surface text-sf-surface text-[12px]"
              >
                ×
              </button>
            </div>
          ))}
          {photoUrls.length < MAX_PHOTOS && (
            <label className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-lg border border-dashed border-sf-border-divider text-sf-text-muted">
              {uploading ? (
                <span className="text-[11px]">…</span>
              ) : (
                <span className="material-symbols-outlined text-[22px]">add_a_photo</span>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={uploading}
                onChange={handlePhotoPick}
              />
            </label>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-sf-error">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || uploading}>
            {submitting ? "Submitting…" : "Submit Review"}
          </Button>
        </div>
      </form>
    </div>
  );
}
