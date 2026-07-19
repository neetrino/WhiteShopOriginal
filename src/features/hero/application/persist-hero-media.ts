import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { and, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { mediaAssets } from "@/db/schema";
import { createId } from "@/lib/id";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_BYTES = 5 * 1024 * 1024;

function extensionFor(mimeType: string): string {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/gif") return "gif";
  return "jpg";
}

/** Saves a desktop hero image for a slide (local stub storage). */
export async function persistHeroImage(
  heroSlideId: string,
  file: File,
): Promise<{ error: string | null }> {
  if (!ALLOWED_MIME.has(file.type)) {
    return { error: "Only JPEG, PNG, WebP, or GIF images are allowed." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "Image must be 5MB or smaller." };
  }

  const db = getDb();
  await db
    .delete(mediaAssets)
    .where(
      and(
        eq(mediaAssets.heroSlideId, heroSlideId),
        eq(mediaAssets.role, "HERO_DESKTOP"),
      ),
    );

  const id = createId();
  const objectKey = `uploads/hero/${heroSlideId}/${id}.${extensionFor(file.type)}`;
  const absolute = path.join(process.cwd(), "public", objectKey);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, Buffer.from(await file.arrayBuffer()));

  await db.insert(mediaAssets).values({
    id,
    objectKey,
    mimeType: file.type,
    byteSize: file.size,
    uploadStatus: "READY",
    role: "HERO_DESKTOP",
    sortOrder: 0,
    isPrimary: true,
    heroSlideId,
  });

  return { error: null };
}

/** Removes desktop hero media for a slide (local stub storage). */
export async function removeHeroImage(heroSlideId: string): Promise<void> {
  await getDb()
    .delete(mediaAssets)
    .where(
      and(
        eq(mediaAssets.heroSlideId, heroSlideId),
        eq(mediaAssets.role, "HERO_DESKTOP"),
      ),
    );
}
