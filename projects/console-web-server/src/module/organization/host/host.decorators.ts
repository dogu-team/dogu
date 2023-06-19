import { HostId } from '@dogu-private/types';
import { ArgumentMetadata, Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Host } from '../../../db/entity/host.entity';

@Injectable()
export class IsHostExist implements PipeTransform<HostId, Promise<HostId>> {
  constructor(@InjectRepository(Host) private readonly hostRepository: Repository<Host>) {}

  async transform(value: HostId, metadata: ArgumentMetadata): Promise<HostId> {
    const exist = await this.hostRepository.exist({ where: { hostId: value } });
    if (!exist) {
      throw new NotFoundException({
        message: 'Host not found',
        hostId: value,
      });
    }
    return value;
  }
}
