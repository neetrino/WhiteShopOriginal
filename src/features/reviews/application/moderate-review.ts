"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auditLogs, reviews } from "@/db/schema";
import { withTransaction } from "@/db/transaction";
import {
  canModerateReview,
  isReviewModerationStatus,
  type ReviewModerationStatus,
} from "@/features/reviews/domain/review-rules";
import {
  moderateReviewSchema,
  type ModerateReviewInput,
} from "@/features/reviews/schemas/reviews";
import { requireAdmin } from "@/lib/auth/policies";
import { createId } from "@/lib/id";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { err, ok, type Result } from "@/lib/result";

/** Admin approve/reject with audit trail. */
export async function moderateReviewAction(
  locale: string,
  raw: ModerateReviewInput,
): Promise<Result<{ id: string; status: ReviewModerationStatus }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  const parsed = moderateReviewSchema.safeParse(raw);
  if (!parsed.success) {
    return err("VALIDATION_ERROR", "Invalid moderation payload.");
  }

  const actor = await requireAdmin(locale as Locale);
  const nextStatus = parsed.data.status;

  try {
    const result = await withTransaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(reviews)
        .where(eq(reviews.id, parsed.data.reviewId))
        .for("update")
        .limit(1);

      if (!existing) {
        throw new Error("NOT_FOUND");
      }

      if (!isReviewModerationStatus(existing.moderationStatus)) {
        throw new Error("INVALID_STATUS");
      }

      if (
        !canModerateReview(existing.moderationStatus, nextStatus)
      ) {
        throw new Error("INVALID_TRANSITION");
      }

      const now = new Date();
      await tx
        .update(reviews)
        .set({
          moderationStatus: nextStatus,
          moderatedByUserId: actor.id,
          moderatedAt: now,
          moderationReason: parsed.data.reason?.trim() || null,
          updatedAt: now,
        })
        .where(eq(reviews.id, existing.id));

      await tx.insert(auditLogs).values({
        id: createId(),
        actorUserId: actor.id,
        action: "review.moderate",
        targetType: "review",
        targetId: existing.id,
        beforeDiff: { moderationStatus: existing.moderationStatus },
        afterDiff: {
          moderationStatus: nextStatus,
          reason: parsed.data.reason?.trim() || null,
        },
        correlationId: createId(),
      });

      return { id: existing.id, status: nextStatus };
    });

    revalidatePath(`/${locale}/admin/reviews`);
    revalidatePath(`/${locale}/products`);
    return ok(result);
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    switch (code) {
      case "NOT_FOUND":
        return err("NOT_FOUND", "Review not found.");
      case "INVALID_TRANSITION":
        return err(
          "INVALID_TRANSITION",
          "Only pending reviews can be moderated.",
        );
      default:
        return err("REVIEW_MODERATE_FAILED", "Unable to moderate review.");
    }
  }
}
