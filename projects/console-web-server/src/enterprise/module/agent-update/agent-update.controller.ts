import { Controller, Post } from '@nestjs/common';
import { AgentUpdateService } from './agent-update.service';

@Controller('/agent-update')
export class AgentUpdateController {
  constructor(private readonly service: AgentUpdateService) {}

  @Post('/test')
  async test(): Promise<void> {}
}
