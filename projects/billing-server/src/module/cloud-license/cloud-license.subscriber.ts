import { transform } from '@dogu-tech/common';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import EventEmitter from 'events';
import { DataSource } from 'typeorm';
import { CloudLicense, CloudLicenseTableName } from '../../db/entity/cloud-license.entity';
import { Message, subscribe } from '../../db/utils';
import { DoguLogger } from '../logger/logger';

export type CloudLicenseEventEmitter = EventEmitter & {
  on(event: 'message', listener: (message: Message<CloudLicense>) => void): void;
};

@Injectable()
export class CloudLicenseSubscriber implements OnModuleInit {
  readonly emitter: CloudLicenseEventEmitter = new EventEmitter();

  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.subscribe();
  }

  async subscribe(): Promise<void> {
    await subscribe(this.logger, this.dataSource, CloudLicenseTableName, (message) => {
      const cloudLicense = transform(CloudLicense, message.data, {}, this.logger);
      this.emitter.emit('message', {
        ...message,
        data: cloudLicense,
      });
    });
  }
}
