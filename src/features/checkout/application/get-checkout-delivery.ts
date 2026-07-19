import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { deliveryRules } from "@/db/schema";

export type CheckoutDeliveryQuote = {
  priceAmount: number;
  freeThresholdAmount: number | null;
  estimatedDaysMin: number | null;
  estimatedDaysMax: number | null;
};

/** Active Armenia delivery rule used for checkout quotes and order totals. */
export async function getCheckoutDeliveryQuote(): Promise<CheckoutDeliveryQuote | null> {
  const [delivery] = await getDb()
    .select({
      priceAmount: deliveryRules.priceAmount,
      freeThresholdAmount: deliveryRules.freeThresholdAmount,
      estimatedDaysMin: deliveryRules.estimatedDaysMin,
      estimatedDaysMax: deliveryRules.estimatedDaysMax,
    })
    .from(deliveryRules)
    .where(
      and(
        eq(deliveryRules.isActive, true),
        eq(deliveryRules.countryCode, "AM"),
      ),
    )
    .orderBy(desc(deliveryRules.priority))
    .limit(1);

  return delivery ?? null;
}
