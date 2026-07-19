"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type CheckoutOrderSummaryProps = {
  title: string;
  subtotalLabel: string;
  shippingLabel: string;
  taxLabel: string;
  totalLabel: string;
  subtotalFormatted: string;
  shippingFormatted: string;
  taxFormatted: string;
  totalFormatted: string;
  error: string | null;
  isSubmitting: boolean;
  placeOrderLabel: string;
  processingLabel: string;
};

export function CheckoutOrderSummary({
  title,
  subtotalLabel,
  shippingLabel,
  taxLabel,
  totalLabel,
  subtotalFormatted,
  shippingFormatted,
  taxFormatted,
  totalFormatted,
  error,
  isSubmitting,
  placeOrderLabel,
  processingLabel,
}: CheckoutOrderSummaryProps) {
  return (
    <div>
      <Card className="sticky top-4 rounded-2xl border border-gray-200/80 p-6 shadow-none">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">{title}</h2>
        <div className="mb-6 space-y-4">
          <div className="flex justify-between text-gray-600">
            <span>{subtotalLabel}</span>
            <span>{subtotalFormatted}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>{shippingLabel}</span>
            <span className="text-right">{shippingFormatted}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>{taxLabel}</span>
            <span>{taxFormatted}</span>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>{totalLabel}</span>
              <span>{totalFormatted}</span>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="h-12 w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? processingLabel : placeOrderLabel}
        </Button>
      </Card>
    </div>
  );
}
