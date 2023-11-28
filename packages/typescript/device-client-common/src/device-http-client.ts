import { Class, Instance, PathProviderType as PathProviderType_, stringify, transformAndValidate } from '@dogu-tech/common';
import { Body, DOGU_PROTOCOL_VERSION, Headers } from '@dogu-tech/types';
import { DeviceClientOptions, DeviceService, fillDeviceClientOptions } from './bases';
import { DeviceServerControllerMethodSpec } from './specs/types';
import { DeviceServerResponseDto } from './validations/types/responses';

export class DeviceHttpClient {
  protected readonly options: Required<DeviceClientOptions>;

  constructor(
    protected readonly deviceService: DeviceService,
    options?: DeviceClientOptions,
  ) {
    this.options = fillDeviceClientOptions(options);
    const { printable } = this.options;
    printable.info('dogu protocol version', { DOGU_PROTOCOL_VERSION });
  }

  protected async httpRequest<
    PathProviderType,
    QueryType extends Class<QueryType>,
    RequestBodyType extends Class<RequestBodyType>,
    ResponseBodyType extends Class<ResponseBodyType>,
    ResponseBodyDataType extends Class<ResponseBodyDataType>,
    ResponseBodyErrorType extends Class<ResponseBodyErrorType>,
  >(
    httpSpec: DeviceServerControllerMethodSpec<PathProviderType, QueryType, RequestBodyType, ResponseBodyType, ResponseBodyDataType, ResponseBodyErrorType>,
    pathProvider: PathProviderType_,
    query?: Instance<QueryType>,
    requestBody?: Instance<RequestBodyType>,
  ): Promise<Instance<ResponseBodyDataType>> {
    const path = httpSpec.resolvePath(pathProvider);
    const method = httpSpec.method;
    const headers: Headers = {
      values: [{ key: 'Authorization', value: `Custom ${this.options.token.value}` }],
    };
    if (requestBody) {
      headers.values.push({ key: 'Content-Type', value: 'application/json' });
    }

    const body: Body | undefined = requestBody
      ? {
          value: {
            $case: 'stringValue',
            stringValue: JSON.stringify(requestBody),
          },
        }
      : undefined;
    const queryCasted = query as { [key: string]: any } | undefined;
    const response = await this.deviceService.httpRequest(
      {
        method,
        path,
        query: queryCasted,
        body,
        headers,
      },
      this.options,
    );
    let stringValue = '';
    if (response.body?.value?.$case === 'bytesValue') {
      stringValue = Buffer.from(response.body.value.bytesValue).toString();
    } else if (response.body?.value?.$case === 'stringValue') {
      stringValue = response.body.value.stringValue;
    } else {
      throw new Error(`Unexpected body: ${stringify(response.body)}`);
    }
    const { statusCode } = response;
    if (!(200 <= statusCode && statusCode < 300)) {
      throw new Error(`Unexpected status code: ${statusCode}, body: ${stringValue}`);
    }
    const responseBody = await transformAndValidate(DeviceServerResponseDto, JSON.parse(stringValue));
    const { value } = responseBody;
    const { $case } = value;
    if ($case === 'error') {
      throw new Error(`Unexpected error: ${stringify(value)}`);
    } else if ($case === 'data') {
      const { data } = value;
      return transformAndValidate(httpSpec.responseBodyData, data);
    } else {
      throw new Error(`Unexpected body: ${stringify(responseBody)}`);
    }
  }
}
