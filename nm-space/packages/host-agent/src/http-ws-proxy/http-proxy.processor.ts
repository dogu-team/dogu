import { BatchHttpProxyRequest, BatchHttpProxyResponse, BatchHttpProxyResponseValue, HttpProxyRequest, HttpProxyResponse } from '@dogu-private/console-host-agent';
import { Code } from '@dogu-private/types';
import { DefaultHttpOptions, DoguRequestTimeoutHeader, errorify, transformAndValidate } from '@dogu-tech/common';
import { DeviceServerResponseDto } from '@dogu-tech/device-client';
import { Injectable } from '@nestjs/common';
import { DeviceClientService } from '../device-client/device-client.service';
import { DoguLogger } from '../logger/logger';
import { MessageContext } from '../message/message.types';

@Injectable()
export class HttpProxyProcessor {
  constructor(
    private readonly deviceClientService: DeviceClientService,
    private readonly logger: DoguLogger,
  ) {}

  async httpRequest(param: HttpProxyRequest, context: MessageContext): Promise<HttpProxyResponse> {
    const { method, path, headers, query, body } = param;
    const timeout = headers && DoguRequestTimeoutHeader in headers ? parseInt(headers[DoguRequestTimeoutHeader]) : DefaultHttpOptions.request.timeout;
    try {
      const response = await this.deviceClientService.client.request<DeviceServerResponseDto>({
        method,
        url: path,
        headers: headers,
        params: query,
        data: body,
        timeout: timeout,
      });
      const { status, data } = response;
      const responseBody = await transformAndValidate(DeviceServerResponseDto, data);
      const result: HttpProxyResponse = {
        kind: 'HttpProxyResponse',
        statusCode: status,
        headers: response.headers,
        body: responseBody,
        request: param,
      };
      return result;
    } catch (error) {
      this.logger.error('Failed to send http request', {
        method,
        path,
        headers,
        query,
        body,
        error: errorify(error),
      });
      throw error;
    }
  }

  async batchHttpRequest(param: BatchHttpProxyRequest, context: MessageContext): Promise<BatchHttpProxyResponse> {
    const { requests, parallel } = param;
    if (parallel) {
      const results = await Promise.allSettled(requests.map((request) => this.httpRequest(request, context)));
      const values = results.map((result) => {
        if (result.status === 'fulfilled') {
          return {
            response: result.value,
          };
        } else {
          const errored = errorify(result.reason);
          return {
            error: {
              code: Code.CODE_HOST_AGENT_REQUEST_FAILED,
              message: errored.message,
              details: {
                stack: errored.stack,
                cause: errored.cause,
              },
            },
          };
        }
      });
      const result: BatchHttpProxyResponse = {
        kind: 'BatchHttpProxyResponse',
        values,
      };
      return result;
    } else {
      const values: BatchHttpProxyResponseValue[] = [];
      for (const request of requests) {
        try {
          const response = await this.httpRequest(request, context);
          values.push({
            response,
          });
        } catch (error) {
          const errored = errorify(error);
          values.push({
            error: {
              code: Code.CODE_HOST_AGENT_REQUEST_FAILED,
              message: errored.message,
              details: {
                stack: errored.stack,
                cause: errored.cause,
              },
            },
          });
        }
      }
      const result: BatchHttpProxyResponse = {
        kind: 'BatchHttpProxyResponse',
        values,
      };
      return result;
    }
  }
}
