import { DefaultHttpOptions, FilledPrintable, Instance, Retry, setAxiosErrorFilterToIntercepter, transformAndValidate } from '@dogu-tech/common';
import { PublicAction } from '@dogu-tech/console-action';
import { createConsoleApiAuthHeader, OrganizationId, ProjectApplicationId, ProjectId } from '@dogu-tech/types';
import axios, { AxiosInstance } from 'axios';
import { ActionLogger } from './logger.instance';

export class ConsoleActionClient {
  private readonly instance: AxiosInstance;

  constructor(
    private readonly printable: FilledPrintable,
    DOGU_API_BASE_URL: string,
    private readonly DOGU_ORGANIZATION_ID: OrganizationId,
    private readonly DOGU_PROJECT_ID: ProjectId,
    private readonly DOGU_HOST_TOKEN: string,
  ) {
    this.instance = axios.create({
      baseURL: DOGU_API_BASE_URL,
      timeout: DefaultHttpOptions.request.timeout,
    });
    setAxiosErrorFilterToIntercepter(this.instance);
  }

  @Retry({ printable: ActionLogger })
  async getGitUrl(): Promise<Instance<typeof PublicAction.getGitUrl.responseBody>> {
    const pathProvider = new PublicAction.getGitUrl.pathProvider(this.DOGU_ORGANIZATION_ID, this.DOGU_PROJECT_ID);
    const path = PublicAction.getGitUrl.resolvePath(pathProvider);
    const { data } = await this.instance.get<Instance<typeof PublicAction.getGitUrl.responseBody>>(path, {
      ...createConsoleApiAuthHeader(this.DOGU_HOST_TOKEN),
      timeout: DefaultHttpOptions.request.timeout,
    });
    const validated = await transformAndValidate(PublicAction.getGitUrl.responseBody, data);
    return validated;
  }

  @Retry({ printable: ActionLogger })
  async getApplicationList(query: Instance<typeof PublicAction.getApplicationList.query>): Promise<Instance<typeof PublicAction.getApplicationList.responseBody>> {
    const pathProvider = new PublicAction.getApplicationList.pathProvider(this.DOGU_ORGANIZATION_ID, this.DOGU_PROJECT_ID);
    const path = PublicAction.getApplicationList.resolvePath(pathProvider);
    const { data } = await this.instance.get<Instance<typeof PublicAction.getApplicationList.responseBody>>(path, {
      params: query,
      ...createConsoleApiAuthHeader(this.DOGU_HOST_TOKEN),
      timeout: DefaultHttpOptions.request.timeout,
    });
    const validated = await transformAndValidate(PublicAction.getApplicationList.responseBody, data);
    return validated;
  }

  @Retry({ printable: ActionLogger })
  async getApplicationsWithUniquePackage(query: Instance<typeof PublicAction.getApplicationList.query>): Promise<Instance<typeof PublicAction.getApplicationList.responseBody>> {
    const pathProvider = new PublicAction.getApplicationsWithUniquePackage.pathProvider(this.DOGU_ORGANIZATION_ID, this.DOGU_PROJECT_ID);
    const path = PublicAction.getApplicationsWithUniquePackage.resolvePath(pathProvider);
    const { data } = await this.instance.get<Instance<typeof PublicAction.getApplicationList.responseBody>>(path, {
      params: query,
      ...createConsoleApiAuthHeader(this.DOGU_HOST_TOKEN),
      timeout: DefaultHttpOptions.request.timeout,
    });
    const validated = await transformAndValidate(PublicAction.getApplicationList.responseBody, data);
    return validated;
  }

  @Retry({ printable: ActionLogger })
  async getApplicationDownloadUrl(projectApplicationId: ProjectApplicationId): Promise<Instance<typeof PublicAction.getApplicationDownloadUrl.responseBody>> {
    const pathProvider = new PublicAction.getApplicationDownloadUrl.pathProvider(this.DOGU_ORGANIZATION_ID, this.DOGU_PROJECT_ID, projectApplicationId);
    const path = PublicAction.getApplicationDownloadUrl.resolvePath(pathProvider);
    const { data } = await this.instance.get<Instance<typeof PublicAction.getApplicationDownloadUrl.responseBody>>(path, {
      ...createConsoleApiAuthHeader(this.DOGU_HOST_TOKEN),
      timeout: DefaultHttpOptions.request.timeout,
    });
    const validated = await transformAndValidate(PublicAction.getApplicationDownloadUrl.responseBody, data);
    return validated;
  }
}
