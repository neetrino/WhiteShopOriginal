import { describe, expect, it } from "vitest";

import { createMemoryRedisAdapter } from "@/lib/redis/memory-adapter";

describe("memory redis adapter", () => {
  it("sets and gets values with nx semantics", async () => {
    const redis = createMemoryRedisAdapter().getClient();

    await expect(redis.set("k", "1", { nx: true })).resolves.toBe("OK");
    await expect(redis.set("k", "2", { nx: true })).resolves.toBeNull();
    await expect(redis.get("k")).resolves.toBe("1");
    await expect(redis.del("k")).resolves.toBe(1);
    await expect(redis.get("k")).resolves.toBeNull();
  });
});
