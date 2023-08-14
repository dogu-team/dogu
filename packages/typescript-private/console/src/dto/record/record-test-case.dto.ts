import { DeviceId } from '@dogu-private/types';
import { PageDtoBase, RecordTestCaseBase } from '../../index';

export interface CreateRecordTestCaseDtoBase extends Pick<RecordTestCaseBase, 'name' | 'browserName' | 'packageName'> {}
export interface NewSessionRecordTestCaseDtoBase {
  deviceId: DeviceId;
}

export interface FindRecordTestCasesByProjectIdDtoBase extends PageDtoBase {
  keyword?: string;
}

export interface UpdateRecordTestCaseDtoBase extends Pick<RecordTestCaseBase, 'name'> {
  name: string;
}

export type RecordTestCaseResponse = RecordTestCaseBase;
