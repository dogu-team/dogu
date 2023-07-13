import { DuplicatedCallGuarder, errorify } from '@dogu-tech/common';
import { Inject, Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { config } from '../../config';
import { DoguLogger } from '../logger/logger';
import { HeartBeatSystemProcessor } from './heartbeat/heartbeat-system.processor';
import { PipelineSystemProcessor } from './pipeline/pipeline-system.processor';
import { RemoteSystemProcessor } from './remote/remote-system.processor';

@Injectable()
export class UpdateConsumer {
  private readonly duplicatedHeartBeatCallGuarder = new DuplicatedCallGuarder();
  private readonly duplicatedPipelineCallGuarder = new DuplicatedCallGuarder();
  private readonly duplicatedRemoteCallGuarder = new DuplicatedCallGuarder();

  constructor(
    @Inject(PipelineSystemProcessor)
    private readonly pipelineSystemProcessor: PipelineSystemProcessor,
    @Inject(HeartBeatSystemProcessor)
    private readonly heartBeatSystemProcessor: HeartBeatSystemProcessor,
    @Inject(RemoteSystemProcessor)
    private readonly remoteSystemProcessor: RemoteSystemProcessor,
    private readonly logger: DoguLogger,
  ) {}

  @Interval(config.event.updateConnection.pop.intervalMilliseconds)
  async onUpdate(): Promise<void> {
    try {
      const heartBeatStartTime = Date.now();
      await this.duplicatedHeartBeatCallGuarder.guard(() => this.heartBeatSystemProcessor.update());
      const heartBeatEndTime = Date.now();
      if (heartBeatEndTime - heartBeatStartTime > 1000) {
        this.logger.error('heart beat update took too long', { duration: heartBeatEndTime - heartBeatStartTime });
      }

      const pipelineStartTime = Date.now();
      await this.duplicatedPipelineCallGuarder.guard(this.pipelineSystemProcessor.update.bind(this.pipelineSystemProcessor));
      const pipelineEndTime = Date.now();
      if (pipelineEndTime - pipelineStartTime > 1000) {
        this.logger.error('pipeline update took too long', { duration: pipelineEndTime - pipelineStartTime });
      }

      const remoteStartTime = Date.now();
      await this.duplicatedRemoteCallGuarder.guard(this.remoteSystemProcessor.update.bind(this.remoteSystemProcessor));
      const remoteEndTime = Date.now();
      if (remoteEndTime - remoteStartTime > 1000) {
        this.logger.error('remote update took too long', { duration: remoteEndTime - remoteStartTime });
      }
    } catch (error) {
      this.logger.error('comsumer update failed', { error: errorify(error) });
    }
  }
}
