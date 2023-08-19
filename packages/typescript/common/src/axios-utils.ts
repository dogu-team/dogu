import { AxiosError, AxiosInstance, isAxiosError } from 'axios';
import { errorify } from './utilities/functions';

export class FilteredAxiosError extends Error {
  readonly code?: string;
  readonly responseStatus?: number;
  readonly details?: unknown;

  constructor(axiosError: AxiosError) {
    const { message, cause } = axiosError;
    const details = axiosError.toJSON();
    const newMessage = `${message} ${JSON.stringify(details, null, 2)}`;
    super(newMessage, { cause });
    this.name = 'FilteredAxiosError';
    this.stack = axiosError.stack;
    this.code = axiosError.code;
    this.responseStatus = axiosError.response?.status;
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
