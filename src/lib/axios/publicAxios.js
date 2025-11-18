import axios from 'axios';
import { defaultAxiosSetup, defaultResponseInterceptor } from './common';

const publicAxiosInstance = axios.create(defaultAxiosSetup);

publicAxiosInstance.interceptors.request.use(
  function (config) {
    return config;
  },
  function (err) {
    return Promise.reject(err);
  }
);

publicAxiosInstance.interceptors.response.use(...defaultResponseInterceptor());

export default publicAxiosInstance;
