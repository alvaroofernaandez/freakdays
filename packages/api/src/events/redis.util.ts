export interface RedisConnectionOptions {
  host: string;
  port: number;
  password?: string;
}

/**
 * Parses a Redis URL string into connection options.
 * Returns undefined when url is absent (test env / Redis not configured).
 *
 * Supported formats:
 *   redis://[:password@]host[:port]
 *   rediss://[:password@]host[:port]  (TLS)
 */
export function parseRedisUrl(url: string | undefined): RedisConnectionOptions | undefined {
  if (!url) {
    return undefined;
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname || 'localhost';
    const port = parsed.port ? parseInt(parsed.port, 10) : 6379;
    const password = parsed.password || undefined;

    return { host, port, password };
  } catch {
    return undefined;
  }
}
