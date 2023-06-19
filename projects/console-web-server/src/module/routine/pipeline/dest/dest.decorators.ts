import { DestId } from '@dogu-private/types';
import { ArgumentMetadata, Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dest } from '../../../../db/entity/dest.entity';

@Injectable()
export class IsDestExist implements PipeTransform<DestId, Promise<DestId>> {
  constructor(@InjectRepository(Dest) private readonly destRepository: Repository<Dest>) {}

  async transform(value: DestId, metadata: ArgumentMetadata): Promise<DestId> {
    const exist = await this.destRepository.exist({ where: { destId: value } });
    if (!exist) {
      throw new NotFoundException({
        message: 'Dest not found',
        destId: value,
      });
    }
    return value;
  }
}
