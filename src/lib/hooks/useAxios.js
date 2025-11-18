import { defaultAxiosSetup, defaultResponseInterceptor } from '@/lib/axios';
import axios from 'axios';
import { getSession } from 'next-auth/react';

const useAxios = () => {
  const axiosInstance = axios.create(defaultAxiosSetup);
  axiosInstance.interceptors.response.use(...defaultResponseInterceptor());
  axiosInstance.interceptors.request.use(
    async function (config) {
      const session = await getSession();
      if (session?.accessToken) config.headers['Authorization'] = `Bearer ${session.accessToken}`;
      return config;
    },
    function (err) {
      return Promise.reject(err);
    }
  );

  return axiosInstance;
};

export default useAxios;
