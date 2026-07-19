"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type FormEvent } from "react";

import { Card } from "@/components/ui/Card";
import { createOrderAction } from "@/features/checkout/create-order";
import type { CheckoutPaymentMethod } from "@/features/checkout/domain/payment-methods";
import { CheckoutDetailsSections } from "@/features/checkout/ui/CheckoutDetailsSections";
import { CheckoutOrderSummary } from "@/features/checkout/ui/CheckoutOrderSummary";
import type { Locale } from "@/lib/i18n/config";
import { formatMoneyAmount } from "@/lib/money/format";

type CheckoutLabels = {
  title: string;
  contactInformation: string;
  shippingMethod: string;
  shippingAddress: string;
  paymentMethod: string;
  orderSummary: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  phonePlaceholder: string;
  cityPlaceholder: string;
  addressPlaceholder: string;
  storePickup: string;
  storePickupDescription: string;
  delivery: string;
  deliveryDescription: string;
  freePickup: string;
  enterCity: string;
  cashOnDelivery: string;
  cashOnDeliveryDescription: string;
  idram: string;
  idramDescription: string;
  arca: string;
  arcaDescription: string;
  subtotal: string;
  shipping: string;
  tax: string;
  total: string;
  placeOrder: string;
  processing: string;
  continueShopping: string;
  cartEmpty: string;
};

type CheckoutFormProps = {
  locale: Locale;
  labels: CheckoutLabels;
  productsHref: string;
  defaultFirstName: string;
  defaultLastName: string;
  defaultEmail: string;
  defaultPhone: string;
  defaultCity: string;
  defaultLine1: string;
  subtotalAmount: number;
  deliveryPriceAmount: number;
  freeThresholdAmount: number | null;
  hasItems: boolean;
};

export function CheckoutForm({
  locale,
  labels,
  productsHref,
  defaultFirstName,
  defaultLastName,
  defaultEmail,
  defaultPhone,
  defaultCity,
  defaultLine1,
  subtotalAmount,
  deliveryPriceAmount,
  freeThresholdAmount,
  hasItems,
}: CheckoutFormProps) {
  const router = useRouter();
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);
  const [shippingMethod, setShippingMethod] = useState<"pickup" | "delivery">(
    "delivery",
  );
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutPaymentMethod>("cash_on_delivery");
  const [city, setCity] = useState(defaultCity);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const paymentOptions = useMemo(
    () => [
      {
        id: "cash_on_delivery" as const,
        name: labels.cashOnDelivery,
        description: labels.cashOnDeliveryDescription,
        logoSrc: null,
      },
      {
        id: "idram" as const,
        name: labels.idram,
        description: labels.idramDescription,
        logoSrc: "/assets/payments/idram.svg",
      },
      {
        id: "arca" as const,
        name: labels.arca,
        description: labels.arcaDescription,
        logoSrc: "/assets/payments/arca.svg",
      },
    ],
    [
      labels.arca,
      labels.arcaDescription,
      labels.cashOnDelivery,
      labels.cashOnDeliveryDescription,
      labels.idram,
      labels.idramDescription,
    ],
  );

  function formatMoney(amount: number): string {
    return formatMoneyAmount(amount, "AMD", locale);
  }

  const quotedDelivery =
    freeThresholdAmount !== null && subtotalAmount >= freeThresholdAmount
      ? 0
      : deliveryPriceAmount;
  const shippingAmount = shippingMethod === "pickup" ? 0 : quotedDelivery;
  const totalAmount = Math.max(0, subtotalAmount) + shippingAmount;

  const shippingFormatted =
    shippingMethod === "pickup"
      ? labels.freePickup
      : city.trim()
        ? `${formatMoney(shippingAmount)} (${city.trim()})`
        : labels.enterCity;

  if (!hasItems) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">{labels.title}</h1>
        <Card className="rounded-2xl border border-gray-200/80 p-6 text-center shadow-none">
          <p className="mb-4 text-gray-600">{labels.cartEmpty}</p>
          <Link
            href={productsHref}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800"
          >
            {labels.continueShopping}
          </Link>
        </Card>
      </div>
    );
  }

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError(null);

    startTransition(async () => {
      const result = await createOrderAction({
        locale,
        idempotencyKey,
        firstName: String(data.get("firstName") ?? ""),
        lastName: String(data.get("lastName") ?? ""),
        contactEmail: String(data.get("contactEmail") ?? ""),
        contactPhone: String(data.get("contactPhone") ?? ""),
        shippingMethod,
        paymentMethod,
        city:
          shippingMethod === "delivery"
            ? String(data.get("city") ?? "")
            : undefined,
        line1:
          shippingMethod === "delivery"
            ? String(data.get("line1") ?? "")
            : undefined,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push(`/${locale}/checkout/success/${result.orderNumber}`);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">{labels.title}</h1>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <CheckoutDetailsSections
            labels={labels}
            pending={pending}
            shippingMethod={shippingMethod}
            onShippingMethodChange={setShippingMethod}
            city={city}
            onCityChange={setCity}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            paymentOptions={paymentOptions}
            defaultFirstName={defaultFirstName}
            defaultLastName={defaultLastName}
            defaultEmail={defaultEmail}
            defaultPhone={defaultPhone}
            defaultLine1={defaultLine1}
          />

          <CheckoutOrderSummary
            title={labels.orderSummary}
            subtotalLabel={labels.subtotal}
            shippingLabel={labels.shipping}
            taxLabel={labels.tax}
            totalLabel={labels.total}
            subtotalFormatted={formatMoney(subtotalAmount)}
            shippingFormatted={shippingFormatted}
            taxFormatted={formatMoney(0)}
            totalFormatted={formatMoney(totalAmount)}
            error={error}
            isSubmitting={pending}
            placeOrderLabel={labels.placeOrder}
            processingLabel={labels.processing}
          />
        </div>
      </form>
    </div>
  );
}
