/**
 * axios 封装
 */
import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';

/**
 * 扩展的请求配置，支持 Next.js cache 选项
 */
export interface RequestConfig extends AxiosRequestConfig {
  next?: {
    tags?: string[];
    revalidate?: number | false;
  };
}

/**
 * 统一错误处理
 */
const errorHandler = (error: AxiosError) => {
  if (error.response) {
    const { status } = error.response;
    const message = error.message;

    switch (status) {
      case 400:
        console.error('请求参数错误:', message);
        break;
      case 401:
        console.error('未授权，请重新登录:', message);
        break;
      case 403:
        console.error('拒绝访问:', message);
        break;
      case 404:
        console.error('请求资源不存在:', message);
        break;
      case 500:
        console.error('服务器错误:', message);
        break;
      default:
        console.error(`请求失败(${status}):`, message);
    }
  } else if (error.request) {
    console.error('网络错误，请检查网络连接');
  } else {
    console.error('请求配置错误:', error.message);
  }

  return Promise.reject(error);
};

const createInstance = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 请求拦截
  instance.interceptors.request.use(
    config => {
      return config;
    },
    error => {
      return Promise.reject(error);
    },
  );

  // 响应拦截
  instance.interceptors.response.use(
    response => response,
    errorHandler,
  );

  return instance;
};

export { createInstance };
