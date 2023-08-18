import { PrivateHost } from '@dogu-private/console-host-agent';
import { Architecture, createConsoleApiAuthHeader, HostId, OrganizationId, Platform } from '@dogu-private/types';
import { DefaultHttpOptions, errorify, Instance, validateAndEmitEventAsync } from '@dogu-tech/common';
import { DeleteOldFilesCloser, HostPaths, MultiPlatformEnvironmentVariableReplacer, openDeleteOldFiles, processArchitecture, processPlatform } from '@dogu-tech/node';
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { isNotEmptyObject } from 'class-validator';
import fs from 'fs';
import path from 'path';
import { ConsoleClientService } from '../console-client/console-client.service';
import { DeviceClientService } from '../device-client/device-client.service';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';
import { OnHostConnectedEvent, OnHostResolvedEvent } from './host.events';

interface NeedUpdate {
  needUpdate: 'yes' | 'no';
}

interface NoNeedUpdate extends NeedUpdate {
  needUpdate: 'no';
}

interface RootWorkspaceYesNeedUpdate extends NeedUpdate {
  needUpdate: 'yes';
  rootWorkspacePath: string;
}

interface PlatformYesNeedUpdate extends NeedUpdate {
  needUpdate: 'yes';
  platform: Platform;
}

interface ArchitectureNeedUpdate extends NeedUpdate {
  architecture: Architecture;
}

interface DeviceServerPortYesNeedUpdate extends NeedUpdate {
  needUpdate: 'yes';
  deviceServerPort: number;
}

type RootWorkspaceNeedUpdate = RootWorkspaceYesNeedUpdate | NoNeedUpdate;
type PlatformNeedUpdate = PlatformYesNeedUpdate | NoNeedUpdate;
type DeviceServerPortNeedUpdate = DeviceServerPortYesNeedUpdate | NoNeedUpdate;

@Injectable()
export class HostResolver {
  private readonly envReplacer = new MultiPlatformEnvironmentVariableReplacer();
  private deleteOldRecordsCloser: DeleteOldFilesCloser | null = null;

  constructor(
    private readonly consoleClientService: ConsoleClientService,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: DoguLogger,
    private readonly deviceClientService: DeviceClientService,
  ) {}

  @OnEvent(OnHostConnectedEvent.key)
  async onHostConnected(value: Instance<typeof OnHostConnectedEvent.value>): Promise<void> {
    this.logger.verbose('Host connected', { value });
    const { organizationId, hostId, platform, architecture, rootWorkspace, deviceServerPort } = value;
    const receivedRootWorkspacePath = rootWorkspace;
    const platformNeedUpdate = this.validateAndUpdatePlatform(platform);
    const architectureNeedUpdate = this.validateAndUpdateArchitecture(architecture);
    const resolvedPlatform = platformNeedUpdate.needUpdate === 'yes' ? platformNeedUpdate.platform : platform;
    const { needUpdateResult: rootWorkspaceNeedUpdate, resolvedWorkspacePath } = await this.validateAndUpdateRootWorkspace(receivedRootWorkspacePath);
    const localDeviceServerPortNeedUpdate = this.validateAndUpdateDeviceServerPort(deviceServerPort);
    await this.updatePlatformAndRootWorkspaceAndDFPort(
      organizationId,
      hostId,
      platformNeedUpdate,
      architectureNeedUpdate,
      rootWorkspaceNeedUpdate,
      localDeviceServerPortNeedUpdate,
    );
    const hostWorkspacePath = await this.createHostWorkspace(organizationId, hostId, resolvedWorkspacePath);
    const recordWorkspacePath = HostPaths.recordWorkspacePath(resolvedWorkspacePath);
    await fs.promises.mkdir(recordWorkspacePath, { recursive: true });
    const pathMap = await this.deviceClientService.deviceHostClient.getPathMap();
    const hostResolutionInfo: Instance<typeof OnHostResolvedEvent.value> = {
      ...value,
      rootWorkspace: resolvedWorkspacePath,
      hostWorkspacePath,
      recordWorkspacePath,
      pathMap,
      platform: resolvedPlatform,
      architecture: architectureNeedUpdate.architecture,
    };
    this.logger.info('Host resolved', { hostResolutionInfo });
    await validateAndEmitEventAsync(this.eventEmitter, OnHostResolvedEvent, hostResolutionInfo);
    await this.openDeleteOldRecords(recordWorkspacePath);
  }

  private async openDeleteOldRecords(recordWorkspacePath: string): Promise<void> {
    if (this.deleteOldRecordsCloser) {
      this.deleteOldRecordsCloser.close();
      this.deleteOldRecordsCloser = null;
    }
    this.deleteOldRecordsCloser = await openDeleteOldFiles(recordWorkspacePath, '7d', '1d', this.logger);
  }

  private validateAndUpdatePlatform(platform: Platform): PlatformNeedUpdate {
    const currentPlatform = processPlatform();
    if (platform === currentPlatform) {
      return { needUpdate: 'no' };
    }
    return { needUpdate: 'yes', platform: currentPlatform };
  }

