export interface CreateJobDto {
  pipelineId: string;
  name: string;
  description?: string;
}

export enum JobDisplayQuery {
  TREE = 'tree',
  LIST = 'list',
}
