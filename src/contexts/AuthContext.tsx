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

type IdTokenContents = { name: string; family_name: string; email: string; locale: string };

interface AuthContextState {
  isAuthenticated: boolean | undefined; // NOTE: undefined means we don't know if the user is authenticated or not
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
    if (authenticatorOpen) return;
    const session = await getSession();
    if (!session) return setIsAuthenticated(false);

    const roles = session.user?.roles ?? [];
    if (roles.includes('WarehouseAdmin')) return redirectToLogin();

    let data = await getCustomerData();

    if (data) {
      setCustomerData(data);
      setIsAuthenticated(Boolean(data));
      return;
    }

    try {
      // TODO: we can probably modify the jwt and session callbacks to get these via getSession()
      const {
        name,
        family_name: surname,
        email,
        locale: culture = 'en',
      } = jwtDecode<IdTokenContents>(session.idToken);
      const phone = JSON.parse(getCookie('phone') as string ?? '{}');
      data = { fullName: `${name} ${surname}`, email, culture, ...phone };
      const result = await createCustomer({ name, surname, email, culture, ...phone });

      if (!result) throw new Error('Error initalizing customer data.');
      pushItemToDataLayer({
        event: 'sign_up',
        email_permission: true,
        sms_permission: true,
        userId: session.user.id,
      });
      setCustomerData(data);
      setIsAuthenticated(Boolean(data));
    } catch (error) {
      console.log('error: ', error);
      setIsAuthenticated(false);
      return;
    }
  };

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

  useEffect(() => {
    if (status === 'loading') return;
    else if (status === 'unauthenticated') {
      setIsAuthenticated(false);
      setCustomerData(undefined);
      return;
    } else if (status === 'authenticated' && customerData) {
      return setIsAuthenticated(true);
    }
    initCustomerData();
  }, [status, customerData]);

  const value = useMemo(
    () => ({
      customerData,
      setCustomerData,
      isAuthenticated,
      setCustomerCulture,
      openAuthenticator,
      closeAuthenticator,
      setIsAuthenticated
    }),
    [
      customerData,
      setCustomerData,
      isAuthenticated,
      setIsAuthenticated,
      setCustomerCulture,
      openAuthenticator,
      closeAuthenticator,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {authenticatorOpen && (
        <Authenticator
          open={authenticatorOpen}
          onClose={() => {
            if (onAuthenticatorClose) {
              onAuthenticatorClose();
              setOnAuthenticatorClose(undefined);
            }
            closeAuthenticator();
          }}
          onSuccess={() => {
            if (onAuthenticatorSuccess) {
              onAuthenticatorSuccess();
              setOnAuthenticatorSuccess(undefined);
            }
            closeAuthenticator();
          }}
        />
      )}
      {children}
    </AuthContext.Provider>
  );
};
