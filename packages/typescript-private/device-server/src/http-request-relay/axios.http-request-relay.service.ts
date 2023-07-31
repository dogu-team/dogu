import { HeaderRecord, setAxiosErrorFilterToGlobal, stringify } from '@dogu-tech/common';
import { RelayResponse } from '@dogu-tech/device-client-common';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { DoguLogger } from '../logger/logger';
import { HttpRequestRelayHandler, HttpRequestRelayService } from './http-request-relay.common';

const methodHandlers: {
  [key: string]: HttpRequestRelayHandler;
} = {
  GET: async (url, request, logger) => {
    setAxiosErrorFilterToGlobal();
    const res = await axios.get(url, {
      headers: request.headers,
      params: request.query,
    });
    return convertResponse(res, logger);
  },
  POST: async (url, request, logger) => {
    setAxiosErrorFilterToGlobal();
    const res = await axios.post(url, request.reqBody, {
      headers: request.headers,
      params: request.query,
    });
    return convertResponse(res, logger);
  },
  PUT: async (url, request, logger) => {
    setAxiosErrorFilterToGlobal();
    const res = await axios.put(url, request.reqBody, {
      headers: request.headers,
      params: request.query,
    });
    return convertResponse(res, logger);
  },
  PATCH: async (url, request, logger) => {
    setAxiosErrorFilterToGlobal();
    const res = await axios.patch(url, request.reqBody, {
      headers: request.headers,
      params: request.query,
    });
    return convertResponse(res, logger);
  },
  HEAD: async (url, request, logger) => {
    setAxiosErrorFilterToGlobal();
    const res = await axios.head(url, {
      headers: request.headers,
      params: request.query,
    });
    return convertResponse(res, logger);
  },
  DELETE: async (url, request, logger) => {
    setAxiosErrorFilterToGlobal();
    const res = await axios.delete(url, {
      headers: request.headers,
      params: request.query,
    });
    return convertResponse(res, logger);
  },
};

function convertResponse<T>(res: axios.AxiosResponse<any, any>, logger: DoguLogger): RelayResponse {
  if (!res) {
    throw new Error('Response is null');
  }
  const headers: HeaderRecord = {};
  for (const headKey of Object.keys(res.headers)) {
    headers[headKey] = stringify(res.headers[headKey]);
  }
  const response: RelayResponse = {
    headers: headers,
    status: res.status,
    resBody: res.data as object,
  };

  return response;
}

@Injectable()
export class AxiosHttpRequestRelayService extends HttpRequestRelayService {
  private readonly methodHandlers = methodHandlers;

  getHandler(method: string): HttpRequestRelayHandler | null {
    return this.methodHandlers[method] || null;
  }
}
