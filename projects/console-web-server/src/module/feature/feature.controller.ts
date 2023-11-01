import { Controller, Get } from '@nestjs/common';
import { FeatureConfig, FeatureTable } from '../../feature.config';
import { EMAIL_VERIFICATION } from '../auth/auth.types';
import { EmailVerification } from '../auth/decorators';
import { FeatureService } from './feature.service';

@Controller('feature')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Get()
  @EmailVerification(EMAIL_VERIFICATION.VERIFIED)
  getFeatureConfig(): FeatureTable {
    return this.featureService.getFeatureConfig();
  }

  @Get('root-user')
  async existsRootUser(): Promise<boolean> {
    if (FeatureConfig.get('licenseModule') === 'self-hosted') {
      const exist = await this.featureService.existsRootUser();
      return exist;
    } else {
      return false;
    }
  }
}
