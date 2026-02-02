import { signOut } from '../utils/signOut';

export type ApiResponse<T = any> = [T | null, any];

export const defaultAxiosSetup = {
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
  responseType: 'json' as const,
};

export const defaultResponseInterceptor = (): [
  (response: any) => ApiResponse,
  (error: any) => ApiResponse
] => {
  const onSuccess = (response: any): ApiResponse => {
    return [response?.data, null];
  };

  const onError = (error: any): ApiResponse => {
    const errorResponse = error?.response;
    console.log(errorResponse);

    if (errorResponse?.status === 401) signOut();
    if (errorResponse?.status === 403) {
      window.open(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/login`, '_self');
    }

    const errObj =
      errorResponse?.data ??
      {
        code: 'UNEXPECTED_SERVER_ERROR',
        details: { ...errorResponse },
      };

    return [null, errObj];
  };

  return [onSuccess, onError];
};
