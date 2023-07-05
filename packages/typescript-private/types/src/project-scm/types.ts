export const PROJECT_SCM_TABLE_NAME = 'project_scm';

export type ProjectScmId = string;
export enum PROJECT_SCM_TYPE {
  UNSPECIFIED = 0,
  GITHUB = 1,
  GITLAB = 2,
  // SNV = 3,
}

export const DOGU_CONFIG_FILE_NAME = 'dogu.config.json';

export interface DoguScmConfig {
  scriptFolderPaths: string[];
}

export interface ProjectTestScript {
  name: string;
  path: string;
  type: string;
  size: number;
}
