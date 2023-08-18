import { PrivateHostToken } from '@dogu-private/console-host-agent';
import { HostPayload } from '@dogu-private/types';
import { Instance } from '@dogu-tech/common';
import { Controller, Get, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Host as HostEntity } from '../../db/entity/host.entity';
import { HOST_ACTION_TYPE } from '../auth/auth.types';
import { Host, HostPermission } from '../auth/decorators';

@Controller(PrivateHostToken.controller.path)
export class PrivateHostTokenController {
  constructor(@InjectRepository(HostEntity) private readonly hostRepository: Repository<HostEntity>) {}

  @Get(PrivateHostToken.findHostByToken.path)
  @HostPermission(HOST_ACTION_TYPE.CREATE_HOST_API)
  async findHostByToken(@Host() host: HostPayload): Promise<Instance<typeof PrivateHostToken.findHostByToken.responseBody>> {
    const found = await this.hostRepository.findOne({ where: { hostId: host.hostId } });
    if (found === null) {
      throw new NotFoundException({
        message: 'Host not found',
        hostId: host.hostId,
      });
    }
    const response: Instance<typeof PrivateHostToken.findHostByToken.responseBody> = {
      hostId: found.hostId,
      organizationId: found.organizationId,
      platform: found.platform,
      architecture: found.architecture,
      rootWorkspace: found.rootWorkspace,
      deviceServerPort: found.deviceServerPort,
    };
    return response;
  }
}
