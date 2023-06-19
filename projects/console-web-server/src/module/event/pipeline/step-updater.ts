import { RoutineDeviceJobPropSnake, RoutineStepPropCamel } from '@dogu-private/console';
import { PIPELINE_STATUS } from '@dogu-private/types';
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RoutineStep } from '../../../db/entity/step.entity';
import { DoguLogger } from '../../logger/logger';
// import { setStatus } from '../../routine/pipeline/common/runner';
import { StepRunner } from '../../routine/pipeline/processor/runner/step-runner';

@Injectable()
export class StepUpdater {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(StepRunner)
    private readonly stepRunner: StepRunner,
    private readonly logger: DoguLogger,
  ) {}

  public async update(): Promise<void> {
    const functionsToCheck = [this.checkWaitingSteps.bind(this)];
    for (const checkFunction of functionsToCheck) {
      try {
        await checkFunction.call(this);
      } catch (error) {
        this.logger.error(error);
      }
    }
  }

  private async checkWaitingSteps(): Promise<void> {
    const functionsToCheck = [this.checkWaitingStepsWithDeviceSkippedJob.bind(this)];

    for (const checkFunction of functionsToCheck) {
      try {
        await checkFunction.call(this);
      } catch (error) {
        this.logger.error(error);
      }
    }
  }

  private async checkWaitingStepsWithDeviceSkippedJob(): Promise<void> {
    const skippedSteps = await this.dataSource
      .getRepository(RoutineStep) //
      .createQueryBuilder('step')
      .innerJoinAndSelect(`step.${RoutineStepPropCamel.routineDeviceJob}`, 'deviceJob', `deviceJob.${RoutineDeviceJobPropSnake.status} = :status`, {
        status: PIPELINE_STATUS.SKIPPED,
      })
      .where({ status: PIPELINE_STATUS.WAITING })
      .getMany();

    for (const skippedStep of skippedSteps) {
      // await setStatus(this.dataSource.manager, skippedStep, PIPELINE_STATUS.SKIPPED);
      this.stepRunner.setStatus(this.dataSource.manager, skippedStep, PIPELINE_STATUS.SKIPPED, new Date(), null);
    }
  }
}
