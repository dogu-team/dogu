import { Status } from '@dogu-private/dost-children';
import { Instance } from '@dogu-tech/common';
import { Controller, Get } from '@nestjs/common';
import { StatusService } from './status.service';

@Controller(Status.controller)
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get(Status.getConnectionStatus.path)
  getConnectionStatus(): Instance<typeof Status.getConnectionStatus.responseBody> {
    return this.statusService.connectionStatus;
  }
}
