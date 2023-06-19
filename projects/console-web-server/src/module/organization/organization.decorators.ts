import { OrganizationId } from '@dogu-private/types';
import { ArgumentMetadata, Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../../db/entity/organization.entity';

@Injectable()
export class IsOrganizationExist implements PipeTransform<OrganizationId, Promise<OrganizationId>> {
  constructor(@InjectRepository(Organization) private readonly organizationRepository: Repository<Organization>) {}

  async transform(value: OrganizationId, metadata: ArgumentMetadata): Promise<OrganizationId> {
    const exist = await this.organizationRepository.exist({ where: { organizationId: value } });
    if (!exist) {
      throw new NotFoundException({
        message: 'Organization not found',
        organizationId: value,
      });
    }
    return value;
  }
}
