import { Caseable, Instance, IsFilledString, TransformByCase } from '@dogu-tech/common';
import {
  DeviceServerToken,
  ErrorResultDto,
  Platform,
  ProtoRTCIceCandidateInit,
  ProtoRTCPeerDescription,
  ProtoRTCSdpType,
  ScreenCaptureOption,
  ScreenRecordOption,
  Serial,
  StartStreaming,
  StreamingAnswer,
  StreamingOffer,
  StreamingOption,
} from '@dogu-tech/types';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class ScreenCaptureOptionDto implements ScreenCaptureOption {
  @IsNumber()
  @IsOptional()
  bitRate?: number;

  @IsNumber()
  @IsOptional()
  maxFps?: number;

  @IsNumber()
  @IsOptional()
  frameRate?: number;

  @IsNumber()
  @IsOptional()
  frameInterval?: number;

  @IsNumber()
  @IsOptional()
  repeatFrameDelay?: number;

  @IsNumber()
  @IsOptional()
  maxResolution?: number;

  @IsNumber()
  @IsOptional()
  width?: number;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsNumber()
  @IsOptional()
  pid?: number;
}

export class RTCIceCandidateInit implements ProtoRTCIceCandidateInit {
  @IsString()
  @IsNotEmpty()
  candidate!: string;

  @IsNumber()
  @IsNotEmpty()
  sdpMlineIndex!: number;

  @IsString()
  sdpMid!: string;

  @IsString()
  @IsOptional()
  usernameFragment!: string;
}

export class RTCIceCandidateInitValue extends Caseable<'iceCandidate'> {
  static override $case = 'iceCandidate';

  @ValidateNested()
  @Type(() => RTCIceCandidateInit)
  iceCandidate!: RTCIceCandidateInit;
}

export class StreamingOptionDto implements StreamingOption {
  @ValidateNested()
  @Type(() => ScreenCaptureOptionDto)
  screen!: ScreenCaptureOptionDto;
}

export class RTCPeerDescription implements ProtoRTCPeerDescription {
  @IsString()
  @IsNotEmpty()
  sdpBase64!: string;

  @IsEnum(ProtoRTCSdpType)
  type!: ProtoRTCSdpType;
}

export class StartStreamingDto implements Required<StartStreaming> {
  @ValidateNested()
  @Type(() => RTCPeerDescription)
  peerDescription!: RTCPeerDescription;

  @ValidateNested()
  @Type(() => StreamingOptionDto)
  option!: StreamingOptionDto;

  @IsString()
  @IsNotEmpty()
  turnServerUrl!: string;

  @IsString()
  @IsNotEmpty()
  turnServerUsername!: string;

  @IsString()
  @IsNotEmpty()
  turnServerPassword!: string;

  @IsEnum(Platform)
  platform!: Platform;
}

export class StartStreamingValue extends Caseable<'startStreaming'> {
  static override $case = 'startStreaming';

  @ValidateNested()
  @Type(() => StartStreamingDto)
  startStreaming!: StartStreamingDto;
}

export const StreamingOfferValue = [RTCIceCandidateInitValue, StartStreamingValue] as const;
type _StreamingOfferValue = Instance<(typeof StreamingOfferValue)[number]>;
type StreamingOfferCases = Required<StreamingOffer>['value']['$case'];
export type StreamingOfferValue = StreamingOfferCases extends _StreamingOfferValue['$case'] ? _StreamingOfferValue : { ___ERROR___: 0 };

export class StreamingOfferDto implements StreamingOffer {
  @IsString()
  @IsNotEmpty()
  serial!: Serial;

  @ValidateNested()
  @TransformByCase(StreamingOfferValue)
  @IsNotEmpty()
  value!: StreamingOfferValue;
}

export class PeerDescriptionValue extends Caseable<'peerDescription'> {
  static override $case = 'peerDescription';

  @ValidateNested()
  @Type(() => RTCPeerDescription)
  peerDescription!: RTCPeerDescription;
}

export class IceCandidateValue extends Caseable<'iceCandidate'> {
  static override $case = 'iceCandidate';

  @ValidateNested()
  @Type(() => RTCIceCandidateInit)
  iceCandidate!: RTCIceCandidateInit;
}

export class ErrorResultValue extends Caseable<'errorResult'> {
  static override $case = 'errorResult';

  @ValidateNested()
  @Type(() => ErrorResultDto)
  errorResult!: ErrorResultDto;
}

export class DeviceServerTokenValue extends Caseable<'deviceServerToken'> {
  static override $case = 'deviceServerToken';

  @IsObject()
  deviceServerToken!: DeviceServerToken;
}

export const DeviceStreamingTypes = ['ANSWER', 'USER_INFO'] as const;
export type DeviceStreamingType = (typeof DeviceStreamingTypes)[number];

export const StreamingAnswerValue = [PeerDescriptionValue, IceCandidateValue, ErrorResultValue, DeviceServerTokenValue] as const;
type _StreamingAnswerValue = Instance<(typeof StreamingAnswerValue)[number]>;
type StreamingAnswerCases = Required<StreamingAnswer>['value']['$case'];
export type StreamingAnswerValue = StreamingAnswerCases extends _StreamingAnswerValue['$case'] ? _StreamingAnswerValue : { ___ERROR___: 0 };

export class StreamingAnswerDto implements StreamingAnswer {
  @ValidateNested()
  @TransformByCase(StreamingAnswerValue)
  @IsNotEmpty()
  value!: StreamingAnswerValue;
}

export class ScreenRecordOptionDto implements ScreenRecordOption {
  @ValidateNested()
  @Type(() => ScreenCaptureOptionDto)
  screen!: ScreenCaptureOptionDto;

  @IsFilledString()
  filePath!: string;

  @IsOptional()
  @IsNumber()
  pid?: number;
}
