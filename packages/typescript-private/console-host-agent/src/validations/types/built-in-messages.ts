import { DeviceId, ErrorResultDto, OrganizationId, ProjectId, RoutineDeviceJob, RoutineDeviceJobId, RoutineStep, RoutineStepId, Serial } from '@dogu-private/types';
import { Instance, IsFilledString, IsHttpMethod, IsOptionalObject, IsUrlPath, IsUuidV4, Kindable, Method, OneOf, TransformByKind } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsNumber, IsObject, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

@OneOf()
export class Run extends Kindable<'Run'> {
  static override kind = 'Run';

  @IsFilledString()
  run!: string;
}

@OneOf()
export class Action extends Kindable<'Action'> {
  static override kind = 'Action';

  @IsFilledString()
  actionId!: string;

  @IsObject()
  inputs!: Record<string, unknown>;
}

@OneOf()
export class HttpProxyRequest extends Kindable<'HttpProxyRequest'> {
  static override kind = 'HttpProxyRequest';

  @IsHttpMethod()
  method!: Method;

  @IsUrlPath()
  path!: string;

  @IsOptionalObject()
  headers?: Record<string, string>;

  @IsOptionalObject()
  query?: object;

  @IsOptionalObject()
  body?: object;
}

@OneOf()
export class HttpProxyResponse extends Kindable<'HttpProxyResponse'> {
  static override kind = 'HttpProxyResponse';

  @IsNumber()
  statusCode!: number;

  @IsOptionalObject()
  headers?: object;

  @IsOptionalObject()
  body?: object;

  @ValidateNested()
  @Type(() => HttpProxyRequest)
  request!: HttpProxyRequest;
}

@OneOf()
export class BatchHttpProxyRequest extends Kindable<'BatchHttpProxyRequest'> {
  static override kind = 'BatchHttpProxyRequest';

  @IsBoolean()
  parallel!: boolean;

  @ValidateNested({ each: true })
  @Type(() => HttpProxyRequest)
  @IsArray()
  requests!: HttpProxyRequest[];
}

export class BatchHttpProxyResponseValue {
  @ValidateNested()
  @Type(() => HttpProxyResponse)
  @IsOptional()
  response?: HttpProxyResponse;

  @ValidateNested()
  @Type(() => ErrorResultDto)
  @IsOptional()
  error?: ErrorResultDto;
}

@OneOf()
export class BatchHttpProxyResponse extends Kindable<'BatchHttpProxyResponse'> {
  static override kind = 'BatchHttpProxyResponse';

  @ValidateNested({ each: true })
  @Type(() => BatchHttpProxyResponseValue)
  @IsArray()
  values!: BatchHttpProxyResponseValue[];
}

export type WebSocketProxyId = string;

@OneOf()
export class WebSocketProxyConnect extends Kindable<'WebSocketProxyConnect'> {
  static override kind = 'WebSocketProxyConnect';

  @IsUuidV4()
  webSocketProxyId!: WebSocketProxyId;

  @IsFilledString()
  path!: string;

  @IsOptionalObject()
  headers?: Record<string, string>;
}

@OneOf()
export class WebSocketProxySendClose extends Kindable<'WebSocketProxySendClose'> {
  static override kind = 'WebSocketProxySendClose';

  @IsUuidV4()
  webSocketProxyId!: WebSocketProxyId;

  @IsFilledString()
  reason!: string;
}

@OneOf()
export class WebSocketProxySendMessage extends Kindable<'WebSocketProxySendMessage'> {
  static override kind = 'WebSocketProxySendMessage';

  @IsUuidV4()
  webSocketProxyId!: WebSocketProxyId;

  @IsString()
  data!: string;
}

const WebSocketProxySendValue = [WebSocketProxySendClose, WebSocketProxySendMessage] as const;
export type WebSocketProxySendValue = Instance<(typeof WebSocketProxySendValue)[number]>;

@OneOf()
export class WebSocketProxySend extends Kindable<'WebSocketProxySend'> {
  static override kind = 'WebSocketProxySend';

  @ValidateNested()
  @TransformByKind(WebSocketProxySendValue)
  value!: WebSocketProxySendValue;
}

@OneOf()
export class WebSocketProxyReceiveOpen extends Kindable<'WebSocketProxyReceiveOpen'> {
  static override kind = 'WebSocketProxyReceiveOpen';
}

@OneOf()
export class WebSocketProxyReceiveClose extends Kindable<'WebSocketProxyReceiveClose'> {
  static override kind = 'WebSocketProxyReceiveClose';

  @IsNumber()
  code!: number;

  @IsString()
  reason!: string;
}

@OneOf()
export class WebSocketProxyReceiveMessage extends Kindable<'WebSocketProxyReceiveMessage'> {
  static override kind = 'WebSocketProxyReceiveMessage';

  @IsString()
  data!: string;
}

@OneOf()
export class WebSocketProxyReceiveError extends Kindable<'WebSocketProxyReceiveError'> {
  static override kind = 'WebSocketProxyReceiveError';

  @IsObject()
  error!: unknown;

  @IsString()
  message!: string;
}

