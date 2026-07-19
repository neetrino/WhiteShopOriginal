import type { Currency } from "@/lib/money/currency";
import type { ExchangeRateAdapter, ExchangeRateQuote } from "@/lib/fx/types";

const STATIC_RATES_FROM_AMD: Record<Exclude<Currency, "AMD">, string> = {
  USD: "0.0026",
  RUB: "0.24",
};

/** Admin-maintained static rates placeholder until live FX source is chosen. */
export function createStaticExchangeRateAdapter(): ExchangeRateAdapter {
  return {
    name: "static-admin-rates",
    async getRate(base, quote): Promise<ExchangeRateQuote> {
      if (base === quote) {
        return {
          base,
          quote,
          rate: "1",
          asOf: new Date(),
          source: "identity",
        };
      }

      if (base === "AMD" && quote !== "AMD") {
        return {
          base,
          quote,
          rate: STATIC_RATES_FROM_AMD[quote],
          asOf: new Date(),
          source: "static",
        };
      }

      throw new Error(`Unsupported FX pair: ${base}/${quote}`);
    },
  };
}
