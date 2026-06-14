import axios, { AxiosRequestConfig } from 'axios';
import { defaultAxiosSetup, defaultResponseInterceptor, type ApiResponse } from '@/lib/axios/common';

export type { ApiResponse };

export interface ApiClient {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
  post<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
  put<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
  patch<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
}

const useAxios = (): ApiClient => {
  const axiosInstance = axios.create(defaultAxiosSetup);
  const [onSuccess, onError] = defaultResponseInterceptor();
  axiosInstance.interceptors.response.use(onSuccess as any, onError);
  axiosInstance.interceptors.request.use(
    async function (config) {
      // perf: supabase client'ı sadece request anında dynamic import ile yüklüyoruz.
      // Bu sayede supabase ve bağımlılıkları ana bundle'dan (shared by all) çıkar.
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.access_token) {
        config.headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      return config;
    }
  );

  return axiosInstance as unknown as ApiClient;
};

export default useAxios;
