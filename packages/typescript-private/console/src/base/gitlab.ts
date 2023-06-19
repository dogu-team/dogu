enum AccessLevel {
  Guest = 10,
  Reporter = 20,
  Developer = 30,
  Maintainer = 40,
  Owner = 50,
}

export type GitlabProjectId = number;
export type GitlabProjectToken = string;
export type GitlabGroupId = number;
export type GitlabGroupToken = string;
export type GitlabUserId = number;
export type GitlabUserToken = string;

export interface GitlabUserCreatedData {
  userId: number;
  impersonationToken: string;
}
export interface GitlabGroupCreatedData {
  groupId: number;
  groupToken: string;
}
export interface GitlabProjectCreatedData {
  projectId: number;
  projectToken: string;
}

export interface RepositoryFileMeta {
  id: string;
  name: string;
  type: 'tree' | 'blob';
  path: string;
  mode: string;
}
export interface RepositoryFileData extends RepositoryFileMeta {
  data: string;
}

export type RepositoryFileMetaTree = RepositoryFileMeta[];
export type RepositoryFileTree = RepositoryFileData[];
export type RepositoryRawFile = {
  file_name: string;
  file_path: string;
  size: number;
  encoding: string;
  content: string;
  content_sha256: string;
  ref: string;
  blob_id: string;
  commit_id: string;
  last_commit_id: string;
};

export interface MemberSchema {
  id: number;
  username: string;
  name: string;
  state: string;
  avatar_url: string;
  web_url: string;
  expires_at: string;
  access_level: AccessLevel;
  email: string;
  group_saml_identity: {
    extern_uid: string;
    provider: string;
    saml_provider_id: number;
  };
}
