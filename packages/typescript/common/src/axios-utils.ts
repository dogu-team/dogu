import { AxiosError, isAxiosError } from 'axios';
import _ from 'lodash';
import { errorify } from './utilities/functions';

export interface FilteredAxiosRequest {
  protocol?: string;
  host?: string;
  path?: string;
  method?: string;
}

export interface FilteredAxiosResponse {
  status: number;
  data: unknown;
  headers: unknown;
}

export class FilteredAxiosError extends Error {
  readonly request?: FilteredAxiosRequest = undefined;
  readonly response?: FilteredAxiosResponse = undefined;

  constructor(axiosError: AxiosError) {
    const { message, name, stack, cause, response } = axiosError;
    super(message, { cause });
    this.name = name;
    this.stack = stack;
    if (axiosError.request) {
      const request: FilteredAxiosRequest = {};
      const protocol = _.get(axiosError.request, 'protocol') as string | undefined;
      request.protocol = typeof protocol === 'string' ? protocol : String(protocol);
      const host = _.get(axiosError.request, 'host') as string | undefined;
      request.host = typeof host === 'string' ? host : String(host);
      const path = _.get(axiosError.request, 'path') as string | undefined;
      request.path = typeof path === 'string' ? path : String(path);
      const method = _.get(axiosError.request, 'method') as string | undefined;
      request.method = typeof method === 'string' ? method : String(method);
    }
    if (response) {
      const { status, data, headers } = response;
      this.response = { status, data, headers };
    }
  }
}

export interface PartialAxiosError {
  name: string;
  code?: string;
  message: string;
  stack: string;
  request?: {
    protocol?: string;
    host?: string;
    path?: string;
    method?: string;
  };
  response?: {
    status?: number;
    data?: unknown;
    headers?: unknown;
  };
}

export function parseAxiosError(value: unknown): Error | PartialAxiosError {
  const error = errorify(value);
  if (!isAxiosError(error)) {
    return error;
  }
  return {
    name: error.name,
    code: error.code,
    message: error.message,
    stack: error.stack,
    request: error.request
      ? {
          protocol: ((): string | undefined => {
            const value = _.get(error.request, 'protocol') as string | undefined;
            if (typeof value === 'string') {
              return value;
            }
            return undefined;
          })(),
          host: ((): string | undefined => {
            const value = _.get(error.request, 'host') as string | undefined;
            if (typeof value === 'string') {
              return value;
            }
            return undefined;
          })(),
          path: ((): string | undefined => {
            const value = _.get(error.request, 'path') as string | undefined;
            if (typeof value === 'string') {
              return value;
            }
            return undefined;
          })(),
          method: ((): string | undefined => {
            const value = _.get(error.request, 'method') as string | undefined;
            if (typeof value === 'string') {
              return value;
            }
            return undefined;
          })(),
        }
      : undefined,
    response: error.response
      ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        }
      : undefined,
  };
}
