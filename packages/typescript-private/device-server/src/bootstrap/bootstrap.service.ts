import { PromiseOrValue, stringify } from '@dogu-tech/common';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { logger } from '../logger/logger.instance';

const handlers = new Map<string, () => PromiseOrValue<void>>();

@Injectable()
export class BootstrapService implements OnApplicationBootstrap {
  async onApplicationBootstrap(): Promise<void> {
    try {
      await Promise.all([...handlers.values()].map((handler) => Promise.resolve(handler())));
    } catch (error) {
      const cause = error instanceof Error ? error : new Error(stringify(error));
      throw new Error(`Failed to bootstrap`, { cause });
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
