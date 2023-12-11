import { AxiosError, AxiosInstance, isAxiosError } from 'axios';
import { Printable } from './logs';
import { errorify } from './utilities/functions';

export class FilteredAxiosError extends Error {
  readonly code?: string;
  readonly responseStatus?: number;
  readonly responseData?: unknown;
  readonly details?: unknown;

  constructor(axiosError: AxiosError) {
    const { message, cause } = axiosError;
    super(message, { cause });
    this.name = 'FilteredAxiosError';
    this.code = axiosError.code;
    this.responseStatus = axiosError.response?.status;
    this.responseData = axiosError.response?.data;
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
  axios.interceptors.response.use(undefined, async (error) => {
    const filteredError = parseAxiosError(error);
    return Promise.reject(filteredError);
  });
}

export function setAxiosFilterErrorAndLogging(name: string, instance: AxiosInstance, printable: Printable): void {
  instance.interceptors.request.use(
    (request) => {
      printable.info(`${name} request`, {
        method: request.method,
        url: request.url,
        query: request.params,
        data: request.data,
      });
      return request;
    },
    async (e) => {
      const error = parseAxiosError(e);
      printable.error(`${name} request error`, { error });
      return Promise.reject(error);
    },
  );

  instance.interceptors.response.use(
    (response) => {
      printable.info(`${name} response`, {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      });
      return response;
    },
    async (e) => {
      const error = parseAxiosError(e);
      printable.error(`${name} response error`, { error });
      return Promise.reject(error);
    },
  );
}
