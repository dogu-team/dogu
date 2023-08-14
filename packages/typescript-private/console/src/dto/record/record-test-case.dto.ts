import { DeviceId } from '@dogu-private/types';
import { PageDtoBase, RecordTestCaseBase } from '../../index';

export interface CreateRecordTestCaseDtoBase extends Pick<RecordTestCaseBase, 'name' | 'browserName' | 'packageName' | 'activeDeviceScreenSizeX' | 'activeDeviceScreenSizeY'> {
  name: string;
  browserName: string | null;
  packageName: string | null;
  deviceId: DeviceId;
  activeDeviceScreenSizeX: number;
  activeDeviceScreenSizeY: number;
}

export interface FindRecordTestCasesByProjectIdDtoBase extends PageDtoBase {
  keyword?: string;
}

export interface LoadRecordTestCaseDtoBase extends Pick<RecordTestCaseBase, 'activeDeviceScreenSizeX' | 'activeDeviceScreenSizeY'> {
  deviceId: DeviceId;
  activeDeviceScreenSizeX: number;
  activeDeviceScreenSizeY: number;
}

export interface UpdateRecordTestCaseDtoBase extends Pick<RecordTestCaseBase, 'name'> {
  name: string;
}

export type RecordTestCaseResponse = RecordTestCaseBase;

export interface NewSessionDtoBase {
  packageName?: string;
  browerName?: string;
  browserVersion?: string;
  deviceId: DeviceId;
}
