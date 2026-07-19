"use client";

import Link from "next/link";
import { useState } from "react";

import { ReviewForm } from "@/features/reviews/ui/ReviewForm";
import type { Locale } from "@/lib/i18n/config";

type ProductWriteReviewCtaProps = {
  locale: Locale;
  productId: string;
  productSlug: string;
  canSubmit: boolean;
  isSignedIn: boolean;
  existingReviewId: string | null;
  showEmptyPrompt: boolean;
  labels: {
    writeReview: string;
    emptyPrompt: string;
    alreadyReviewed: string;
    reviewsUnlock: string;
    signIn: string;
    signInToReview: string;
  };
};

const ctaClassName =
  "rounded-full bg-cyan-400 px-10 py-3 text-base font-semibold text-white transition hover:bg-cyan-500";

export function ProductWriteReviewCta({
  locale,
  productId,
  productSlug,
  canSubmit,
  isSignedIn,
  existingReviewId,
  showEmptyPrompt,
  labels,
}: ProductWriteReviewCtaProps) {
  const [open, setOpen] = useState(false);
  const loginHref = `/${locale}/login?next=${encodeURIComponent(`/${locale}/products/${productSlug}`)}`;

  if (existingReviewId) {
    return (
      <div className="mt-2 flex flex-col items-center gap-4">
        {showEmptyPrompt ? (
          <p className="max-w-xl text-center text-base text-gray-700">
            {labels.emptyPrompt}
          </p>
        ) : null}
        <p className="max-w-xl text-center text-sm text-gray-500">
          {labels.alreadyReviewed}
        </p>
      </div>
    );
  }

  if (canSubmit && isSignedIn) {
    return (
      <div className="mt-2 flex flex-col items-center gap-6">
        {showEmptyPrompt ? (
          <p className="max-w-xl text-center text-base text-gray-700">
            {labels.emptyPrompt}
          </p>
        ) : null}
        {open ? (
          <div className="w-full max-w-md">
            <ReviewForm locale={locale} productId={productId} />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={ctaClassName}
          >
            {labels.writeReview}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-col items-center gap-6">
      {showEmptyPrompt ? (
        <p className="max-w-xl text-center text-base text-gray-700">
          {labels.emptyPrompt}
        </p>
      ) : null}
      <Link href={loginHref} className={ctaClassName}>
        {labels.writeReview}
      </Link>
      <p className="text-sm text-gray-500">
        <span className="font-medium text-gray-800">{labels.signIn}</span>{" "}
        {labels.signInToReview}
      </p>
    </div>
  );
}
