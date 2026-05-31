type UpstashPipelineCommand = [string, ...Array<string | number>];

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const UPSTASH_TIMEOUT_MS = 1500;

export const isUpstashEnabled = (): boolean => Boolean(redisUrl && redisToken);

export const runUpstashPipeline = async (commands: UpstashPipelineCommand[]): Promise<unknown[]> => {
  if (!isUpstashEnabled()) return [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTASH_TIMEOUT_MS);

  const res = await fetch(`${redisUrl}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${redisToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  if (!res.ok) {
    throw new Error(`Upstash error: ${res.status}`);
  }

  const payload = await res.json();
  if (typeof payload !== 'object' || payload === null) return [];
  const result = (payload as { result?: unknown }).result;
  return Array.isArray(result) ? result : [];
};

export const parseUpstashResult = (entry: unknown): unknown => {
  if (typeof entry !== 'object' || entry === null) return entry;
  return (entry as { result?: unknown }).result;
};
