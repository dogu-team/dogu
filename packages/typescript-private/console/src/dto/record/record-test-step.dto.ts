import { PageDtoBase, RecordTestStepBase } from '../../index';

export interface CreateRecordTestStepDtoBase extends Pick<RecordTestStepBase, 'name'> {
  name: string;
}

export interface FindRecordTestStepsByProjectIdDtoBase extends PageDtoBase {
  keyword?: string;
}

export interface UpdateRecordTestStepDtoBase extends Pick<RecordTestStepBase, 'name'> {
  name: string;
}

export interface RecordTestStepResponse extends RecordTestStepBase {}
