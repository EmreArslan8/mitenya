'use client';

import Authenticator from '@/components/Authenticator';
import { CustomerData } from '@/lib/api/types';
import useCustomerData from '@/lib/api/useCustomerData';
import { pushItemToDataLayer } from '@/lib/utils/googleAnalytics';
import redirectToLogin from '@/lib/utils/redirectToLogin';
import { getCookie } from 'cookies-next';
import { jwtDecode } from 'jwt-decode';
import { getSession, useSession } from 'next-auth/react';
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type IdTokenContents = {
  name: string;
  family_name: string;
  email: string;
  locale: string;
};

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

  const { status } = useSession({ required: false });

  const initCustomerData = async () => {
    console.log("🔵 [AUTH] initCustomerData() STARTED");

    const session = await getSession();
    console.log("🟣 [AUTH] Session:", session);

    if (!session) {
      console.log("🔴 [AUTH] No session → NOT AUTHENTICATED");
      setIsAuthenticated(false);
      return;
    }

    // EXISTING CUSTOMER CHECK
    console.log("🟢 [AUTH] Fetching existing customer...");
    const existing = await getCustomerData();
    console.log("🟢 [AUTH] getCustomerData() RESULT:", existing);

    if (existing) {
      setCustomerData(existing);
      setIsAuthenticated(true);
      return;
    }

    // CREATE CUSTOMER FLOW
    console.log("🟡 [AUTH] Customer NOT found → creating new one...");

    try {
      const idData = jwtDecode<IdTokenContents>(session.idToken);

      const name = idData.name ?? "";
      const surname = idData.family_name ?? "";
      const email = idData.email;
      const culture = idData.locale ?? "tr";
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

      const created = await createCustomer(payload);
      console.log("🟢 [AUTH] createCustomer() RESULT:", created);

      if (!created) throw new Error("Create customer failed");

      setCustomerData(created);
      setIsAuthenticated(true);

      pushItemToDataLayer({
        event: "sign_up",
        email_permission: true,
        sms_permission: true,
        userId: session.user.id,
      });

      console.log("🟢 [AUTH] Customer successfully initialized.");
    } catch (err) {
      console.log("🔴 [AUTH] ERROR:", err);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    console.log("🔵 [AUTH] useEffect triggered:", { status });

    if (status === "loading") return;

    if (status === "unauthenticated") {
      console.log("🔴 [AUTH] Unauthenticated");
      setIsAuthenticated(false);
      setCustomerData(undefined);
      return;
    }

    if (status === "authenticated") {
      console.log("🟢 [AUTH] Authenticated → starting init");
      initCustomerData();
    }
  }, [status]);

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
