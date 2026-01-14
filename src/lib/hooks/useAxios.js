import { createClient } from '@/lib/supabase/client';
import axios from 'axios';
import { defaultAxiosSetup, defaultResponseInterceptor } from '@/lib/axios';

const useAxios = () => {
  const axiosInstance = axios.create(defaultAxiosSetup);
  axiosInstance.interceptors.response.use(...defaultResponseInterceptor());
  axiosInstance.interceptors.request.use(
    async function (config) {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      console.log("🔐 [AXIOS] Session:", session?.user?.email);
      console.log("🔐 [AXIOS] Token:", session?.access_token ? "EXISTS" : "MISSING");

      if (session?.access_token) {
        config.headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      return config;
    }
  );

  return axiosInstance;
};

export default useAxios;
