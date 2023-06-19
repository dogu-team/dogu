import { ErrorResult, PrivateProtocol, ProtoRTCPeerDescription, ScreenRecordOption, Serial, StreamingAnswer } from '@dogu-private/types';
import { PromiseOrValue } from '@dogu-tech/common';
import { StreamingOfferDto } from '@dogu-tech/device-client-common';
import { Observable } from 'rxjs';

type DeviceControl = PrivateProtocol.DeviceControl;
type DcGdcDeviceContext = PrivateProtocol.DcGdcDeviceContext;

export interface StreamingService {
  startStreaming(serial: Serial, offer: StreamingOfferDto): PromiseOrValue<ProtoRTCPeerDescription>;
  startStreamingWithTrickle(serial: Serial, offer: StreamingOfferDto): PromiseOrValue<Observable<StreamingAnswer>>;
  stopStreaming(serial: Serial): PromiseOrValue<void>;
  startRecord(serial: Serial, option: ScreenRecordOption): PromiseOrValue<ErrorResult>;
  stopRecord(serial: Serial): PromiseOrValue<ErrorResult>;
  deviceConnected(serial: Serial, context: DcGdcDeviceContext): PromiseOrValue<void>;
  deviceDisconnected(serial: Serial): PromiseOrValue<void>;
}
