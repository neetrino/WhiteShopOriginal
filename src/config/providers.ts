import "server-only";

import { getEnv } from "@/config/env";
import { createStubEmailAdapter } from "@/lib/email/stub-adapter";
import type { EmailAdapter } from "@/lib/email/types";
import { createStaticExchangeRateAdapter } from "@/lib/fx/static-adapter";
import type { ExchangeRateAdapter } from "@/lib/fx/types";
import { createCodPaymentAdapter } from "@/lib/payments/cod-adapter";
import type { PaymentAdapter } from "@/lib/payments/types";
import { createStubObjectStorageAdapter } from "@/lib/r2/stub-adapter";
import type { ObjectStorageAdapter } from "@/lib/r2/types";
import { createMemoryRedisAdapter } from "@/lib/redis/memory-adapter";
import type { RedisAdapter } from "@/lib/redis/types";

export type AppProviders = {
  redis: RedisAdapter;
  storage: ObjectStorageAdapter;
  email: EmailAdapter;
  payment: PaymentAdapter;
  exchangeRates: ExchangeRateAdapter;
};

let cachedProviders: AppProviders | undefined;

/**
 * Provider composition root. Real Upstash/R2/Resend adapters replace stubs
 * when credentials are present and feature wiring needs them.
 */
export function getProviders(): AppProviders {
  if (cachedProviders) {
    return cachedProviders;
  }

  const env = getEnv();

  cachedProviders = {
    redis: createMemoryRedisAdapter(),
    storage: createStubObjectStorageAdapter(
      // Empty base → relative `/uploads/...` URLs for local stub files in `public/`.
      env.R2_PUBLIC_BASE_URL ?? "",
    ),
    email: createStubEmailAdapter(),
    payment: createCodPaymentAdapter(),
    exchangeRates: createStaticExchangeRateAdapter(),
  };

  return cachedProviders;
}
