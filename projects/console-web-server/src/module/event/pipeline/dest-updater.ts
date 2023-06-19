import { DestPropCamel, RoutineStepPropCamel } from '@dogu-private/console';
import { DEST_STATE, PIPELINE_STATUS } from '@dogu-private/types';
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Dest } from '../../../db/entity/dest.entity';
import { DoguLogger } from '../../logger/logger';
import { DestRunner } from '../../routine/pipeline/processor/runner/dest-runner';

@Injectable()
export class DestUpdater {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource, //
    @Inject(DestRunner) private readonly destRunner: DestRunner,
    private readonly logger: DoguLogger,
  ) {}

  public async update(): Promise<void> {
    const functionsToCheck = [
      // pending dests
      this.checkPendingDestWithSkippedStep.bind(this), //
    ];
    for (const checkFunction of functionsToCheck) {
      try {
        await checkFunction.call(this);
      } catch (error) {
        this.logger.error(error);
      }
    }
  }

  private async checkPendingDestWithSkippedStep(): Promise<void> {
    const dests = await this.dataSource
      .getRepository(Dest) //
      .createQueryBuilder('dest')
      .innerJoinAndSelect(`dest.${DestPropCamel.routineStep}`, 'step', `step.${RoutineStepPropCamel.status} = :stepStatus`, { stepStatus: PIPELINE_STATUS.SKIPPED })
      .where(`dest.${DestPropCamel.state} = :state`, { state: DEST_STATE.PENDING })
      .getMany();

    if (dests.length === 0) {
      return;
    }

    for (const dest of dests) {
      await this.destRunner.setState(this.dataSource.manager, dest, DEST_STATE.SKIPPED, new Date(), null);
    }
  }
}
