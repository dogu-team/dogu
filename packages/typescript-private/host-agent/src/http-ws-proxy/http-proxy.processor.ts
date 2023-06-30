import { HttpProxyRequest, HttpProxyResponse } from '@dogu-private/console-host-agent';
import { DefaultHttpOptions, errorify, transformAndValidate } from '@dogu-tech/common';
import { DeviceServerResponseDto } from '@dogu-tech/device-client';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { DeviceClientService } from '../device-client/device-client.service';
import { DoguLogger } from '../logger/logger';
import { MessageContext } from '../message/message.types';

@Injectable()
export class HttpProxyProcessor {
  constructor(private readonly deviceClientService: DeviceClientService, private readonly logger: DoguLogger) {}

  async httpRequest(param: HttpProxyRequest, context: MessageContext): Promise<HttpProxyResponse> {
    const { method, path, headers, query, body } = param;
    try {
      const response = await lastValueFrom(
        this.deviceClientService.service.request<DeviceServerResponseDto>({
          method,
          url: path,
          headers: headers,
          params: query,
          data: body,
          timeout: DefaultHttpOptions.request.timeout,
        }),
      );
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
}
