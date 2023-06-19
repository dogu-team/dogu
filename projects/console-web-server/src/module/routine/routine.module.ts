import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Routine } from '../../db/entity/routine.entity';
import { FileModule } from '../file/file.module';
import { InitModule } from '../init/init.module';
import { PipelineModule } from './pipeline/pipeline.module';
import { RoutineController } from './routine.controller';
import { RoutineService } from './routine.service';

@Module({
  imports: [TypeOrmModule.forFeature([Routine]), InitModule, PipelineModule, FileModule],
  controllers: [RoutineController],
  providers: [RoutineService],
  exports: [RoutineService],
})
export class RoutineModule {}
