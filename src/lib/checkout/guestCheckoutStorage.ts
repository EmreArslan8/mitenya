import type { AddressData } from '@/lib/api/types';

const GUEST_CHECKOUT_STORAGE_KEY = 'mitenya_guest_checkout';

type GuestCheckoutDraft = {
  email: string;
  address: Partial<AddressData>;
};

const canUseStorage = () => typeof window !== 'undefined' && !!window.localStorage;

export const readGuestCheckoutDraft = (): GuestCheckoutDraft | null => {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(GUEST_CHECKOUT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<GuestCheckoutDraft>;
    if (!parsed.address || typeof parsed.email !== 'string') return null;

    return {
      email: parsed.email,
      address: parsed.address,
    };
  } catch {
    return null;
  }
};

export const saveGuestCheckoutDraft = (address: Partial<AddressData>) => {
  if (!canUseStorage()) return;

  const email = address.email ?? '';

  window.localStorage.setItem(
    GUEST_CHECKOUT_STORAGE_KEY,
    JSON.stringify({
      email,
      address,
    } satisfies GuestCheckoutDraft)
  );
};

export const clearGuestCheckoutDraft = () => {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(GUEST_CHECKOUT_STORAGE_KEY);
};