const WebSocketProxyReceiveValue = [WebSocketProxyReceiveOpen, WebSocketProxyReceiveClose, WebSocketProxyReceiveMessage, WebSocketProxyReceiveError] as const;
export type WebSocketProxyReceiveValue = Instance<(typeof WebSocketProxyReceiveValue)[number]>;

@OneOf()
export class WebSocketProxyReceive extends Kindable<'WebSocketProxyReceive'> {
  static override kind = 'WebSocketProxyReceive';

  @ValidateNested()
  @TransformByKind(WebSocketProxyReceiveValue)
  value!: WebSocketProxyReceiveValue;
}

@OneOf()
export class ErrorResult extends Kindable<'ErrorResult'> {
  static override kind = 'ErrorResult';

  @ValidateNested()
  @Type(() => ErrorResultDto)
  value!: ErrorResultDto;
}

@OneOf()
export class UpdateAgentRequest extends Kindable<'UpdateAgentRequest'> {
  static override kind = 'UpdateAgentRequest';

  @IsFilledString()
  url!: string;

  @IsNumber()
  fileSize!: number;

  @IsFilledString()
  appname!: string;
}

@OneOf()
export class UpdateAgentResponse extends Kindable<'UpdateAgentResponse'> {
  static override kind = 'UpdateAgentResponse';

  @IsBoolean()
  success!: boolean;

  @IsOptional()
  @IsString()
  message?: string;
}

const RequestParamValue = [HttpProxyRequest, BatchHttpProxyRequest, UpdateAgentRequest] as const;
export type RequestParamValue = Instance<(typeof RequestParamValue)[number]>;

@OneOf()
export class RequestParam extends Kindable<'RequestParam'> {
  static override kind = 'RequestParam';

  @ValidateNested()
  @TransformByKind(RequestParamValue)
  value!: RequestParamValue;
}

const ResponseResultValue = [HttpProxyResponse, BatchHttpProxyResponse, UpdateAgentResponse] as const;
export type ResponseResultValue = Instance<(typeof ResponseResultValue)[number]>;

@OneOf()
export class ResponseResult extends Kindable<'ResponseResult'> {
  static override kind = 'ResponseResult';

  @ValidateNested()
  @TransformByKind(ResponseResultValue)
  value!: ResponseResultValue;
}

const RunStepValue = [Run, Action] as const;
export type RunStepValue = Instance<(typeof RunStepValue)[number]>;

@OneOf()
export class RunStep extends Kindable<'RunStep'> implements Pick<RoutineStep, 'routineStepId' | 'env'>, Pick<RoutineDeviceJob, 'routineDeviceJobId'> {
  static override kind = 'RunStep';

  @IsUUID()
  organizationId!: OrganizationId;

  @IsUUID()
  projectId!: ProjectId;

  @IsUUID()
  deviceId!: DeviceId;

  @IsNumber()
  routineDeviceJobId!: RoutineDeviceJobId;

  @IsNumber()
  routineStepId!: RoutineStepId;

  @IsNumber()
  stepIndex!: number;

  @IsObject()
  env!: Record<string, string>;

  @ValidateNested()
  @TransformByKind(RunStepValue)
  value!: RunStepValue;
}

@OneOf()
export class RunDeviceJob extends Kindable<'RunDeviceJob'> implements Pick<RoutineDeviceJob, 'routineDeviceJobId' | 'record'> {
  static override kind = 'RunDeviceJob';

  @IsNumber()
  routineDeviceJobId!: RoutineDeviceJobId;

  @IsIn([0, 1])
  record!: number;

  @IsFilledString()
  serial!: Serial;

  @ValidateNested({ each: true })
  @Type(() => RunStep)
  @IsArray()
  runSteps!: RunStep[];
}

@OneOf()
export class CancelDeviceJob extends Kindable<'CancelDeviceJob'> {
  static override kind = 'CancelDeviceJob';

  @IsNumber()
  routineDeviceJobId!: RoutineDeviceJobId;

  @IsIn([0, 1])
  record!: number;
}

const EventParamValue = [RunDeviceJob, CancelDeviceJob, WebSocketProxyConnect, WebSocketProxySend] as const;
export type EventParamValue = Instance<(typeof EventParamValue)[number]>;

@OneOf()
export class EventParam extends Kindable<'EventParam'> {
  static override kind = 'EventParam';

  @ValidateNested()
  @TransformByKind(EventParamValue)
  value!: EventParamValue;
}

@OneOf()
export class EventResult extends Kindable<'EventResult'> {
  static override kind = 'EventResult';
}

const ParamValue = [RequestParam, EventParam] as const;
export type ParamValue = Instance<(typeof ParamValue)[number]>;

export class Param {
  @IsUuidV4()
  resultId!: string;

  @ValidateNested()
  @TransformByKind(ParamValue)
  value!: ParamValue;
}

const ResultValue = [ResponseResult, EventResult, ErrorResult] as const;
export type ResultValue = Instance<(typeof ResultValue)[number]>;

export class Result {
  @ValidateNested()
  @TransformByKind(ResultValue)
  value!: ResultValue;
}
