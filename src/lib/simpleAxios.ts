import axios from 'axios';

const axiosInstance = axios.create({ responseType: 'json' });

axiosInstance.interceptors.response.use(
  (response) => ({ ok: response.status == 200, ...response.data }),
  (error) => ({ ok: error.response.status == 200, ...error.response.data })
);

export interface CommonAxiosResponse {
  ok: boolean;
  [key: string]: unknown;
}

export default axiosInstance;
