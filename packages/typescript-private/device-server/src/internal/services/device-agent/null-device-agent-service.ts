import { logger } from '../../../logger/logger.instance';
import { DeviceAgentService } from './device-agent-service';

export class NullDeviceAgentService implements DeviceAgentService {
  get screenUrl(): string {
    return '';
  }
  get inputUrl(): string {
    return '';
  }

  async install(): Promise<void> {
    logger.warn('NullDeviceAgentService.install');
    await Promise.resolve();
  }

  async connect(): Promise<void> {
    logger.warn('NullDeviceAgentService.connect');
    await Promise.resolve();
  }
}
