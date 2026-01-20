import { NextRequest } from "next/server";

const IP_HEADER_KEYS = [
  "x-forwarded-for",
  "x-real-ip",
  "x-vercel-forwarded-for",
  "cf-connecting-ip",
  "fastly-client-ip",
  "true-client-ip",
];

export const getClientIp = (req: NextRequest) => {
  for (const key of IP_HEADER_KEYS) {
    const value = req.headers.get(key);
    if (value) {
      return value.split(",")[0]?.trim() || "unknown";
    }
  }

  return "unknown";
};
