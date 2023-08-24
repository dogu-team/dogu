import { DeviceId, ProjectId } from '@dogu-private/types';
import { loop, stringify, transformAndValidate } from '@dogu-tech/common';
import { HostPaths } from '@dogu-tech/node';
import { Injectable } from '@nestjs/common';
import { IsUUID } from 'class-validator';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { DoguLogger } from '../logger/logger';

export class RoutineWorkspaceMeta {
  @IsUUID()
  projectId!: ProjectId;

  @IsUUID()
  deviceId!: DeviceId;
}

const MetaExtension = '.meta.json';

@Injectable()
export class RoutineWorkspace {
  constructor(private readonly logger: DoguLogger) {}

  async createRoutineWorkspacePath(rootWorkspacePath: string, meta: RoutineWorkspaceMeta): Promise<string> {
    for await (const name of await loop(1000, 30)) {
      const name = uuidv4().substring(0, 16);
      const routinesPath = HostPaths.routinesPath(rootWorkspacePath);
      const newRoutineWorkspacePath = path.resolve(routinesPath, name);
      if (fs.existsSync(newRoutineWorkspacePath)) {
        continue;
      }
      await fs.promises.mkdir(newRoutineWorkspacePath, { recursive: true });

      const metaPath = path.resolve(routinesPath, `${name}${MetaExtension}`);
      await fs.promises.writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf8');

      return newRoutineWorkspacePath;
    }
    throw new Error(`Failed to create routine workspace path. generating uuid directory failed ${stringify(meta)}`);
  }

  async findRoutineWorkspace(rootWorkspacePath: string, meta: RoutineWorkspaceMeta): Promise<string | null> {
    const routinesPath = HostPaths.routinesPath(rootWorkspacePath);
    try {
      const metaFiles = (await fs.promises.readdir(routinesPath)).filter((file) => file.endsWith(MetaExtension));
      for (const metaFile of metaFiles) {
        const metaFilePath = path.resolve(routinesPath, metaFile);
        const contents = await fs.promises.readFile(metaFilePath, 'utf8');
        const metaObject = await transformAndValidate(RoutineWorkspaceMeta, JSON.parse(contents));
        if (metaObject.projectId === meta.projectId && metaObject.deviceId === meta.deviceId) {
          const routineWorkspacePath = path.resolve(routinesPath, path.basename(metaFile, MetaExtension));
          if (!fs.existsSync(routineWorkspacePath)) {
            await fs.promises.mkdir(routineWorkspacePath, { recursive: true });
          }
          return routineWorkspacePath;
        }
      }
    } catch (e) {
      this.logger.info(`Failed to find routine workspace: `, { meta, e });
    }
    return null;
  }
}
