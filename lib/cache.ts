export interface CacheRecord<T> {
  value: T;
  timestamp: number;
}

const DEFAULT_TTL = 60_000; // 60 seconds

const isBrowser = typeof window !== 'undefined';

export function loadCache<T>(key: string, ttl: number = DEFAULT_TTL): T | null {
  if (!isBrowser) return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;

    const parsed: CacheRecord<T> = JSON.parse(raw);
    if (!parsed || typeof parsed.timestamp !== 'number') {
      window.sessionStorage.removeItem(key);
      return null;
    }

    if (Date.now() - parsed.timestamp > ttl) {
      window.sessionStorage.removeItem(key);
      return null;
    }

    return parsed.value;
  } catch (error) {
    console.warn('Failed to load cache entry', key, error);
    if (isBrowser) {
      window.sessionStorage.removeItem(key);
    }
    return null;
  }
}

export function saveCache<T>(key: string, value: T): void {
  if (!isBrowser) return;
  try {
    const record: CacheRecord<T> = {
      value,
      timestamp: Date.now(),
    };
    window.sessionStorage.setItem(key, JSON.stringify(record));
  } catch (error) {
    console.warn('Failed to save cache entry', key, error);
  }
}

export function clearCache(key: string): void {
  if (!isBrowser) return;
  window.sessionStorage.removeItem(key);
}
