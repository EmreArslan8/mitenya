'use client';

import Authenticator from '@/components/Authenticator';
import { CustomerData } from '@/lib/api/types';
import useCustomerData from '@/lib/api/useCustomerData';
import { pushItemToDataLayer } from '@/lib/utils/googleAnalytics';
import { createClient } from '@/lib/supabase/client';
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { getCookie } from 'cookies-next';
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
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
  openAuthenticator: (options?: { onClose?: () => void; onSuccess?: () => void }) => void;
  closeAuthenticator: () => void;
}

export const AuthContext = React.createContext<AuthContextState>({} as AuthContextState);

export const useAuth = () => useContext(AuthContext);

interface AuthContextProviderProps {
  children: ReactNode;
}

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [customerData, setCustomerData] = useState<CustomerData>();
  const { getCustomerData, createCustomer } = useCustomerData();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>();
  const [authenticatorOpen, setAuthenticatorOpen] = useState<boolean>(false);
  const [onAuthenticatorClose, setOnAuthenticatorClose] = useState<(() => void) | undefined>();
  const [onAuthenticatorSuccess, setOnAuthenticatorSuccess] = useState<(() => void) | undefined>();

  // Refs to prevent loops
  const supabaseRef = useRef(createClient());
  const initializedRef = useRef(false);
  const initializingRef = useRef(false);

  // Store latest functions in refs to avoid dependency issues
  const getCustomerDataRef = useRef(getCustomerData);
  const createCustomerRef = useRef(createCustomer);

  useEffect(() => {
    getCustomerDataRef.current = getCustomerData;
    createCustomerRef.current = createCustomer;
  }, [getCustomerData, createCustomer]);

  const initCustomerData = async (user: User) => {
    // Prevent multiple simultaneous calls
    if (initializingRef.current) {
      console.log("🟡 [AUTH] Already initializing, skipping...");
      return;
    }

    initializingRef.current = true;
    console.log("🔵 [AUTH] initCustomerData() STARTED", user.email);

    try {
      // EXISTING CUSTOMER CHECK
      console.log("🟢 [AUTH] Fetching existing customer...");
      const existing = await getCustomerDataRef.current();
      console.log("🟢 [AUTH] getCustomerData() RESULT:", existing);

      if (existing) {
        setCustomerData(existing);
        setIsAuthenticated(true);
        return;
      }

      // CREATE CUSTOMER FLOW
      console.log("🟡 [AUTH] Customer NOT found → creating new one...");

      const name = user.user_metadata?.full_name?.split(' ')[0] ?? user.user_metadata?.name ?? "";
      const surname = user.user_metadata?.full_name?.split(' ').slice(1).join(' ') ?? user.user_metadata?.family_name ?? "";
      const email = user.email ?? "";
      const culture = user.user_metadata?.locale ?? "tr";
      const phoneCookie = JSON.parse(getCookie("phone") as string ?? "{}");

      const payload = {
        name,
        surname,
        email,
        culture,
        phoneNumber: phoneCookie.phoneNumber ?? null,
        phoneCode: phoneCookie.phoneCode ?? null,
      };

      console.log("🟠 [AUTH] createCustomer() PAYLOAD:", payload);

      const created = await createCustomerRef.current(payload);
      console.log("🟢 [AUTH] createCustomer() RESULT:", created);

      if (!created) throw new Error("Create customer failed");

      setCustomerData(created);
      setIsAuthenticated(true);

      pushItemToDataLayer({
        event: "sign_up",
        email_permission: true,
        sms_permission: true,
        userId: user.id,
      });

      console.log("🟢 [AUTH] Customer successfully initialized.");
    } catch (err) {
      console.log("🔴 [AUTH] ERROR:", err);
      setIsAuthenticated(false);
    } finally {
      initializingRef.current = false;
    }
  };

  // Supabase Auth State Listener - runs only once
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const supabase = supabaseRef.current;

    // Initial session check - use getUser() for more reliable check
    const checkSession = async () => {
      try {
        // First try to get session from cookies
        const { data: { session } } = await supabase.auth.getSession();
        console.log("🔵 [AUTH] Initial session check:", session?.user?.email);

        if (session?.user) {
          // Verify the session is valid by getting user
          const { data: { user }, error } = await supabase.auth.getUser();

          if (error || !user) {
            console.log("🔴 [AUTH] Session invalid, clearing...");
            setIsAuthenticated(false);
            setCustomerData(undefined);
            return;
          }

          console.log("🟢 [AUTH] Session valid for:", user.email);
          setIsAuthenticated(true);
          initCustomerData(user);
        } else {
          setIsAuthenticated(false);
          setCustomerData(undefined);
        }
      } catch (err) {
        console.log("🔴 [AUTH] Session check error:", err);
        setIsAuthenticated(false);
        setCustomerData(undefined);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log("🔵 [AUTH] Auth state changed:", event, session?.user?.email);

        // Skip INITIAL_SESSION as we handle it in checkSession
        if (event === 'INITIAL_SESSION') return;

        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
          setIsAuthenticated(true);
          // Only init customer data if not already set
          if (!customerData) {
            initCustomerData(session.user);
          }
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setCustomerData(undefined);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - runs only once

  const setCustomerCulture = (newCulture: string) => {
    if (!customerData) return;
    setCustomerData({ ...customerData, culture: newCulture });
  };

  const openAuthenticator = (options?: { onClose?: () => void; onSuccess?: () => void }) => {
    setAuthenticatorOpen(true);
    setOnAuthenticatorClose(() => options?.onClose);
    setOnAuthenticatorSuccess(() => options?.onSuccess);
  };

  const closeAuthenticator = () => setAuthenticatorOpen(false);

  const value = useMemo(
    () => ({
      customerData,
      setCustomerData,
      isAuthenticated,
      setIsAuthenticated,
      setCustomerCulture,
      openAuthenticator,
      closeAuthenticator,
    }),
    [customerData, isAuthenticated]
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
