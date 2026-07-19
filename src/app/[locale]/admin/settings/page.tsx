import { notFound } from "next/navigation";

import {
  ADMIN_PAGE_SUBTITLE,
  ADMIN_PAGE_TITLE,
} from "@/features/admin/ui/admin-form-classes";
import { getStoreIdentity } from "@/features/settings/application/queries";
import { StoreSettingsForms } from "@/features/settings/ui/StoreSettingsForms";
import { isLocale } from "@/lib/i18n/config";

type AdminSettingsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminSettingsPage({
  params,
}: AdminSettingsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const identity = await getStoreIdentity();

  return (
    <section>
      <div className="mb-6">
        <h1 className={ADMIN_PAGE_TITLE}>Store settings</h1>
        <p className={`mt-1 ${ADMIN_PAGE_SUBTITLE}`}>
          Configure store identity
        </p>
      </div>

      <StoreSettingsForms locale={locale} identity={identity} />
    </section>
  );
}
