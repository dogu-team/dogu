import { AxiosError, AxiosInstance, isAxiosError } from 'axios';
import { Printable } from './logs';
import { errorify } from './utilities/functions';

export class FilteredAxiosError extends Error {
  readonly code?: string;
  readonly responseStatus?: number;
  readonly data?: unknown;
  readonly details?: unknown;

  constructor(axiosError: AxiosError) {
    const { message, cause } = axiosError;
    super(message, { cause });
    this.name = 'FilteredAxiosError';
    this.code = axiosError.code;
    this.responseStatus = axiosError.response?.status;
    this.data = axiosError.response?.data;
    this.details = axiosError.toJSON();
  }
}

export function parseAxiosError(value: unknown): Error | FilteredAxiosError {
  const error = errorify(value);
  if (!isAxiosError(error)) {
    return error;
  }
  return new FilteredAxiosError(error);
}

export function isFilteredAxiosError(value: unknown): value is FilteredAxiosError {
  return value instanceof FilteredAxiosError;
}

export function setAxiosErrorFilterToIntercepter(axios: AxiosInstance): void {
  axios.interceptors.response.use(undefined, (error) => {
    const filteredError = parseAxiosError(error);
    return Promise.reject(filteredError);
  });
}

export function setAxiosFilterErrorAndLogging(instance: AxiosInstance, printable: Printable): void {
  instance.interceptors.request.use(
    (request) => {
      printable.info('axios request', {
        method: request.method,
        url: request.url,
        query: request.params,
        data: request.data,
      });
      return request;
    },
    (e) => {
      const error = parseAxiosError(e);
      printable.error('axios request error', { error });
      return Promise.reject(error);
    },
  );

  instance.interceptors.response.use(
    (response) => {
      printable.info('axios response', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      });
      return response;
    },
    (e) => {
      const error = parseAxiosError(e);
      printable.error('axios response error', { error });
      return Promise.reject(error);
    },
  );
}
