"use client";

import { useState, useTransition } from "react";

import { submitReviewAction } from "@/features/reviews/application/submit-review";
import { StarRatingInput } from "@/features/reviews/ui/StarRatingInput";
import type { Locale } from "@/lib/i18n/config";

type ReviewFormProps = {
  locale: Locale;
  productId: string;
};

export function ReviewForm({ locale, productId }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <p className="text-sm text-gray-600">
        Thanks — your review is pending moderation.
      </p>
    );
  }

  return (
    <form
      className="flex w-full flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setError(null);
        startTransition(async () => {
          const result = await submitReviewAction(locale, {
            productId,
            rating,
            comment: String(data.get("comment") ?? "") || undefined,
          });
          if (!result.ok) {
            setError(result.error.message);
            return;
          }
          setDone(true);
        });
      }}
    >
      <StarRatingInput
        value={rating}
        onChange={setRating}
        label="Rating"
        disabled={pending}
      />

      <label className="text-sm font-medium text-gray-900" htmlFor="comment">
        Comment (optional)
      </label>
      <textarea
        id="comment"
        name="comment"
        rows={3}
        maxLength={2000}
        disabled={pending}
        className="rounded-lg border border-gray-200 px-3 py-2 text-gray-900 disabled:opacity-60"
      />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={pending || rating < 1}
        className="rounded-full bg-cyan-400 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
