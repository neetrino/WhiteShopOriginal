import { notFound } from "next/navigation";

import { ProfileSidebar } from "@/features/profile/ui/ProfileSidebar";
import { requireUser } from "@/lib/auth/policies";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type ProfileLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function ProfileLayout({
  children,
  params,
}: ProfileLayoutProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const user = await requireUser(rawLocale);
  const dictionary = getDictionary(rawLocale);

  return (
    <div className="profile-desktop-page flex flex-col gap-6 pb-10 lg:min-h-0 lg:flex-1 lg:flex-row lg:gap-8 lg:overflow-hidden lg:pb-0">
      <div className="w-full shrink-0 lg:flex lg:h-full lg:w-[280px] lg:min-h-0 lg:flex-col">
        <ProfileSidebar
          locale={rawLocale}
          user={user}
          dictionary={dictionary.profile}
        />
      </div>
      <div className="min-w-0 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain">
        {children}
      </div>
    </div>
  );
}
