import { ControllerMethodSpec, ControllerMethodSpecOptions, PathProviderType } from '../common/specs.js';

export type DeviceServerControllerMethodSpecOptions<
  PathProvider extends PathProviderType,
  Query = never,
  RequestBody = never,
  ResponseBody = never,
  ResponseBodyData = never,
  ResponseBodyError = never,
> = ControllerMethodSpecOptions<PathProvider, Query, RequestBody, ResponseBody> & {
  responseBodyData?: ResponseBodyData;
  responseBodyError?: ResponseBodyError;
};

export class DeviceServerControllerMethodSpec<
  PathProvider extends PathProviderType,
  Query = never,
  RequestBody = never,
  ResponseBody = never,
  ResponseBodyData = never,
  ResponseBodyError = never,
> extends ControllerMethodSpec<PathProvider, Query, RequestBody, ResponseBody> {
  responseBodyData: ResponseBodyData;
  responseBodyError: ResponseBodyError;

  constructor(options: DeviceServerControllerMethodSpecOptions<PathProvider, Query, RequestBody, ResponseBody, ResponseBodyData, ResponseBodyError>) {
    super(options);
    this.responseBodyData = options.responseBodyData ?? ({} as never);
    this.responseBodyError = options.responseBodyError ?? ({} as never);
  }
}
