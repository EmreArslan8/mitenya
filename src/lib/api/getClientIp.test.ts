import { describe, it, expect, vi } from 'vitest';
import { getClientIp } from './getClientIp';

// Mock NextRequest
const createMockRequest = (headers: Record<string, string> = {}) => {
  return {
    headers: {
      get: vi.fn((key: string) => headers[key] || null),
    },
  } as any;
};

describe('getClientIp', () => {
  it('should return IP from x-forwarded-for header', () => {
    const req = createMockRequest({ 'x-forwarded-for': '192.168.1.1' });
    expect(getClientIp(req)).toBe('192.168.1.1');
  });

  it('should return first IP from comma-separated x-forwarded-for', () => {
    const req = createMockRequest({ 'x-forwarded-for': '192.168.1.1, 10.0.0.1, 172.16.0.1' });
    expect(getClientIp(req)).toBe('192.168.1.1');
  });

  it('should return IP from x-real-ip header', () => {
    const req = createMockRequest({ 'x-real-ip': '10.0.0.1' });
    expect(getClientIp(req)).toBe('10.0.0.1');
  });

  it('should return IP from x-vercel-forwarded-for header', () => {
    const req = createMockRequest({ 'x-vercel-forwarded-for': '172.16.0.1' });
    expect(getClientIp(req)).toBe('172.16.0.1');
  });

  it('should return IP from cf-connecting-ip header (Cloudflare)', () => {
    const req = createMockRequest({ 'cf-connecting-ip': '203.0.113.1' });
    expect(getClientIp(req)).toBe('203.0.113.1');
  });

  it('should return IP from fastly-client-ip header', () => {
    const req = createMockRequest({ 'fastly-client-ip': '198.51.100.1' });
    expect(getClientIp(req)).toBe('198.51.100.1');
  });

  it('should return IP from true-client-ip header', () => {
    const req = createMockRequest({ 'true-client-ip': '192.0.2.1' });
    expect(getClientIp(req)).toBe('192.0.2.1');
  });

  it('should prioritize x-forwarded-for over other headers', () => {
    const req = createMockRequest({
      'x-forwarded-for': '192.168.1.1',
      'x-real-ip': '10.0.0.1',
      'cf-connecting-ip': '172.16.0.1',
    });
    expect(getClientIp(req)).toBe('192.168.1.1');
  });

  it('should return unknown when no IP headers present', () => {
    const req = createMockRequest({});
    expect(getClientIp(req)).toBe('unknown');
  });

  it('should trim whitespace from IP', () => {
    const req = createMockRequest({ 'x-forwarded-for': '  192.168.1.1  ' });
    expect(getClientIp(req)).toBe('192.168.1.1');
  });
});