  private validateAndUpdateArchitecture(architecture: Architecture): ArchitectureNeedUpdate {
    const currentArchitecture = processArchitecture();
    if (architecture === currentArchitecture) {
      return { needUpdate: 'no', architecture: currentArchitecture };
    }
    return { needUpdate: 'yes', architecture: currentArchitecture };
  }
  private async validateAndUpdateRootWorkspace(receivedRootWorkspacePath: string): Promise<{ needUpdateResult: RootWorkspaceNeedUpdate; resolvedWorkspacePath: string }> {
    const defaultRootWorkspacePath = receivedRootWorkspacePath.length === 0 ? '$HOME/.dogu' : receivedRootWorkspacePath;
    this.logger.verbose('Default root workspace path', { defaultRootWorkspacePath });
    let replacedRootWorkspacePath = path.resolve(await this.envReplacer.replace(defaultRootWorkspacePath));
    this.logger.verbose('Replaced root workspace path', { replacedRootWorkspacePath });
    if (!(await this.makeAndValidateDirectory(replacedRootWorkspacePath))) {
      const fallbackRootWorkspacePath = path.resolve(await this.envReplacer.replace('$HOME/.dogu'));
      replacedRootWorkspacePath = fallbackRootWorkspacePath;
      this.logger.verbose('Replaced fallback root workspace path', { replacedRootWorkspacePath });
      if (!(await this.makeAndValidateDirectory(replacedRootWorkspacePath))) {
        throw new Error(`rootWorkspace is not accessable. resolved root workspace: ${replacedRootWorkspacePath}`);
      }
    }
    if (receivedRootWorkspacePath === replacedRootWorkspacePath) {
      return { needUpdateResult: { needUpdate: 'no' }, resolvedWorkspacePath: replacedRootWorkspacePath };
    }
    return { needUpdateResult: { needUpdate: 'yes', rootWorkspacePath: replacedRootWorkspacePath }, resolvedWorkspacePath: replacedRootWorkspacePath };
  }

  private validateAndUpdateDeviceServerPort(deviceServerPort: number): DeviceServerPortNeedUpdate {
    const url = env.DOGU_DEVICE_SERVER_HOST_PORT;
    const port = url.split(':').pop();
    const envDeviceServerPort = parseInt(port ?? '0');
    if (envDeviceServerPort === deviceServerPort) {
      return { needUpdate: 'no' };
    }
    return { needUpdate: 'yes', deviceServerPort: envDeviceServerPort };
  }

  private accessable(dirPath: string): Promise<boolean> {
    return fs.promises
      .access(dirPath, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK)
      .then(() => true)
      .catch(() => false);
  }

  private async makeAndValidateDirectory(dirPath: string): Promise<boolean> {
    try {
      if (fs.existsSync(dirPath)) {
        const stat = await fs.promises.stat(dirPath);
        if (!stat.isDirectory()) {
          await fs.promises.unlink(dirPath);
        }
      }
      if (!fs.existsSync(dirPath)) {
        await fs.promises.mkdir(dirPath, { recursive: true });
      }
      const stat = await fs.promises.stat(dirPath);
      if (!stat.isDirectory()) {
        return false;
      }
      return this.accessable(dirPath);
    } catch (error) {
      return false;
    }
  }

  private async updatePlatformAndRootWorkspaceAndDFPort(
    organizationId: OrganizationId,
    hostId: HostId,
    platformNeedUpdate: PlatformNeedUpdate,
    architectureNeedUpdate: ArchitectureNeedUpdate,
    rootWorkspaceNeedUpdate: RootWorkspaceNeedUpdate,
    localDeviceServerPortNeedUpdate: DeviceServerPortNeedUpdate,
  ): Promise<void> {
    const body: Instance<typeof PrivateHost.update.requestBody> = {};
    if (platformNeedUpdate.needUpdate === 'yes') {
      body.platform = platformNeedUpdate.platform;
    }
    if (architectureNeedUpdate.needUpdate === 'yes') {
      body.architecture = architectureNeedUpdate.architecture;
    }
    if (rootWorkspaceNeedUpdate.needUpdate === 'yes') {
      /**
       * TODO: henry - change column name to rootWorkspacePath
       */
      body.rootWorkspace = rootWorkspaceNeedUpdate.rootWorkspacePath;
    }
    if (localDeviceServerPortNeedUpdate.needUpdate === 'yes') {
      body.deviceServerPort = localDeviceServerPortNeedUpdate.deviceServerPort;
    }
    if (env.DOGU_AGENT_VERSION) {
      body.agentVersion = env.DOGU_AGENT_VERSION;
    }
    if (!isNotEmptyObject(body)) {
      return;
    }
    const pathProvider = new PrivateHost.update.pathProvider(organizationId, hostId);
    const path = PrivateHost.update.resolvePath(pathProvider);
    await this.consoleClientService.client
      .patch(path, body, {
        ...createConsoleApiAuthHeader(env.DOGU_HOST_TOKEN),
        timeout: DefaultHttpOptions.request.timeout,
      })
      .catch((error) => {
        this.logger.error('updatePlatformAndRootWorkspace', {
          organizationId,
          hostId,
          platformNeedUpdate,
          rootWorkspaceNeedUpdate,
          error: errorify(error),
        });
        throw error;
      });
  }

  private async createHostWorkspace(organizationId: OrganizationId, hostId: HostId, rootWorkspacePath: string): Promise<string> {
    const organizationWorkspacePath = HostPaths.organizationWorkspacePath(rootWorkspacePath, organizationId);
    await fs.promises.mkdir(organizationWorkspacePath, { recursive: true });
    const hostWorkspacePath = HostPaths.hostWorkspacePath(organizationWorkspacePath, hostId);
    if (!(await this.makeAndValidateDirectory(hostWorkspacePath))) {
      throw new Error(`hostWorkspace is not accessable. resolved host workspace: ${hostWorkspacePath}`);
    }
    await fs.promises.mkdir(HostPaths.hostSharesPath(hostWorkspacePath), { recursive: true });
    return hostWorkspacePath;
  }
}
