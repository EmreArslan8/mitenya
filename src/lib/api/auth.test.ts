import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendOTP, verifyOTP } from './auth';
import bring from './bring';

vi.mock('./bring', () => ({
  default: vi.fn(),
}));

describe('auth helpers', () => {
  const bringMock = bring as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    bringMock.mockReset();
  });

  it('sendOTP returns ok and isNewUser', async () => {
    bringMock.mockResolvedValue([{ ok: true, isNewUser: true }, null]);

    const result = await sendOTP({ phoneCode: '+90', phoneNumber: '555' } as any);
    expect(result).toEqual({ ok: true, isNewUser: true });
  });

  it('sendOTP handles errors', async () => {
    bringMock.mockResolvedValue([null, new Error('fail')]);

    const result = await sendOTP({ phoneCode: '+90', phoneNumber: '555' } as any);
    expect(result).toEqual({ ok: false, isNewUser: undefined });
  });

  it('verifyOTP returns response on success', async () => {
    bringMock.mockResolvedValue([{ ok: true, username: 'user' }, null]);

    const result = await verifyOTP('1234', { phoneCode: '+90', phoneNumber: '555' } as any);
    expect(result).toEqual({ ok: true, username: 'user' });
  });

  it('verifyOTP handles errors', async () => {
    bringMock.mockResolvedValue([null, new Error('fail')]);

    const result = await verifyOTP('1234', { phoneCode: '+90', phoneNumber: '555' } as any);
    expect(result).toEqual({ ok: false, username: undefined });
  });
});
