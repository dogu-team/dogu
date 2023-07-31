import axios, { AxiosError, AxiosInstance, isAxiosError } from 'axios';
import { errorify } from './utilities/functions';

export class FilteredAxiosError extends Error {
  readonly code?: string;
  readonly responseStatus?: number;
  readonly details?: unknown;

  constructor(axiosError: AxiosError) {
    const { message, cause } = axiosError;
    super(message, { cause });
    this.name = 'FilteredAxiosError';
    this.cause = cause;
    this.code = axiosError.code;
    this.responseStatus = axiosError.response?.status;
    this.details = axiosError.toJSON();
  }
}

function parseAxiosError(value: unknown): Error | FilteredAxiosError {
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

let axiosErrorFilterSet = false;

export function setAxiosErrorFilterToGlobal(): void {
  if (axiosErrorFilterSet) {
    return;
  }

  setAxiosErrorFilterToIntercepter(axios);
  axiosErrorFilterSet = true;
}
