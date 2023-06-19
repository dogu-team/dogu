import { LoggerFactory } from '@dogu-tech/node';

export const logger = LoggerFactory.createLazy('main');
export const rendererLogger = LoggerFactory.createLazy('renderer');
