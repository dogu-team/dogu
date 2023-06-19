import { stringify } from '@dogu-tech/common';
import { DataSource } from 'typeorm';
import { dataSourceConfig } from './config';
import { env } from './env';
import { logger } from './module/logger/logger.instance';

const datasource = new DataSource(dataSourceConfig); // config is one that is defined in datasource.config.ts file
datasource
  .initialize()
  .then((value) => {
    if (env.NODE_ENV === 'production' || env.DOGU_RUN_TYPE === 'production') {
      throw new Error('production mode is not supported.');
    }
    logger.info(`typeorm options: ${stringify(value.options)}`);
  })
  .catch((e) => {
    logger.info(e);
    throw new Error(e);
  });
export default datasource;
