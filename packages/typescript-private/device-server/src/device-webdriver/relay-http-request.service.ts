import { HeaderRecord, stringify } from '@dogu-tech/common';
import { RelayRequest, RelayResponse } from '@dogu-tech/device-client-common';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { DoguLogger } from '../logger/logger';

const methodHandlers: {
  [key: string]: (url: string, request: RelayRequest, logger: DoguLogger) => Promise<RelayResponse>;
} = {
  GET: async (url, request, logger) => {
    const res = await axios.get(url);
    return convertResponse(res, logger);
  },
  POST: async (url, request, logger) => {
    const res = await axios.post(url, request.reqBody);
    return convertResponse(res, logger);
  },
  PUT: async (url, request, logger) => {
    const res = await axios.put(url, request.reqBody);
    return convertResponse(res, logger);
  },
  PATCH: async (url, request, logger) => {
    const res = await axios.patch(url, request.reqBody);
    return convertResponse(res, logger);
  },
  HEAD: async (url, request, logger) => {
    const res = await axios.head(url);
    return convertResponse(res, logger);
  },
  DELETE: async (url, request, logger) => {
    const res = await axios.delete(url);
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
export class RelayHttpRequestService {
  private readonly methodHandlers = methodHandlers;

  async relayHttp(url: string, request: RelayRequest, logger: DoguLogger): Promise<RelayResponse> {
    const handler = this.methodHandlers[request.method];
    if (!handler) {
      throw new Error(`Unknown method: ${request.method}`);
    }
    return handler(url, request, logger);
  }
}
