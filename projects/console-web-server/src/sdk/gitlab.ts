import {
  GitlabGroupCreatedData,
  GitlabProjectCreatedData,
  GitlabProjectId,
  GitlabUserCreatedData,
  MemberSchema,
  RepositoryFileData,
  RepositoryFileMeta,
  RepositoryFileMetaTree,
  RepositoryFileTree,
  RepositoryRawFile,
} from '@dogu-private/console';
import { UserId } from '@dogu-private/types';
import { Gitlab as Gitbeaker } from '@gitbeaker/node';
import AdmZip from 'adm-zip';
import { config } from '../config';
import { OrganizationGitlab } from '../db/entity/organization-gitlab.entity';
import { ProjectGitlab } from '../db/entity/project-gitlab.entity';
import { UserGitlab } from '../db/entity/user-gitlab.entity';
import { FeatureConfig } from '../feature.config';

export module Gitlab {
  export enum AccessLevel {
    Guest = 10,
    Reporter = 20,
    Developer = 30,
    Maintainer = 40,
    Owner = 50,
  }

  const root = new Gitbeaker({
    host: config.gitlab.url,
    token: config.gitlab.rootToken,
  });

  function createSession(token: string) {
    return new Gitbeaker({
      host: config.gitlab.url,
      token,
    });
  }

  export async function createUser(userId: UserId, name: string, email: string, password: string | null): Promise<GitlabUserCreatedData> {
    const user = await root.Users.create({
      name: name,
      email: email,
      username: userId,
      password: password,
      reset_password: password === null,
      force_random_password: password === null,
      skip_confirmation: true,
    });

    const { token } = await root.UserImpersonationTokens.add(user.id, 'impersonation_token', 'api', '2100-1-1');

    return { userId: user.id, impersonationToken: token as string };
  }

  export async function createGroup(userGitlab: UserGitlab, organizationId: string): Promise<GitlabGroupCreatedData> {
    const { id } = await root.Groups.create(organizationId, organizationId, {
      visibility: 'private',
    });

    const { body } = await root.Groups.requester.post(`groups/${id}/access_tokens`, {
      body: {
        name: 'group_access_token',
        scopes: ['api', 'read_api', 'read_repository', 'write_repository'],
        access_level: AccessLevel.Owner,
      },
    });
    const groupToken = body['token'];
    const group = createSession(groupToken);
    await group.GroupMembers.add(id, userGitlab.gitlabUserId, AccessLevel.Maintainer);

    return { groupId: id, groupToken: groupToken };
  }

  export async function updateGroup(organizationGitlab: OrganizationGitlab, organizationName: string) {
    const group = createSession(organizationGitlab.gitlabGroupToken);
    await group.Groups.edit(organizationGitlab.gitlabGroupId, {
      name: organizationName,
    });
  }

  export async function deleteGroup(organizationGitlab: OrganizationGitlab) {
    await root.Groups.remove(organizationGitlab.gitlabGroupId);
  }

  export async function addUserToGroup(userGitlab: UserGitlab, organizationGitlab: OrganizationGitlab, accessLevel: AccessLevel) {
    const group = createSession(organizationGitlab.gitlabGroupToken);
    await group.GroupMembers.add(organizationGitlab.gitlabGroupId, userGitlab.gitlabUserId, accessLevel);
  }

  export async function updateUserGroupRole(userGitlab: UserGitlab, organizationGitlab: OrganizationGitlab, accessLevel: AccessLevel) {
    const group = createSession(organizationGitlab.gitlabGroupToken);
    await group.GroupMembers.edit(organizationGitlab.gitlabGroupId, userGitlab.gitlabUserId, accessLevel);
  }

  export async function removeUserFromGroup(userGitlab: UserGitlab, organizationGitlab: OrganizationGitlab) {
    const group = createSession(organizationGitlab.gitlabGroupToken);
    await group.GroupMembers.remove(organizationGitlab.gitlabGroupId, userGitlab.gitlabUserId);
  }

  export async function createProject(
    organizationGitlab: OrganizationGitlab,
    projectId: string,
    projectName: string,
    projectDescription: string,
    option: { language: string },
  ): Promise<GitlabProjectCreatedData> {
    const group = createSession(organizationGitlab.gitlabGroupToken);

    let repoUrl = '';
    switch (option.language) {
      case 'typescript':
        repoUrl = `${config.gitlab.templeteGroupUrl}/typescript-template.git`;
        break;
      default:
        break;
    }

    const project = await group.Projects.create({
      path: projectId,
      namespace_id: organizationGitlab.gitlabGroupId,
      import_url: FeatureConfig.get('useSampleProject') ? repoUrl : null,
      description: projectDescription,
    });

    const { body } = await root.Projects.requester.post(`projects/${project.id}/access_tokens`, {
      body: {
        name: 'project_access_token',
        scopes: ['api', 'read_api', 'read_repository', 'write_repository'],
        access_level: AccessLevel.Owner,
      },
    });

    return {
      projectId: project.id,
      projectToken: body.token,
    };
  }

  export async function updateProject(organizationGitlab: OrganizationGitlab, projectId: GitlabProjectId, projectName: string, description: string) {
    const group = createSession(organizationGitlab.gitlabGroupToken);
    await group.Projects.edit(projectId, {
      name: projectName,
      description: description,
    });
  }

  export async function deleteProject(organizationGitlab: OrganizationGitlab, projectGitlab: ProjectGitlab) {
    const group = createSession(organizationGitlab.gitlabGroupToken);
    await group.Projects.remove(projectGitlab.gitlabProjectId);
  }

