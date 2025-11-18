// import axios from 'axios';
// import qs from 'qs';
// import { getUserTokens, setUserTokens } from 'states/auth';
// import { defaultAxiosSetup, defaultResponseInterceptor } from './common';

// const NAVLUNGO_INVALID_TOKEN_ERROR_CODE = 'Authentication/InvalidToken';
// const PP_INVALID_TOKEN_ERROR_CODE = 'authentication.invalidtoken.error';

// const axiosInstance = axios.create(defaultAxiosSetup);

// axiosInstance.interceptors.request.use(
//   function(config) {
//     const tokens = getUserTokens();

//     const token = !!tokens ? tokens.access_token : null;
//     if (token) {
//       config.headers['Authorization'] = `Bearer ${token}`;
//     }

//     return config;
//   },
//   function(err) {
//     return Promise.reject(err);
//   }
// );

// axiosInstance.interceptors.response.use(
//   function(response) {
//     // If the request succeeds, we don't have to do anything and just return the response
//     return response;
//   },
//   function(error) {
//     if (isTokenExpiredError(error)) {
//       console.log('token expired');
//       return resetTokenAndReattemptRequest(error);
//     } else return Promise.reject(error);
//   }
// );

// axiosInstance.interceptors.response.use(...defaultResponseInterceptor());

// const isTokenExpiredError = (error) => {
//   return (
//     error.response?.status === 401 &&
//     (error.response?.data?.type === NAVLUNGO_INVALID_TOKEN_ERROR_CODE ||
//       error.response?.data?.code === PP_INVALID_TOKEN_ERROR_CODE)
//   );
// };

// let isAlreadyFetchingAccessToken = false;

// // This is the list of waiting requests that will retry after the JWT refresh complete
// let subscribers = [];

// const resetTokenAndReattemptRequest = async (error) => {
//   try {
//     const { response: errorResponse } = error;
//     const resetToken = getUserTokens()?.refresh_token;
//     if (!resetToken) {
//       // We can't refresh, throw the error anyway
//       return Promise.reject(error);
//     }
//     /* Proceed to the token refresh procedure
//     We create a new Promise that will retry the request,
//     clone all the request configuration from the failed
//     request in the error object. */
//     const retryOriginalRequest = new Promise((resolve) => {
//       /* We need to add the request retry to the queue
//     since there another request that already attempt to
//     refresh the token */
//       console.log('retrying');
//       addSubscriber((access_token) => {
//         errorResponse.config.headers.Authorization = 'Bearer ' + access_token;
//         resolve(axios(errorResponse.config));
//       });
//     });

//     if (!isAlreadyFetchingAccessToken) {
//       isAlreadyFetchingAccessToken = true;

//       axios
//         .post(
//           `/v1/oauth/token`,
//           qs.stringify({
//             grant_type: 'refresh_token',
//             refresh_token: resetToken,
//             client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
//             client_secret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
//           }),
//           {
//             baseURL: process.env.NEXT_PUBLIC_NAVLUNGO_API_URL,
//             headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//           }
//         )
//         .then((response) => {
//           console.log('token refreshed');
//           setUserTokens(response.data);

//           //   TokenUtils.saveRefreshToken(newToken); // save the newly refreshed token for other requests to use
//           isAlreadyFetchingAccessToken = false;
//           onAccessTokenFetched();
//         })
//         .catch((error) => {
//           isAlreadyFetchingAccessToken = false;
//           //TODO
//           // history.push(paths.sessionExpired);
//           return Promise.reject(error);
//         });
//     }
//     return retryOriginalRequest;
//   } catch (err) {
//     return Promise.reject(err);
//   }
// };

// const onAccessTokenFetched = () => {
//   const access_token = getUserTokens()?.access_token;
//   // When the refresh is successful, we start retrying the requests one by one and empty the queue
//   subscribers.forEach((callback) => callback(access_token));
//   subscribers = [];
// };

// const addSubscriber = (callback) => {
//   subscribers.push(callback);
// };

// export default axiosInstance;
