"use server";

import { createHash } from "node:crypto";

import { and, desc, eq, gt } from "drizzle-orm";

import { getProviders } from "@/config/providers";
import { getDb } from "@/db/client";
import { contactMessages } from "@/db/schema";
import {
  normalizeContactEmail,
  scoreContactSpam,
  shouldRejectContactSpam,
} from "@/features/contact/domain/contact-rules";
import {
  submitContactSchema,
  type SubmitContactInput,
} from "@/features/contact/schemas/contact";
import { createId } from "@/lib/id";
import { err, ok, type Result } from "@/lib/result";

const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;
/** Max contact submissions per email per window (documented Phase 9 default). */
const CONTACT_RATE_LIMIT = 5;
const CONTACT_RATE_WINDOW_SECONDS = 15 * 60;

/**
 * Public contact form submission with honeypot/spam scoring and
 * short-window duplicate suppression by email+subject.
 */
export async function submitContactMessageAction(
  raw: SubmitContactInput,
): Promise<Result<{ id: string }>> {
  const parsed = submitContactSchema.safeParse(raw);
  if (!parsed.success) {
    return err("VALIDATION_ERROR", "Please check the form fields.");
  }

  const data = parsed.data;
  const spamScore = scoreContactSpam({
    name: data.name,
    email: data.email,
    phone: data.phone,
    subject: data.subject,
    message: data.message,
    companyWebsite: data.companyWebsite,
  });

  // Honeypot / hard spam: generic success to avoid teaching bots.
  if (shouldRejectContactSpam(spamScore)) {
    return ok({ id: createId() });
  }

  const email = normalizeContactEmail(data.email);
  const rateKey = `contact:rate:${createHash("sha256").update(email).digest("hex")}`;
  const redis = getProviders().redis.getClient();
  const currentRaw = await redis.get(rateKey);
  const currentCount = currentRaw ? Number.parseInt(currentRaw, 10) : 0;
  if (Number.isFinite(currentCount) && currentCount >= CONTACT_RATE_LIMIT) {
    return err("RATE_LIMITED", "Too many messages. Please try again later.");
  }

  const since = new Date(Date.now() - DUPLICATE_WINDOW_MS);

  const [duplicate] = await getDb()
    .select({ id: contactMessages.id })
    .from(contactMessages)
    .where(
      and(
        eq(contactMessages.email, email),
        eq(contactMessages.subject, data.subject.trim()),
        gt(contactMessages.createdAt, since),
      ),
    )
    .orderBy(desc(contactMessages.createdAt))
    .limit(1);

  if (duplicate) {
    return ok({ id: duplicate.id });
  }

  try {
    const id = createId();
    await getDb().insert(contactMessages).values({
      id,
      name: data.name.trim(),
      email,
      phone: data.phone?.trim() || null,
      subject: data.subject.trim(),
      message: data.message.trim(),
      status: "UNREAD",
      spamScore,
    });

    const nextCount = (Number.isFinite(currentCount) ? currentCount : 0) + 1;
    await redis.set(rateKey, String(nextCount), {
      ex: CONTACT_RATE_WINDOW_SECONDS,
    });

    return ok({ id });
  } catch {
    return err("CONTACT_SUBMIT_FAILED", "Unable to send your message.");
  }
}
