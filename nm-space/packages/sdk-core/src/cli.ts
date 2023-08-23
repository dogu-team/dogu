#!/usr/bin/env node

import { Runner } from './index.js';
import { createLogger } from './logger.js';
import { Terminator } from './terminator.js';

const logger = createLogger('cli');
const runner = new Runner();
const terminator = new Terminator();

terminator.once('terminate', () => {
  runner.stop();
});

process.on('unhandledRejection', (reason, promise) => {
  terminator.emit('terminate');
  logger.error('Unhandled rejection:', reason, promise);
  process.exit(1);
});

process.on('uncaughtException', (error, origin) => {
  terminator.emit('terminate');
  logger.error('Uncaught exception:', error, origin);
  process.exit(1);
});

process.on('exit', (code) => {
  terminator.emit('terminate');
  logger.info(`Exiting with code ${code}`);
});

const exitSignals = ['SIGINT', 'SIGQUIT', 'SIGABRT', 'SIGTERM'] as NodeJS.Signals[];
exitSignals.forEach((signal) => {
  process.on(signal, (signal) => {
    terminator.emit('terminate');
    logger.verbose(`Received ${signal}, exiting`);
    process.exit(0);
  });
});

await runner.run();
