import { transform } from '@dogu-tech/common';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import EventEmitter from 'events';
import { DataSource } from 'typeorm';
import { LiveSession, LIVE_SESSION_TABLE_NAME } from '../../db/entity/live-session.entity';
import { Message, subscribe } from '../../db/utils';
import { DoguLogger } from '../logger/logger';

export type LiveSessionEventEmitter = EventEmitter & {
  on(event: 'message', listener: (message: Message<LiveSession>) => void): void;
};

@Injectable()
export class LiveSessionSubscriber implements OnModuleInit {
  readonly emitter: LiveSessionEventEmitter = new EventEmitter();

  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit(): Promise<void> {
    await subscribe(this.logger, this.dataSource, LIVE_SESSION_TABLE_NAME, (message) => {
      const liveSession = transform(LiveSession, message.data, {}, this.logger);
      this.emitter.emit('message', {
        ...message,
        data: liveSession,
      });
    });
  }
}
