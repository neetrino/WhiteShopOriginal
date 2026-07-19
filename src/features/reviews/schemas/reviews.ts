import { z } from "zod";

import {
  REVIEW_COMMENT_MAX_LENGTH,
  REVIEW_RATING_MAX,
  REVIEW_RATING_MIN,
} from "@/features/reviews/domain/review-rules";

export const submitReviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z
    .number()
    .int()
    .min(REVIEW_RATING_MIN)
    .max(REVIEW_RATING_MAX),
  comment: z.string().max(REVIEW_COMMENT_MAX_LENGTH).optional(),
});

export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;

export const moderateReviewSchema = z.object({
  reviewId: z.string().uuid(),
  status: z.enum(["APPROVED", "REJECTED"]),
  reason: z.string().max(500).optional(),
});

export type ModerateReviewInput = z.infer<typeof moderateReviewSchema>;
