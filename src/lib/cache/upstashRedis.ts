type UpstashPipelineCommand = [string, ...Array<string | number>];

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export const isUpstashEnabled = (): boolean => Boolean(redisUrl && redisToken);

export const runUpstashPipeline = async (commands: UpstashPipelineCommand[]): Promise<unknown[]> => {
  if (!isUpstashEnabled()) return [];

  const res = await fetch(`${redisUrl}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${redisToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  });

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