  export async function addUserToProject(userGitlab: UserGitlab, projectGitlab: ProjectGitlab, accessLevel: AccessLevel) {
    const project = createSession(projectGitlab.gitlabProjectToken);
    await project.ProjectMembers.add(projectGitlab.gitlabProjectId, userGitlab.gitlabUserId, accessLevel);
  }

  export async function removeUserFromProject(userGitlab: UserGitlab, projectGitlab: ProjectGitlab) {
    const project = createSession(projectGitlab.gitlabProjectToken);
    await project.ProjectMembers.remove(projectGitlab.gitlabProjectId, userGitlab.gitlabUserId);
  }

  export async function updateUserProjectRole(userGitlab: UserGitlab, projectGitlab: ProjectGitlab, accessLevel: AccessLevel) {
    const project = createSession(projectGitlab.gitlabProjectToken);
    await project.ProjectMembers.edit(projectGitlab.gitlabProjectId, userGitlab.gitlabUserId, accessLevel);
  }

  export async function getProjectId(organizationGitlab: OrganizationGitlab, projectName: string): Promise<number> {
    const group = createSession(organizationGitlab.gitlabGroupToken);

    const [project] = await group.Projects.search(projectName);
    return project.id;
  }

  export async function getProjectFileTree(projectGitlab: ProjectGitlab): Promise<RepositoryFileTree> {
    const getDataAsync = (entry: AdmZip.IZipEntry) => {
      return new Promise<Buffer>((resolve, reject) => {
        entry.getDataAsync((data, err) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    };

    const project = createSession(projectGitlab.gitlabProjectToken);

    const { body } = await project.Repositories.requester.get(`projects/${projectGitlab.gitlabProjectId}/repository/archive.zip`);
    const zip = new AdmZip(body);
    const zipEntries = zip.getEntries();

    const tree: RepositoryFileTree = [];
    for (const zipEntry of zipEntries) {
      let treeSchema: RepositoryFileData;
      if (zipEntry.isDirectory) {
        const [name] = zipEntry.entryName.split('/').slice(-2);
        const path = zipEntry.entryName.split('/').slice(1).join('/').slice(0, -1);

        treeSchema = {
          id: '',
          name: name,
          type: 'tree',
          path: path,
          data: '',
          mode: '',
        };
      } else {
        const path = zipEntry.entryName.split('/').slice(1).join('/');
        const data = await getDataAsync(zipEntry);

        treeSchema = {
          id: '',
          name: zipEntry.name,
          type: 'blob',
          path: path,
          data: data.toString(),
          mode: '',
        };
      }

      tree.push(treeSchema);
    }

    return tree;
  }

  function getLastPage(headerLink: string): number {
    /**
     * example - '<https://gitlab.dev.dogutech.io/api/v4/projects/24/repository/tree?id=24&page=1&pagination=keyset&path=test&per_page=100&recursive=true>; rel="first", <https://gitlab.dev.dogutech.io/api/v4/projects/24/repository/tree?id=24&page=1&pagination=keyset&path=test&per_page=100&recursive=true>; rel="last"';
     */
    const links = headerLink
      .split(',')
      .map((link) => {
        const parts = link.split(';');
        const urlMatch = parts[0].match(/<(.+)>/);
        const relMatch = parts[1].match(/rel="(.+)"/);

        if (urlMatch && relMatch) {
          return {
            url: urlMatch[1],
            rel: relMatch[1],
          };
        }

        return null;
      })
      .filter((link) => link !== null);

    for (const link of links) {
      if (!link) {
        continue;
      }

      if (link.rel === 'last') {
        const pageMatch = link.url[0].match(/page=(\d+)/);

        if (pageMatch) {
          return parseInt(pageMatch[1]);
        }
      }
    }

    return 0;
  }

  export async function getProjectFileMetaTree(path: string, projectGitlab: ProjectGitlab): Promise<RepositoryFileMetaTree> {
    const project = createSession(projectGitlab.gitlabProjectToken);
    const metaTreePages: RepositoryFileMetaTree = [];

    const perPage: number = 100;
    const { body, headers } = await project.Repositories.requester.get(
      `projects/${projectGitlab.gitlabProjectId}/repository/tree?path=${path}&pagination=keyset&per_page=${perPage}&recursive=true`,
    );
    const lastPage = getLastPage(headers.link);

    const requestAll: Promise<{ body: RepositoryFileMeta }>[] = [];
    for (let page = 2; page <= lastPage; page++) {
      requestAll.push(
        project.Repositories.requester.get(
          `projects/${projectGitlab.gitlabProjectId}/repository/tree?path=${path}&page=${page}&pagination=keyset&per_page=${perPage}&recursive=true`,
        ),
      );
    }
    const results = await Promise.all(requestAll);

    const rootPathName = path.split('/').slice(-1)[0];
    const root: RepositoryFileMeta = {
      id: 'root',
      mode: '040000',
      name: rootPathName,
      path: path,
      type: 'tree',
    };
    metaTreePages.push(root);
    metaTreePages.push(body);
    for (const result of results) {
      metaTreePages.push(result.body);
    }

    const metaTree = metaTreePages.flat();
    return metaTree;
  }

  export async function getProjectFile(filePath: string, projectGitlab: ProjectGitlab): Promise<RepositoryRawFile> {
    const project = createSession(projectGitlab.gitlabProjectToken);
    const data = await project.RepositoryFiles.show(projectGitlab.gitlabProjectId, filePath, 'main');

    return data;
  }

  export async function getUserFromProject(userGitlab: UserGitlab, projectGitlab: ProjectGitlab): Promise<MemberSchema | null> {
    const project = createSession(projectGitlab.gitlabProjectToken);

    try {
      const user = await project.ProjectMembers.show(projectGitlab.gitlabProjectId, userGitlab.gitlabUserId);
      return user;
    } catch (e) {
      return null;
    }
  }
}
