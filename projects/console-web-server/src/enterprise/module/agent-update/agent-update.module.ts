import { Module } from '@nestjs/common';
import { AgentUpdateController } from './agent-update.controller';
import { AgentUpdateService } from './agent-update.service';

@Module({
  imports: [],
  controllers: [AgentUpdateController],
  providers: [AgentUpdateService],
  exports: [AgentUpdateService],
})
export class AgentUpdateModule {}
