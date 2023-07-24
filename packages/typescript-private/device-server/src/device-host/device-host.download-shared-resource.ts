import { DefaultHttpOptions, DuplicatedCallGuarder, Instance, stringifyError } from '@dogu-tech/common';
import { DeviceHostDownloadSharedResource } from '@dogu-tech/device-client-common';
import { HostPaths, TaskQueue, TaskQueueListener, TaskQueueTask } from '@dogu-tech/node';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import stream, { Stream } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { OnUpdateEvent } from '../events';
import { DoguLogger } from '../logger/logger';

export type DeviceHostDownloadResult = Instance<typeof DeviceHostDownloadSharedResource.receiveMessage> & { message: string };
export type DeviceHostDownloadParam = Instance<typeof DeviceHostDownloadSharedResource.sendMessage>;

class DeviceHostDownloadTask extends TaskQueueTask<DeviceHostDownloadResult> {
  constructor(public readonly param: DeviceHostDownloadParam, task: () => Promise<DeviceHostDownloadResult>, listeners: TaskQueueListener<DeviceHostDownloadResult>[] = []) {
    super(task, listeners);
  }
}

type DeviceHostDownloadTaskQueue = TaskQueue<DeviceHostDownloadResult, DeviceHostDownloadTask>;
interface DeviceHostDownloadTaskRunningQueue {
  filePath: string;
  updateGuarder: DuplicatedCallGuarder;
  queue: DeviceHostDownloadTaskQueue;
}

@Injectable()
export class DeviceHostDownloadSharedResourceService {
  constructor(private readonly logger: DoguLogger) {}
  private dividerQueue: DeviceHostDownloadTaskQueue = new TaskQueue();
  private runningQueues: DeviceHostDownloadTaskRunningQueue[] = [];
  private onUpdateGuarder = new DuplicatedCallGuarder();

  public async queueDownload(message: DeviceHostDownloadParam): Promise<DeviceHostDownloadResult> {
    const task = new DeviceHostDownloadTask(message, async () => {
      return await this.download(message);
    });
    const result = await this.dividerQueue.scheduleAndWait(task);
    if (!result.success) {
      throw result.error;
    }
    return result.value;
  }

  @OnEvent(OnUpdateEvent.key)
  async onUpdate(value: Instance<typeof OnUpdateEvent.value>): Promise<void> {
    await this.onUpdateGuarder.guard(() => {
      const divideTask = () => {
        try {
          const task = this.dividerQueue.pop();
          if (!task) {
            return;
          }

          let targetRunningQueue = this.runningQueues.find((queue) => queue.filePath === task.param.filePath);
          if (!targetRunningQueue) {
            targetRunningQueue = {
              filePath: task.param.filePath,
              updateGuarder: new DuplicatedCallGuarder(),
              queue: new TaskQueue(),
            };
            this.runningQueues.push(targetRunningQueue);
          }
          targetRunningQueue.queue.schedule(task);
        } catch (error) {
          this.logger.error(`DeviceHostDownloadSharedResourceService.update error: ${stringifyError(error)}`);
        }
      };

      const cleanupEmptyQueues = () => {
        const emptyRunningQueues = this.runningQueues.filter((queue) => queue.queue.isEmpty());
        for (const emptyRunningQueue of emptyRunningQueues) {
          this.runningQueues.splice(this.runningQueues.indexOf(emptyRunningQueue), 1);
        }
      };
      divideTask();
      cleanupEmptyQueues();
    });

    for (const runningQueue of this.runningQueues) {
      runningQueue.updateGuarder
        .guard(async () => {
          try {
            await runningQueue.queue.consume();
          } catch (error) {
            this.logger.error(`DeviceHostDownloadSharedResourceService.update error: ${stringifyError(error)}`);
          }
        })
        .catch((error) => {
          this.logger.error(`DeviceHostDownloadSharedResourceService.update error: ${stringifyError(error)}`);
        });
    }
  }

  private async download(message: DeviceHostDownloadParam): Promise<DeviceHostDownloadResult> {
    const { filePath, url, expectedFileSize, headers } = message;
    const stat = await fs.promises.stat(filePath).catch(() => null);
    if (stat !== null) {
      if (stat.isFile()) {
        this.logger.info('File already exists', { filePath });
        this.logger.info(`File size local: ${stat.size} expected: ${expectedFileSize}`, { filePath });
        if (stat.size === expectedFileSize) {
          this.logger.info('File is same size. Skipping download', { filePath });
          return {
            responseCode: 200,
            responseHeaders: {},
            message: 'File already exists',
          };
        } else {
          this.logger.info('File is not same size. Deleting file', { filePath });
          await fs.promises.unlink(filePath);
          this.logger.info('File deleted', { filePath });
        }
      } else {
        this.logger.error('File is not a file', { filePath });
        throw new Error('File is not a file');
      }
    }

    this.logger.info('File is downloading', { filePath });
    const tempFileName = `${uuidv4()}.download`;
    const tempFilePath = path.resolve(HostPaths.tempPath, tempFileName);
    if (!fs.existsSync(HostPaths.tempPath)) {
      fs.mkdirSync(HostPaths.tempPath, { recursive: true });
    }
    const response = await axios.get(url, {
      responseType: 'stream',
      headers,
      timeout: DefaultHttpOptions.request.timeout,
    });
    if (!(response.data instanceof Stream)) {
      throw new Error('response.data is not stream');
    }
    const writer = fs.createWriteStream(tempFilePath);
    response.data.pipe(writer);
    try {
      await stream.promises.finished(writer);
    } catch (error) {
      writer.close();
      throw error;
    }
    const dirPath = path.dirname(filePath);
    await fs.promises.mkdir(dirPath, { recursive: true });
    await fs.promises.rename(tempFilePath, filePath);
    this.logger.info('File downloaded', { filePath });
    const responseHeaders = Reflect.ownKeys(response.headers).reduce((acc, key) => {
      const value = Reflect.get(response.headers, key);
      if (Array.isArray(value)) {
        Reflect.set(acc, key, value.join(','));
      } else {
        Reflect.set(acc, key, String(value));
      }
      return acc;
    }, {} as Record<string, string>);

    return {
      responseCode: response.status,
      responseHeaders,
      message: 'File downloaded',
    };
  }
}
