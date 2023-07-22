import { DeviceId, OrganizationId, PlatformType, ProjectId, RemoteDeviceJobId, Serial, WebDriverSessionId } from '@dogu-private/types';
import { RelayRequest } from '@dogu-tech/device-client-common';

export interface WebDriverEndpointHandlerResult {
  error?: undefined;
  organizationId: OrganizationId;
  projectId: ProjectId;
  remoteDeviceJobId: RemoteDeviceJobId;
  deviceId: DeviceId;
  devicePlatform: PlatformType;
  deviceSerial: Serial;
  // intervalTimeout?: number;
  browserName?: string;
  browserVersion?: string;
  applicationUrl?: string;
  applicationVersion?: string;
  applicationFileSize?: number;
  sessionId?: WebDriverSessionId;
  request: RelayRequest;
}
