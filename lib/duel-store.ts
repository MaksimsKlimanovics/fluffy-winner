import type { DuelStore } from "./duel";

/**
 * Where matches live. Two players on two devices hit different serverless
 * instances, so production needs a shared store: Upstash Redis (Vercel
 * Marketplace → Storage → Upstash for Redis sets these variables). Without it
 * a per-process Map is used, which is enough for `next dev` / `next start` on
 * one machine but not for Vercel.
 */

class UpstashStore implements DuelStore {
  constructor(
    private url: string,
    private token: string,
  ) {}

  private async command<R>(args: (string | number)[]): Promise<R> {
    const res = await fetch(this.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(args),
      cache: "no-store",
    });
    const body = (await res.json()) as { result?: R; error?: string };
    if (!res.ok || body.error) throw new Error(`Upstash ${args[0]} failed: ${body.error ?? res.status}`);
    return body.result as R;
  }

  async get<V>(key: string): Promise<V | null> {
    const raw = await this.command<string | null>(["GET", key]);
    return raw === null ? null : (JSON.parse(raw) as V);
  }

  async set(key: string, value: unknown, opts: { ex: number; nx?: boolean }): Promise<boolean> {
    const args: (string | number)[] = ["SET", key, JSON.stringify(value), "EX", opts.ex];
    if (opts.nx) args.push("NX");
    return (await this.command<string | null>(args)) === "OK";
  }

  async del(key: string): Promise<void> {
    await this.command(["DEL", key]);
  }

  async hset(key: string, field: string, value: unknown, opts: { ex: number }): Promise<void> {
    await this.command(["HSET", key, field, JSON.stringify(value)]);
    await this.command(["EXPIRE", key, opts.ex]);
  }

  async hgetall<V>(key: string): Promise<Record<string, V>> {
    // Upstash returns HGETALL as a flat [field, value, field, value, …] list.
    const flat = (await this.command<string[] | null>(["HGETALL", key])) ?? [];
    const out: Record<string, V> = {};
    for (let i = 0; i + 1 < flat.length; i += 2) out[flat[i]] = JSON.parse(flat[i + 1]) as V;
    return out;
  }

  async hdel(key: string, field: string): Promise<void> {
    await this.command(["HDEL", key, field]);
  }
}

export class MemoryStore implements DuelStore {
  private data = new Map<string, { value: string; expires: number }>();
  private hashes = new Map<string, { fields: Map<string, string>; expires: number }>();

  async get<V>(key: string): Promise<V | null> {
    const hit = this.data.get(key);
    if (!hit) return null;
    if (hit.expires < Date.now()) {
      this.data.delete(key);
      return null;
    }
    return JSON.parse(hit.value) as V;
  }

  async set(key: string, value: unknown, opts: { ex: number; nx?: boolean }): Promise<boolean> {
    if (opts.nx && (await this.get(key)) !== null) return false;
    this.data.set(key, { value: JSON.stringify(value), expires: Date.now() + opts.ex * 1000 });
    return true;
  }

  async del(key: string): Promise<void> {
    this.data.delete(key);
    this.hashes.delete(key);
  }

  private hash(key: string) {
    const h = this.hashes.get(key);
    if (h && h.expires < Date.now()) {
      this.hashes.delete(key);
      return undefined;
    }
    return h;
  }

  async hset(key: string, field: string, value: unknown, opts: { ex: number }): Promise<void> {
    const h = this.hash(key) ?? { fields: new Map<string, string>(), expires: 0 };
    h.fields.set(field, JSON.stringify(value));
    h.expires = Date.now() + opts.ex * 1000;
    this.hashes.set(key, h);
  }

  async hgetall<V>(key: string): Promise<Record<string, V>> {
    const out: Record<string, V> = {};
    for (const [f, v] of this.hash(key)?.fields ?? []) out[f] = JSON.parse(v) as V;
    return out;
  }

  async hdel(key: string, field: string): Promise<void> {
    this.hash(key)?.fields.delete(field);
  }
}

const g = globalThis as unknown as { __duelStore?: DuelStore };

/** Null when the deployment cannot host matches (Vercel without Redis). */
export function duelStore(): DuelStore | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return (g.__duelStore ??= new UpstashStore(url, token));
  if (process.env.VERCEL) return null;
  return (g.__duelStore ??= new MemoryStore());
}
