import { notFound } from "next/navigation";

import { Card } from "@/components/ui/Card";
import {
  ADMIN_PAGE_SUBTITLE,
  ADMIN_PAGE_TITLE,
} from "@/features/admin/ui/admin-form-classes";
import { ADMIN_BADGE } from "@/features/admin/ui/status-badge";
import { listAdminReviews } from "@/features/reviews/application/queries";
import { ModerateReviewForm } from "@/features/reviews/ui/ModerateReviewForm";
import { isLocale } from "@/lib/i18n/config";

type AdminReviewsPageProps = { params: Promise<{ locale: string }> };

function reviewStatusBadgeClass(status: string): string {
  const normalized = status.toUpperCase();
  if (normalized === "APPROVED") return "bg-green-100 text-green-800";
  if (normalized === "PENDING") return "bg-yellow-100 text-yellow-800";
  if (normalized === "REJECTED") return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
}

export default async function AdminReviewsPage({
  params,
}: AdminReviewsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const rows = await listAdminReviews();

  return (
    <section>
      <div className="mb-6">
        <h1 className={ADMIN_PAGE_TITLE}>Reviews</h1>
        <p className={`mt-1 ${ADMIN_PAGE_SUBTITLE}`}>
          {rows.length} review{rows.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <Card key={row.id} className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">
                  {row.productTitle}{" "}
                  <span className="text-sm font-normal text-gray-500">
                    ({row.productSku})
                  </span>
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-700">{row.rating}/5</span>
                  <span
                    className={`${ADMIN_BADGE} ${reviewStatusBadgeClass(row.moderationStatus)}`}
                  >
                    {row.moderationStatus}
                  </span>
                  <span className="text-sm text-gray-500">{row.authorEmail}</span>
                </div>
                {row.comment ? (
                  <p className="mt-2 text-sm text-gray-600">{row.comment}</p>
                ) : null}
              </div>
              {row.moderationStatus === "PENDING" ? (
                <ModerateReviewForm locale={locale} reviewId={row.id} />
              ) : null}
            </div>
          </Card>
        ))}
        {rows.length === 0 ? (
          <Card className="p-6">
            <p className="text-center text-sm text-gray-600">No reviews yet.</p>
          </Card>
        ) : null}
      </div>
    </section>
  );
}
