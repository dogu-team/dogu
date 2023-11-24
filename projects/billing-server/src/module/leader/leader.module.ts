import { Module } from '@nestjs/common';
import { LeaderMigrator } from './leader.migrator';

@Module({
  providers: [LeaderMigrator],
})
export class LeaderModule {}
