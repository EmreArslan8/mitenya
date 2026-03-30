'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import CookieConsentBanner from '@/components/CookieConsent/CookieConsentBanner';
import CookiePreferencesModal from '@/components/CookieConsent/CookiePreferencesModal';
import CookieConsentScripts from '@/components/CookieConsent/CookieConsentScripts';

export type CookieConsentState = {
  version: number;
  updatedAt: string;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

export type CookieConsentDraft = Pick<CookieConsentState, 'analytics' | 'marketing'>;

interface CookieConsentContextState {
  consent: CookieConsentState | null;
  isReady: boolean;
  openPreferences: () => void;
  closePreferences: () => void;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (draft: CookieConsentDraft) => void;
}

const CookieConsentContext = createContext<CookieConsentContextState>(
  {} as CookieConsentContextState
);

const CONSENT_STORAGE_KEY = 'mitenya_cookie_consent';
const CONSENT_VERSION = 1;
const POLICY_URL = '/cerez-politikasi';

const buildConsent = (draft: CookieConsentDraft): CookieConsentState => ({
  version: CONSENT_VERSION,
  updatedAt: new Date().toISOString(),
  necessary: true,
  analytics: Boolean(draft.analytics),
  marketing: Boolean(draft.marketing),
});

const readConsent = (): CookieConsentState | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsentState;
    if (!parsed || parsed.version !== CONSENT_VERSION) return null;
    return {
      ...parsed,
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
    };
  } catch (error) {
    console.warn('[CookieConsent] Failed to read consent:', error);
    return null;
  }
};

const writeConsent = (consent: CookieConsentState) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
  } catch (error) {
    console.warn('[CookieConsent] Failed to save consent:', error);
  }
};

export const useCookieConsent = () => useContext(CookieConsentContext);

export const CookieConsentProvider = ({ children }: { children: ReactNode }) => {
  const [consent, setConsent] = useState<CookieConsentState | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [draft, setDraft] = useState<CookieConsentDraft>({
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const stored = readConsent();
    setConsent(stored);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!preferencesOpen) return;
    setDraft({
      analytics: consent?.analytics ?? false,
      marketing: consent?.marketing ?? false,
    });
  }, [preferencesOpen, consent]);

  useEffect(() => {
    if (!isReady || typeof window === 'undefined') return;
    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? 'G-W2DHP8ZRJN';
    if (gaId) {
      (window as any)[`ga-disable-${gaId}`] = !consent?.analytics;
    }
  }, [consent, isReady]);

  const savePreferences = (nextDraft: CookieConsentDraft) => {
    const next = buildConsent(nextDraft);
    const shouldReload =
      Boolean(consent?.analytics && !next.analytics) ||
      Boolean(consent?.marketing && !next.marketing);

    setConsent(next);
    writeConsent(next);

    if (shouldReload && typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const acceptAll = () => {
    savePreferences({ analytics: true, marketing: true });
    setPreferencesOpen(false);
  };

  const rejectAll = () => {
    savePreferences({ analytics: false, marketing: false });
    setPreferencesOpen(false);
  };

  const openPreferences = () => {
    setBannerDismissed(false);
    setPreferencesOpen(true);
  };
  const closePreferences = () => setPreferencesOpen(false);

  const showBanner = isReady && !consent && !preferencesOpen;

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        isReady,
        openPreferences,
        closePreferences,
        acceptAll,
        rejectAll,
        savePreferences,
      }}
    >
      {children}
      <CookieConsentScripts consent={consent} isReady={isReady} />
      <CookieConsentBanner
        open={showBanner}
        collapsed={bannerDismissed}
        policyHref={POLICY_URL}
        onAcceptAll={acceptAll}
        onManage={openPreferences}
        onDismiss={() => setBannerDismissed(true)}
        onReopen={() => setBannerDismissed(false)}
      />
      <CookiePreferencesModal
        open={preferencesOpen}
        policyHref={POLICY_URL}
        draft={draft}
        onChange={setDraft}
        onAcceptAll={acceptAll}
        onRejectAll={rejectAll}
        onSave={() => {
          savePreferences(draft);
          setPreferencesOpen(false);
        }}
        onClose={closePreferences}
      />
    </CookieConsentContext.Provider>
  );
};
