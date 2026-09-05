'use client';

import { CustomerData } from '@/lib/api/types';
import useCustomerData from '@/lib/api/useCustomerData';
import { pushItemToDataLayer } from '@/lib/utils/dataLayer';
// perf: createClient (supabase ~268KB) statik DEĞİL — auth effect'inde dynamic
// import edilir, böylece LCP görseliyle bant yarışan eager bundle'dan çıkar.
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
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

interface AuthContextState {
  isAuthenticated: boolean | undefined;
  setIsAuthenticated: Dispatch<SetStateAction<boolean | undefined>>;
  customerData: CustomerData | undefined;
  setCustomerData: Dispatch<SetStateAction<CustomerData | undefined>>;
  setCustomerCulture: (newCulture: string) => void;
  /**
   * Kullaniciyi /uyelik sayfasina yonlendirir. (Eskiden modal aciyordu.)
   * `returnUrl` verilmezse mevcut sayfaya geri donulur.
   */
  openAuthenticator: (options?: { returnUrl?: string; type?: 'uye-girisi' | 'uye-ol' }) => void;
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
  const router = useRouter();

  // Refs to prevent loops
  const supabaseRef = useRef<any>(null);
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

  const initCustomerData = async (user: User) => {
    // Prevent multiple simultaneous calls
    if (initializingRef.current) {
      return;
    }

    initializingRef.current = true;

    try {
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
    } catch (err) {
      setIsAuthenticated(false);
    } finally {
      initializingRef.current = false;
    }
  };

  // Supabase Auth State Listener - runs only once
  useEffect(() => {
    if (initializedRef.current) return;

    const initAuth = async () => {
      // LCP (Largest Contentful Paint) görseliyle bant yarışını önlemek için
      // supabase client'ı (ve beraberindeki ~260KB chunk'ı) idle zamanına erteliyoruz.
      if ('requestIdleCallback' in window) {
        await new Promise((resolve) => window.requestIdleCallback(resolve, { timeout: 2000 }));
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        supabaseRef.current = supabase;
        initializedRef.current = true;

        // Initial session check - use getUser() for more reliable check
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Verify the session is valid by getting user
          const { data: { user }, error } = await supabase.auth.getUser();

          if (error || !user) {
            setIsAuthenticated(false);
            setCustomerData(undefined);
          } else {
            initCustomerData(user);
          }
        } else {
          setIsAuthenticated(false);
          setCustomerData(undefined);
        }

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
              setCustomerData(undefined);
            }
          }
        );

        return subscription;
      } catch (err) {
        setIsAuthenticated(false);
        return null;
      }
    };

    const authPromise = initAuth();

    return () => {
      authPromise.then((subscription) => {
        if (subscription) subscription.unsubscribe();
      });
    };
  }, []); // Empty dependency array - runs only once

  const setCustomerCulture = useCallback((newCulture: string) => {
    setCustomerData((prev) => (prev ? { ...prev, culture: newCulture } : prev));
  }, []);

  const openAuthenticator = useCallback(
    (options?: { returnUrl?: string; type?: 'uye-girisi' | 'uye-ol' }) => {
      // useSearchParams yerine window: provider tum agaci sardigi icin
      // hook kullanmak statik render'i Suspense'e zorlardi.
      const current =
        typeof window !== 'undefined'
          ? `${window.location.pathname}${window.location.search}`
          : '/';
      const returnUrl = options?.returnUrl ?? current;
      const type = options?.type ?? 'uye-girisi';
      router.push(`/uyelik?returnUrl=${encodeURIComponent(returnUrl)}&type=${type}`);
    },
    [router]
  );

  const value = useMemo(
    () => ({
      customerData,
      setCustomerData,
      isAuthenticated,
      setIsAuthenticated,
      setCustomerCulture,
      openAuthenticator,
    }),
    [customerData, isAuthenticated, setCustomerCulture, openAuthenticator]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
