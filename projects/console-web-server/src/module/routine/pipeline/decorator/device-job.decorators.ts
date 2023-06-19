import { RoutineDeviceJobId } from '@dogu-private/types';
import { ArgumentMetadata, Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RoutineDeviceJob } from '../../../../db/entity/device-job.entity';

@Injectable()
export class IsDeviceJobExist implements PipeTransform<RoutineDeviceJobId, Promise<RoutineDeviceJobId>> {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async transform(value: RoutineDeviceJobId, metadata: ArgumentMetadata): Promise<RoutineDeviceJobId> {
    const exist = await this.dataSource.getRepository(RoutineDeviceJob).exist({ where: { routineDeviceJobId: value } });
    if (!exist) {
      throw new NotFoundException({
        message: 'DeviceJob not found',
        deviceJobId: value,
      });
    }
    return value;
  }
}
