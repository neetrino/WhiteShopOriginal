import type { ObjectStorageAdapter } from "@/lib/r2/types";

/** No-op storage adapter until R2 credentials are wired. */
export function createStubObjectStorageAdapter(
  publicBaseUrl = "https://example.invalid",
): ObjectStorageAdapter {
  return {
    name: "stub-r2",
    async createPresignedUpload({ objectKey }) {
      return {
        objectKey,
        uploadUrl: `${publicBaseUrl}/upload/${objectKey}`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      };
    },
    buildPublicUrl(objectKey) {
      return `${publicBaseUrl.replace(/\/$/, "")}/${objectKey}`;
    },
    async deleteObject() {
      // Intentionally empty until R2 adapter is enabled.
    },
  };
}
