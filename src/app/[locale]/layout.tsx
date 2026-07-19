import { notFound } from "next/navigation";

import { isLocale, locales, type Locale } from "@/lib/i18n/config";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams(): Array<{ locale: Locale }> {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;

  return (
    <div lang={locale} className="min-h-full bg-gray-50">
      {children}
    </div>
  );
}
