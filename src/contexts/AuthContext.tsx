'use client';

import { CustomerData } from '@/lib/api/types';
import useCustomerData from '@/lib/api/useCustomerData';
import { pushItemToDataLayer } from '@/lib/utils/googleAnalytics';
import type { User, AuthChangeEvent, Session, SupabaseClient } from '@supabase/supabase-js';
import { getCookie } from 'cookies-next';
import dynamic from 'next/dynamic';
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';

const Authenticator = dynamic(() => import('@/components/Authenticator'), {
  ssr: false,
});

interface AuthContextState {
  isAuthenticated: boolean | undefined;
  isGuest: boolean;
  setIsAuthenticated: Dispatch<SetStateAction<boolean | undefined>>;
  customerData: CustomerData | undefined;
  setCustomerData: Dispatch<SetStateAction<CustomerData | undefined>>;
  setCustomerCulture: (newCulture: string) => void;
  openAuthenticator: (options?: { onClose?: () => void; onSuccess?: () => void }) => void;
  closeAuthenticator: () => void;
  signInAsGuest: () => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextState | null>(null);

export const useAuth = (): AuthContextState => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthContextProvider');
  return ctx;
};

interface AuthContextProviderProps {
  children: ReactNode;
}

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [customerData, setCustomerData] = useState<CustomerData>();
  const { getCustomerData, createCustomer } = useCustomerData();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>();
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [authenticatorOpen, setAuthenticatorOpen] = useState<boolean>(false);
  const [onAuthenticatorClose, setOnAuthenticatorClose] = useState<(() => void) | undefined>();
  const [onAuthenticatorSuccess, setOnAuthenticatorSuccess] = useState<(() => void) | undefined>();

  // Refs to prevent loops
  const supabaseRef = useRef<SupabaseClient | null>(null);
  const initializedRef = useRef(false);
  const initializingRef = useRef(false);
  // customerData'nın güncel değerine closure'dan erişmek için ref
  const customerDataRef = useRef<CustomerData | undefined>(undefined);

  // Store latest functions in refs to avoid dependency issues
  const getCustomerDataRef = useRef(getCustomerData);
  const createCustomerRef = useRef(createCustomer);

  useEffect(() => {
    getCustomerDataRef.current = getCustomerData;
    createCustomerRef.current = createCustomer;
  }, [getCustomerData, createCustomer]);

  // customerDataRef'i her güncellemede senkronize et (stale closure önlemi)
  useEffect(() => {
    customerDataRef.current = customerData;
  }, [customerData]);

  const getSupabase = useCallback(async (): Promise<SupabaseClient> => {
    let supabase = supabaseRef.current;

    if (!supabase) {
      const { createClient } = await import('@/lib/supabase/client');
      supabase = createClient() as SupabaseClient;
      supabaseRef.current = supabase;
    }

    return supabase;
  }, []);

  const initCustomerData = async (user: User) => {
    if (initializingRef.current) return;
    initializingRef.current = true;

    try {
      if (user.is_anonymous) {
        setIsGuest(true);
        setIsAuthenticated(true);
        setCustomerData(undefined);
        return;
      }
      setIsGuest(false);

      // EXISTING CUSTOMER CHECK
      const existing = await getCustomerDataRef.current();

      if (existing) {
        setCustomerData(existing);
        setIsAuthenticated(true);
        return;
      }

      // CREATE CUSTOMER FLOW
      const name = user.user_metadata?.full_name?.split(' ')[0] ?? user.user_metadata?.name ?? "";
      const surname = user.user_metadata?.full_name?.split(' ').slice(1).join(' ') ?? user.user_metadata?.family_name ?? "";
      const email = user.email ?? "";
      const culture = user.user_metadata?.locale ?? "tr";
      let phoneCookie: { phoneNumber?: string; phoneCode?: string } = {};
      try {
        phoneCookie = JSON.parse(getCookie("phone") as string ?? "{}");
      } catch { /* malformed cookie, ignore */ }

      const payload = {
        name,
        surname,
        email,
        culture,
        phoneNumber: phoneCookie.phoneNumber ?? undefined,
        phoneCode: phoneCookie.phoneCode ?? undefined,
      };

      const created = await createCustomerRef.current(payload);

      if (!created) throw new Error("Create customer failed");

      setCustomerData(created);
      setIsAuthenticated(true);

      // Google/magic-link ile kayıtta kullanıcı SMS iznini kabul etmedi
      // — KVKK 5. madde gereği açık rıza alınmadan true gönderilemez
      pushItemToDataLayer({
        event: "sign_up",
        email_permission: true,
        sms_permission: false,
        userId: user.id,
      });
    } catch {
      setIsAuthenticated(false);
    } finally {
      initializingRef.current = false;
    }
  };

  // Supabase Auth State Listener - runs only once
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    let authSubscription: { unsubscribe: () => void } | undefined;
    let cancelled = false;

    // Initial session check - use getUser() for more reliable check
    const checkSession = async (supabase: SupabaseClient) => {
      try {
        // First try to get session from cookies
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Verify the session is valid by getting user
          const { data: { user }, error } = await supabase.auth.getUser();

          if (error || !user) {
            setIsAuthenticated(false);
            setCustomerData(undefined);
            return;
          }

          // setIsAuthenticated(true) burada çağrılmıyor —
          // initCustomerData içinde customerData hazır olduktan sonra set ediliyor
          initCustomerData(user);
        } else {
          setIsAuthenticated(false);
          setCustomerData(undefined);
        }
      } catch {
        setIsAuthenticated(false);
        setCustomerData(undefined);
      }
    };

    const setupAuth = async () => {
      const supabase = await getSupabase();
      if (cancelled) return;

      await checkSession(supabase);
      if (cancelled) return;

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event: AuthChangeEvent, session: Session | null) => {
          // Skip INITIAL_SESSION as we handle it in checkSession
          if (event === 'INITIAL_SESSION') return;

          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
            if (customerDataRef.current) {
              // customerData zaten var (örn. token yenileme) — hemen set et
              setIsAuthenticated(true);
            } else {
              // customerData hazır olmadan önce authenticated göstermemek için
              // initCustomerData içinde set ediliyor
              initCustomerData(session.user);
            }
          } else if (event === 'SIGNED_OUT') {
            setIsAuthenticated(false);
            setIsGuest(false);
            setCustomerData(undefined);
          }
        }
      );
      authSubscription = subscription;
    };

    setupAuth().catch(() => {
      if (!cancelled) {
        setIsAuthenticated(false);
        setCustomerData(undefined);
      }
    });

    return () => {
      cancelled = true;
      authSubscription?.unsubscribe();
    };
  }, [getSupabase]); // Runs only once; getSupabase is stable.

  const setCustomerCulture = useCallback((newCulture: string) => {
    setCustomerData((prev) => (prev ? { ...prev, culture: newCulture } : prev));
  }, []);

  const signInAsGuest = useCallback(async () => {
    const supabase = await getSupabase();
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    if (data.user?.is_anonymous) {
      setIsGuest(true);
      setIsAuthenticated(true);
      setCustomerData(undefined);
    }
  }, [getSupabase]);

  const openAuthenticator = useCallback((options?: { onClose?: () => void; onSuccess?: () => void }) => {
    setAuthenticatorOpen(true);
    setOnAuthenticatorClose(() => options?.onClose);
    setOnAuthenticatorSuccess(() => options?.onSuccess);
  }, []);

  const closeAuthenticator = useCallback(() => setAuthenticatorOpen(false), []);

  const value = useMemo(
    () => ({
      customerData,
      setCustomerData,
      isAuthenticated,
      isGuest,
      setIsAuthenticated,
      setCustomerCulture,
      openAuthenticator,
      closeAuthenticator,
      signInAsGuest,
    }),
    [customerData, isAuthenticated, isGuest, setCustomerCulture, openAuthenticator, closeAuthenticator, signInAsGuest]
  );

  return (
    <AuthContext.Provider value={value}>
      {authenticatorOpen && (
        <Authenticator
          open={authenticatorOpen}
          onClose={() => {
            onAuthenticatorClose?.();
            setOnAuthenticatorClose(undefined);
            closeAuthenticator();
          }}
          onSuccess={() => {
            onAuthenticatorSuccess?.();
            setOnAuthenticatorSuccess(undefined);
            closeAuthenticator();
          }}
        />
      )}

      {children}
    </AuthContext.Provider>
  );
};
