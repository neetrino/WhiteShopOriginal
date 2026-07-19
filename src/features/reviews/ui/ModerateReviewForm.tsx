"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { moderateReviewAction } from "@/features/reviews/application/moderate-review";
import type { Locale } from "@/lib/i18n/config";

type ModerateReviewFormProps = {
  locale: Locale;
  reviewId: string;
};

export function ModerateReviewForm({
  locale,
  reviewId,
}: ModerateReviewFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function moderate(status: "APPROVED" | "REJECTED") {
    setError(null);
    startTransition(async () => {
      const result = await moderateReviewAction(locale, {
        reviewId,
        status,
      });
      if (!result.ok) {
        setError(result.error.message);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          disabled={pending}
          onClick={() => moderate("APPROVED")}
        >
          Approve
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => moderate("REJECTED")}
        >
          Reject
        </Button>
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
