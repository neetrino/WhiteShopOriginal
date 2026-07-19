import { describe, expect, it } from "vitest";

import { createStaticExchangeRateAdapter } from "@/lib/fx/static-adapter";

describe("static exchange rate adapter", () => {
  it("returns identity and AMD quote rates", async () => {
    const fx = createStaticExchangeRateAdapter();

    await expect(fx.getRate("AMD", "AMD")).resolves.toMatchObject({
      rate: "1",
      source: "identity",
    });

    const usd = await fx.getRate("AMD", "USD");
    expect(usd.rate).toBe("0.0026");
    expect(usd.quote).toBe("USD");
  });
});
