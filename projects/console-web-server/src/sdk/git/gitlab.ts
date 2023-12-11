import { DoguConfig, DoguConfigKeys, RepositoryRawFile } from '@dogu-private/console';
import { Gitlab as Gitbeaker } from '@gitbeaker/node';

// import { OrganizationGitlab } from '../db/entity/organization-gitlab.entity';
export module Gitlab {
  export enum AccessLevel {
    Guest = 10,
    Reporter = 20,
    Developer = 30,
    Maintainer = 40,
    Owner = 50,
  }

  function createSession(url: string, token: string) {
    return new Gitbeaker({
      host: url,
      token,
    });
  }

  export async function findAllRepositories(url: string, token: string) {
    const gitlab = createSession(url, token);
    const rv = await gitlab.Projects.all({
      membership: true,
      owned: true,
      simple: true,
    });

    return rv;
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

  export async function getProjectFileMetaTree(url: string, token: string, projectName: string, path: string) {
    const api = createSession(url, token);
    const projectId = (await api.Projects.search(projectName))[0].id;
    const rv = await api.Repositories.tree(projectId, { path: path, recursive: true, ref: 'main' });
    return rv;
  }

  export async function readDoguConfigFile(url: string, token: string, projectName: string): Promise<DoguConfig> {
    const doguConfigFile = await Gitlab.getProjectFile(url, token, projectName, 'dogu.config.json');
    const doguConfigJson = JSON.parse(Buffer.from(doguConfigFile.content, 'base64').toString());
    const existKeys = Object.keys(DoguConfigKeys);

    for (const key of existKeys) {
      if (doguConfigJson[key] === undefined) {
        throw new Error(`dogu.config.json is not valid. ${key} is not defined.`);
      }
    }

    return doguConfigJson;
  }

  export async function getProjectFile(url: string, token: string, projectName: string, filePath: string): Promise<RepositoryRawFile> {
    const project = createSession(url, token);
    const test = await project.Projects.search(projectName);
    const data = await project.RepositoryFiles.show(test[0].id, filePath, 'main');

    return data;
  }
}
