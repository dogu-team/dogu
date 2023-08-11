import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChangeLog } from '../../db/entity/change-log.entity';
import { ChangeLogController } from './change-log.controller';
import { ChangeLogService } from './change-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChangeLog])],
  controllers: [ChangeLogController],
  providers: [ChangeLogService],
})
export class ChangeLogModule {}
