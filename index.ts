import axios, { AxiosInstance, AxiosResponse } from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import FormData from 'form-data';

/**
 * ServiceTrade Options interface
 */
export interface ServiceTradeOptions {
  baseUrl?: string;
  username?: string;
  password?: string;
  cookie?: string;
  userAgent?: string;
  disableRefreshAuth?: boolean;
  onResetCookie?: () => Promise<void>;
  onSetCookie?: (result: AxiosResponse) => Promise<void>;
}

/**
 * ServiceTrade Methods interface
 */
export interface ServiceTradeMethods {
  setCookie: (cookie: string) => void;
  login: (username?: string, password?: string) => Promise<any>;
  logout: () => Promise<any>;
  get: (path: string) => Promise<any>;
  put: (path: string, postData: any) => Promise<any>;
  post: (path: string, postData: any) => Promise<any>;
  delete: (path: string) => Promise<any>;
  attach: (params: any, file: { value: Buffer; options: { filename: string; contentType: string } }) => Promise<any>;
}

export const Servicetrade = (options: ServiceTradeOptions): ServiceTradeMethods => {
  options = options || {};
  options.baseUrl = options.baseUrl || 'https://api.servicetrade.com';

  const request: AxiosInstance = axios.create({
    baseURL: `${options.baseUrl}/api`,
    maxBodyLength: Infinity,
  });

  if (options.cookie) {
    request.defaults.headers['Cookie'] = options.cookie;
  }

  if (options.userAgent) {
    request.defaults.headers['User-Agent'] = options.userAgent;
  }

  if (!options.disableRefreshAuth) {
    const refreshAuthLogic = async function (failedRequest: any) {
      request.defaults.headers['Cookie'] = null;

      if (options.onResetCookie) {
        await options.onResetCookie();
      }

      const auth = {
        username: options.username,
        password: options.password,
      };

      try {
        const result = await request.post('/auth', auth);
        if (options.onSetCookie) {
          await options.onSetCookie(result);
        }
      } catch (e) {
        request.defaults.headers['Cookie'] = null;
        if (options.onResetCookie) {
          await options.onResetCookie();
        }
        throw e;
      }
    };
    createAuthRefreshInterceptor(request, refreshAuthLogic);
  }

  request.interceptors.response.use((response) => {
    if (
      !request.defaults.headers['Cookie'] ||
      // Assumes cookie is a string; check length as a simple existence check
      !request.defaults.headers['Cookie'].length
    ) {
      if (response.headers && response.headers['set-cookie']) {
        const [cookie] = response.headers['set-cookie'];
        request.defaults.headers['Cookie'] = cookie;
      }
    }

    // Detect if the response is from a refresh token request
    if (!response.config && !response.headers && !response.request) {
      return response;
    }
    return response && response.data && response.data.data ? response.data.data : null;
  });

  return {
    setCookie: (cookie: string) => {
      request.defaults.headers['Cookie'] = cookie;
    },

    login: async (username?: string, password?: string) => {
      const auth = {
        username: username || options.username,
        password: password || options.password,
      };
      let result: AxiosResponse;
      try {
        result = await request.post('/auth', auth);
        if (options.onSetCookie) {
          await options.onSetCookie(result);
        }
      } catch (e) {
        request.defaults.headers['Cookie'] = null;
        throw e;
      }
      return result;
    },

    logout: () => {
      return request.delete('/auth');
    },

    get: (path: string) => {
      return request.get(path);
    },

    put: (path: string, postData: any) => {
      return request.put(path, postData);
    },

    post: (path: string, postData: any) => {
      return request.post(path, postData);
    },

    delete: (path: string) => {
      return request.delete(path);
    },

    attach: (
      params: any,
      file: { value: Buffer; options: { filename: string; contentType: string } }
    ) => {
      const data = params || {};
      const formData = new FormData();
      for (const key of Object.keys(data)) {
        formData.append(key, data[key]);
      }
      formData.append('uploadedFile', file.value, file.options);

      const formDataConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...formData.getHeaders(),
        },
      };

      return request.post('/attachment', formData, formDataConfig);
    },
  };
};

export default Servicetrade; 