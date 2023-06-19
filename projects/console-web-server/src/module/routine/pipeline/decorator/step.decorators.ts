import { RoutineStepId } from '@dogu-private/types';
import { ArgumentMetadata, Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RoutineStep } from '../../../../db/entity/step.entity';

@Injectable()
export class IsStepExist implements PipeTransform<RoutineStepId, Promise<RoutineStepId>> {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async transform(value: RoutineStepId, metadata: ArgumentMetadata): Promise<RoutineStepId> {
    const exist = await this.dataSource.getRepository(RoutineStep).exist({ where: { routineStepId: value } });
    if (!exist) {
      throw new NotFoundException({
        message: 'Step not found',
        stepId: value,
      });
    }
    return value;
  }
}
