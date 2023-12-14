import { LiveSessionPropSnake } from '@dogu-private/console';
import { LiveSessionState } from '@dogu-private/types';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import EventEmitter from 'events';
import _ from 'lodash';
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
      const liveSessionSnake = message.data;
      const liveSession: LiveSession = {
        liveSessionId: _.get(liveSessionSnake, LiveSessionPropSnake.live_session_id) as unknown as string,
        organizationId: _.get(liveSessionSnake, LiveSessionPropSnake.organization_id) as unknown as string,
        deviceId: _.get(liveSessionSnake, LiveSessionPropSnake.device_id) as unknown as string,
        state: _.get(liveSessionSnake, LiveSessionPropSnake.state) as unknown as LiveSessionState,
        closeWaitAt: _.get(liveSessionSnake, LiveSessionPropSnake.close_wait_at)
          ? new Date(_.get(liveSessionSnake, LiveSessionPropSnake.close_wait_at) as unknown as string)
          : null,
        closedAt: _.get(liveSessionSnake, LiveSessionPropSnake.closed_at) ? new Date(_.get(liveSessionSnake, LiveSessionPropSnake.closed_at) as unknown as string) : null,
        createdAt: new Date(_.get(liveSessionSnake, LiveSessionPropSnake.created_at) as unknown as string),
        updatedAt: new Date(_.get(liveSessionSnake, LiveSessionPropSnake.updated_at) as unknown as string),
        deletedAt: _.get(liveSessionSnake, LiveSessionPropSnake.deleted_at) ? new Date(_.get(liveSessionSnake, LiveSessionPropSnake.deleted_at) as unknown as string) : null,
      };
      this.emitter.emit('message', {
        ...message,
        data: liveSession,
      });
    });
  }
}
