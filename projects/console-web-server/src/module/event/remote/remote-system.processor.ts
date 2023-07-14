import { Inject, Injectable } from '@nestjs/common';
import { DoguLogger } from '../../logger/logger';
import { RemoteDeviceJobUpdater } from './remote-device-job-updater';

@Injectable()
export class RemoteSystemProcessor {
  constructor(
    @Inject(RemoteDeviceJobUpdater) private readonly remoteDeviceJobUpdater: RemoteDeviceJobUpdater, //
    private readonly logger: DoguLogger,
  ) {}

  public async update(): Promise<void> {
    await this.remoteDeviceJobUpdater.update();
  }
}
