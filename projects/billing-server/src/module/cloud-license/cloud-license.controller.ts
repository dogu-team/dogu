import { Controller, Inject } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CloudLicenseService } from './cloud-license.service';

@Controller('cloud-licenses')
export class CloudLicenseController {
  constructor(
    @Inject(CloudLicenseService)
    private readonly cloudLicenseService: CloudLicenseService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}
}
