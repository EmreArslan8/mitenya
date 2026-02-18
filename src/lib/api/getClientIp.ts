import { NextRequest } from "next/server";

const IP_HEADER_KEYS = [
  "x-forwarded-for",
  "x-real-ip",
  "x-vercel-forwarded-for",
  "cf-connecting-ip",
  "fastly-client-ip",
  "true-client-ip",
];

const isLikelyIp = (value: string) => {
  const v = value.trim();
  if (!v || v.length > 64) return false;
  const ipv4 = /^(?:\d{1,3}\.){3}\d{1,3}$/;
  const ipv6 = /^[0-9a-fA-F:]+$/;
  return ipv4.test(v) || ipv6.test(v);
};

export const getClientIp = (req: NextRequest) => {
  for (const key of IP_HEADER_KEYS) {
    const value = req.headers.get(key);
    if (value) {
      const first = value.split(",")[0]?.trim() || "";
      if (isLikelyIp(first)) return first;
    }
  }

  return "unknown";
};
