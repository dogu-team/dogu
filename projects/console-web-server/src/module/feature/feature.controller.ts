import { FeatureTableBase } from '@dogu-private/console';
import { Controller, Get } from '@nestjs/common';
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
}
