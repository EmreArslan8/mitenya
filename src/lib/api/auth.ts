import { PhoneNumber } from './types';
import  bring  from './bring';
 
// Legacy phone OTP functions (kept for backward compatibility if needed)
export const sendOTP = async (values: PhoneNumber) => {
  try {
    const [res] = await bring<{ ok: boolean; isNewUser?: boolean }>(
      '/api/authentication/passwordless',
      {
        body: values,
      }
    );
    return { ok: res?.ok ?? false, isNewUser: res?.isNewUser };
  } catch (error) {
    console.log(error);
    return { ok: false, isNewUser: undefined };
  }
};
 
export const verifyOTP = async (
  code: string,
  phone: PhoneNumber
): Promise<{ ok: boolean; username: string | undefined | null }> => {
  try {
    const [res, err] = await bring<{ ok: boolean; username: string | null }>(
      '/api/authentication/passwordless',
      {
        body: { code, ...phone },
        method: 'PATCH',
      }
    );
    if (err || !res) throw err ?? new Error('Empty response');
    return res;
  } catch (error) {
    return { ok: false, username: undefined };
  }
};
 
// Email OTP functions are now handled directly by Supabase Auth
// These functions are kept as stubs for backward compatibility
// but should not be used - use Supabase client directly instead