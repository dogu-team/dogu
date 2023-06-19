import { FillOptionsValidationError, PrefixLevelConsoleLogger, stringify } from '@dogu-tech/common';
import { fork } from 'child_process';
import { GamiumClient } from 'gamium/common';
import { GameProfileReporterContext } from './context';
import { fillGameProfileReporterOptions, GameProfileReporterOptions } from './options';
import { GameProfileReporter, GameProfileReporterImpl, NullGameProfileReporter } from './reporter';
import path from 'path';

export class GameProfileReporterFactory {
  constructor(private readonly gamiumClient: GamiumClient, private readonly options?: GameProfileReporterOptions) {}

  create(): GameProfileReporter {
    const logger = new PrefixLevelConsoleLogger('[GameProfileReporter]', 'verbose');
    try {
      const filledOptions = fillGameProfileReporterOptions(this.options);
      logger.level = filledOptions.logLevel;
      return new GameProfileReporterImpl(this.gamiumClient, filledOptions, logger);
    } catch (error) {
      if (error instanceof FillOptionsValidationError) {
        const { validationErrors } = error;
        logger.info('Failed to load game profile reporter env. Using null game profile reporter.', { validationErrors: stringify(validationErrors) });
        return new NullGameProfileReporter();
      }
      throw error;
    }
  }
}

export class GameProfileReporterContextFactory {
  create(): GameProfileReporterContext {
    const mainScriptPath = path.resolve(__dirname, 'main.js');
    const child = fork(mainScriptPath, {
      stdio: 'inherit',
    });
    return new GameProfileReporterContext(child);
  }
}
