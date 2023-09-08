import { Caseable, Instance, IsFilledString, TransformByCase } from '@dogu-tech/common';
import {
  ErrorResultDto,
  Platform,
  ProtoRTCIceCandidateInit,
  ProtoRTCPeerDescription,
  ProtoRTCSdpType,
  ScreenCaptureOption,
  ScreenRecordOption,
  Serial,
  StartStreaming,
  StreamingOffer,
  StreamingOption,
} from '@dogu-tech/types';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

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
export type StreamingOfferValue = Instance<(typeof StreamingOfferValue)[number]>;

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

export const DeviceStreamingTypes = ['ANSWER', 'USER_INFO'] as const;
export type DeviceStreamingType = (typeof DeviceStreamingTypes)[number];

export const StreamingAnswerValue = [PeerDescriptionValue, IceCandidateValue, ErrorResultValue] as const;
export type StreamingAnswerValue = Instance<(typeof StreamingAnswerValue)[number]>;

export class StreamingAnswerDto {
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
}
