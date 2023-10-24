import { PromiseOrValue, stringify } from '@dogu-tech/common';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DoguLogger } from '../logger/logger';
import { logger } from '../logger/logger.instance';

const handlers = new Map<string, () => PromiseOrValue<void>>();

@Injectable()
export class BootstrapService implements OnApplicationBootstrap {
  constructor(private readonly logger: DoguLogger) {}

  async onApplicationBootstrap(): Promise<void> {
    const results = await Promise.allSettled([...handlers.values()].map((handler) => Promise.resolve(handler())));
    const faileds = results.filter((result) => result.status === 'rejected') as PromiseRejectedResult[];
    faileds.forEach((failed) => this.logger.error('BootstrapService.onApplicationBootstrap', { reason: stringify(failed.reason) }));
    if (faileds.length > 0) {
      throw new Error(`BootstrapService.onApplicationBootstrap: ${faileds.length} bootstrap handler(s) failed.`);
    }
  }
}

export function registerBootstrapHandler(name: string, handler: () => PromiseOrValue<void>, condition: () => boolean = () => true): void {
  if (!condition()) {
    return;
  }

  if (handlers.has(name)) {
    logger.warn(`BootstrapService.register: ${name} is already registered. Overwriting...`);
  }
  handlers.set(name, handler);
}
