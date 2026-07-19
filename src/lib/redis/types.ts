export type RedisClient = {
  get(key: string): Promise<string | null>;
  set(
    key: string,
    value: string,
    options?: { ex?: number; nx?: boolean },
  ): Promise<"OK" | null>;
  del(key: string): Promise<number>;
};

export type RedisAdapter = {
  readonly name: string;
  getClient(): RedisClient;
};
