import { FeatureTableBase } from '@dogu-private/console';
import { Injectable } from '@nestjs/common';
import { FEATURE_CONFIG } from '../../feature.config';

@Injectable()
export class FeatureService {
  getFeatureConfig(): FeatureTableBase {
    return FEATURE_CONFIG.getAll();
  }
}
