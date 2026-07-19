import { notFound } from "next/navigation";

import { getCartWithItems } from "@/features/cart/cart";
import { getCheckoutDeliveryQuote } from "@/features/checkout/application/get-checkout-delivery";
import { CheckoutForm } from "@/features/checkout/ui/CheckoutForm";
import { getDefaultShippingAddress } from "@/features/profile/application/address-queries";
import { resolveProductPrices } from "@/features/promotions/application/resolve-product-prices";
import { getCurrentUser } from "@/lib/auth/session";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type CheckoutPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) {
    notFound();
  }

  const dictionary = getDictionary(rawLocale);
  const copy = dictionary.checkout;
  const [user, { items }, deliveryQuote] = await Promise.all([
    getCurrentUser(),
    getCartWithItems(),
    getCheckoutDeliveryQuote(),
  ]);
  const defaultAddress = user
    ? await getDefaultShippingAddress(user.id)
    : null;
  const prices = await resolveProductPrices(
    items.map(({ product }) => ({
      id: product.id,
      priceAmount: product.priceAmount,
      compareAtAmount: product.compareAtAmount,
    })),
  );
  const subtotal = items.reduce((sum, { item, product }) => {
    const unit = prices.get(product.id)?.unitAmount ?? product.priceAmount;
    return sum + item.quantity * unit;
  }, 0);

  return (
    <CheckoutForm
      locale={rawLocale}
      productsHref={`/${rawLocale}/products`}
      hasItems={items.length > 0}
      defaultFirstName={
        defaultAddress?.recipientFirstName ?? user?.firstName ?? ""
      }
      defaultLastName={
        defaultAddress?.recipientLastName ?? user?.lastName ?? ""
      }
      defaultEmail={user?.email ?? ""}
      defaultPhone={defaultAddress?.phone ?? user?.phone ?? ""}
      defaultCity={defaultAddress?.city ?? "Yerevan"}
      defaultLine1={defaultAddress?.line1 ?? ""}
      subtotalAmount={subtotal}
      deliveryPriceAmount={deliveryQuote?.priceAmount ?? 0}
      freeThresholdAmount={deliveryQuote?.freeThresholdAmount ?? null}
      labels={{
        title: copy.title,
        contactInformation: copy.contactInformation,
        shippingMethod: copy.shippingMethod,
        shippingAddress: copy.shippingAddress,
        paymentMethod: copy.paymentMethod,
        orderSummary: copy.orderSummary,
        firstName: copy.form.firstName,
        lastName: copy.form.lastName,
        email: copy.form.email,
        phone: copy.form.phone,
        city: copy.form.city,
        address: copy.form.address,
        phonePlaceholder: copy.placeholders.phone,
        cityPlaceholder: copy.placeholders.city,
        addressPlaceholder: copy.placeholders.address,
        storePickup: copy.shipping.storePickup,
        storePickupDescription: copy.shipping.storePickupDescription,
        delivery: copy.shipping.delivery,
        deliveryDescription: copy.shipping.deliveryDescription,
        freePickup: copy.shipping.freePickup,
        enterCity: copy.shipping.enterCity,
        cashOnDelivery: copy.payment.cashOnDelivery,
        cashOnDeliveryDescription: copy.payment.cashOnDeliveryDescription,
        idram: copy.payment.idram,
        idramDescription: copy.payment.idramDescription,
        arca: copy.payment.arca,
        arcaDescription: copy.payment.arcaDescription,
        subtotal: copy.summary.subtotal,
        shipping: copy.summary.shipping,
        tax: copy.summary.tax,
        total: copy.summary.total,
        placeOrder: copy.buttons.placeOrder,
        processing: copy.buttons.processing,
        continueShopping: copy.buttons.continueShopping,
        cartEmpty: copy.errors.cartEmpty,
      }}
    />
  );
}
