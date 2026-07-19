import "server-only";

import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { and, asc, eq, inArray } from "drizzle-orm";

import { getDb } from "@/db/client";
import { mediaAssets } from "@/db/schema";
import { createId } from "@/lib/id";
import { mediaPublicUrl } from "@/lib/media/public-url";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_IMAGES = 12;

export type ProductMediaInput = {
  productId: string;
  files: File[];
  primaryNewIndex: number | null;
  primaryExistingId: string | null;
  removeImageIds: string[];
};

function extensionFor(mimeType: string): string {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/gif") return "gif";
  return "jpg";
}

async function deleteLocalObject(objectKey: string): Promise<void> {
  const absolute = path.join(process.cwd(), "public", objectKey);
  try {
    await unlink(absolute);
  } catch {
    // Best-effort cleanup for local stub storage.
  }
}

/** Saves new product images and updates primary/removal for local stub storage. */
export async function persistProductMedia(
  input: ProductMediaInput,
): Promise<{ error: string | null }> {
  const db = getDb();
  const existing = await db
    .select({
      id: mediaAssets.id,
      objectKey: mediaAssets.objectKey,
      isPrimary: mediaAssets.isPrimary,
    })
    .from(mediaAssets)
    .where(eq(mediaAssets.productId, input.productId))
    .orderBy(asc(mediaAssets.sortOrder));

  const remainingAfterRemove = existing.filter(
    (row) => !input.removeImageIds.includes(row.id),
  );

  if (
    remainingAfterRemove.length + input.files.length > MAX_IMAGES
  ) {
    return { error: `At most ${MAX_IMAGES} images are allowed.` };
  }

  for (const file of input.files) {
    if (!ALLOWED_MIME.has(file.type)) {
      return { error: "Only JPEG, PNG, WebP, or GIF images are allowed." };
    }
    if (file.size > MAX_BYTES) {
      return { error: "Each image must be 5MB or smaller." };
    }
  }

  if (input.removeImageIds.length > 0) {
    const toRemove = existing.filter((row) =>
      input.removeImageIds.includes(row.id),
    );
    if (toRemove.length > 0) {
      await db
        .delete(mediaAssets)
        .where(
          inArray(
            mediaAssets.id,
            toRemove.map((row) => row.id),
          ),
        );
      await Promise.all(toRemove.map((row) => deleteLocalObject(row.objectKey)));
    }
  }

  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "products",
    input.productId,
  );
  await mkdir(uploadDir, { recursive: true });

  const createdIds: string[] = [];
  let sortBase = remainingAfterRemove.length;

  for (const file of input.files) {
    const id = createId();
    const objectKey = `uploads/products/${input.productId}/${id}.${extensionFor(file.type)}`;
    const absolute = path.join(process.cwd(), "public", objectKey);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(absolute, buffer);

    await db.insert(mediaAssets).values({
      id,
      objectKey,
      mimeType: file.type,
      byteSize: file.size,
      uploadStatus: "READY",
      role: "GALLERY",
      sortOrder: sortBase,
      isPrimary: false,
      productId: input.productId,
    });
    createdIds.push(id);
    sortBase += 1;
  }

  let nextPrimaryId: string | null = null;
  if (
    input.primaryNewIndex != null &&
    input.primaryNewIndex >= 0 &&
    input.primaryNewIndex < createdIds.length
  ) {
    nextPrimaryId = createdIds[input.primaryNewIndex] ?? null;
  } else if (
    input.primaryExistingId &&
    !input.removeImageIds.includes(input.primaryExistingId)
  ) {
    nextPrimaryId = input.primaryExistingId;
  } else if (remainingAfterRemove[0]) {
    nextPrimaryId = remainingAfterRemove[0].id;
  } else if (createdIds[0]) {
    nextPrimaryId = createdIds[0];
  }

  await db
    .update(mediaAssets)
    .set({ isPrimary: false, role: "GALLERY", updatedAt: new Date() })
    .where(
      and(eq(mediaAssets.productId, input.productId), eq(mediaAssets.isPrimary, true)),
    );

  if (nextPrimaryId) {
    await db
      .update(mediaAssets)
      .set({
        isPrimary: true,
        role: "PRIMARY",
        updatedAt: new Date(),
      })
      .where(eq(mediaAssets.id, nextPrimaryId));
  }

  return { error: null };
}

/** Loads gallery images for admin product editing. */
export async function loadProductImagesForAdmin(
  productIds: string[],
): Promise<Map<string, { id: string; url: string; isPrimary: boolean }[]>> {
  const map = new Map<
    string,
    { id: string; url: string; isPrimary: boolean }[]
  >();
  if (productIds.length === 0) return map;

  const rows = await getDb()
    .select({
      id: mediaAssets.id,
      productId: mediaAssets.productId,
      objectKey: mediaAssets.objectKey,
      isPrimary: mediaAssets.isPrimary,
      sortOrder: mediaAssets.sortOrder,
    })
    .from(mediaAssets)
    .where(
      and(
        inArray(mediaAssets.productId, productIds),
        eq(mediaAssets.uploadStatus, "READY"),
      ),
    )
    .orderBy(asc(mediaAssets.sortOrder));

  for (const row of rows) {
    if (!row.productId) continue;
    const list = map.get(row.productId) ?? [];
    list.push({
      id: row.id,
      url: mediaPublicUrl(row.objectKey),
      isPrimary: row.isPrimary,
    });
    map.set(row.productId, list);
  }

  return map;
}
