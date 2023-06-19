import { FilledPrintable, PromiseOrValue, stringify } from '@dogu-tech/common';
import { LoggerFactory } from '@dogu-tech/node';
import { Runner } from './internal/runner';
import { DestOptions, fillDestOptions } from './options';

export interface DestContext {
  logger: FilledPrintable;
}

export class Dest {
  constructor(public options?: DestOptions) {}

  static withOptions(options?: DestOptions): Dest {
    return new Dest(options);
  }

  static describe(onDescribe: (context: DestContext) => PromiseOrValue<void>): void {
    return new Dest().describe(onDescribe);
  }

  describe(onDescribe: (context: DestContext) => PromiseOrValue<void>): void {
    const { options } = this;
    const filledOptions = fillDestOptions(options);
    const { logToFile } = filledOptions;
    const logger = LoggerFactory.create('dest', { level: 'info', withFileTransports: logToFile });
    (async (): Promise<void> => {
      await onDescribe({ logger });
      await new Runner().run(logger, filledOptions);
    })().catch((error) => {
      const casted = error instanceof Error ? error : new Error(stringify(error));
      logger.error('Dest internal error', { error: casted });
      process.exit(1);
    });
  }
}
