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

/** Saves a cover image for a blog post (local stub storage). */
export async function persistBlogCoverImage(
  blogPostId: string,
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
        eq(mediaAssets.blogPostId, blogPostId),
        eq(mediaAssets.role, "COVER"),
      ),
    );

  const id = createId();
  const objectKey = `uploads/blog/${blogPostId}/${id}.${extensionFor(file.type)}`;
  const absolute = path.join(process.cwd(), "public", objectKey);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, Buffer.from(await file.arrayBuffer()));

  await db.insert(mediaAssets).values({
    id,
    objectKey,
    mimeType: file.type,
    byteSize: file.size,
    uploadStatus: "READY",
    role: "COVER",
    sortOrder: 0,
    isPrimary: true,
    blogPostId,
  });

  return { error: null };
}

/** Removes cover media for a blog post (local stub storage). */
export async function removeBlogCoverImage(blogPostId: string): Promise<void> {
  await getDb()
    .delete(mediaAssets)
    .where(
      and(
        eq(mediaAssets.blogPostId, blogPostId),
        eq(mediaAssets.role, "COVER"),
      ),
    );
}
