import { LRUCache } from "lru-cache";

const DEFAULT_MAX_SIZE = 512;
const DEFAULT_MAX_AGE_IN_MINUTES = 15;

export class MemoryCache {
  private cache: LRUCache<string, any>;

  constructor(maxAgeInMinutes = DEFAULT_MAX_AGE_IN_MINUTES, maxSize = DEFAULT_MAX_SIZE) {
    const maxAgeInMs = maxAgeInMinutes * 60 * 1000;
    this.cache = new LRUCache({
      max: maxSize,
      ttl: maxAgeInMs
    });
  }

  set(key: string, value: any): void {
    this.cache.set(key, value);
  }

  get(key: string): any {
    return this.cache.get(key);
  }

  length() {
    return this.cache.size;
  }

  keys() {
    return this.cache.keys();
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  has(key: string) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }

  prune() {
    this.cache.purgeStale();
  }
}
