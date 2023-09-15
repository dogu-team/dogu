import { FeatureTableBase } from '@dogu-private/console';
import { Controller, Get } from '@nestjs/common';
import { FEATURE_CONFIG } from '../../feature.config';
import { EMAIL_VERIFICATION } from '../auth/auth.types';
import { EmailVerification } from '../auth/decorators';
import { FeatureService } from './feature.service';

@Controller('feature')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Get()
  @EmailVerification(EMAIL_VERIFICATION.VERIFIED)
  getFeatureConfig(): FeatureTableBase {
    return this.featureService.getFeatureConfig();
  }

  @Get('root-user')
  async existsRootUser(): Promise<boolean> {
    if (FEATURE_CONFIG.get('licenseModule') === 'self-hosted') {
      const exist = await this.featureService.existsRootUser();
      return exist;
    } else {
      return false;
    }
  }
}
