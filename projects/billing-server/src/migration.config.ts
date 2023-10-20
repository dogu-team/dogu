import { stringify } from '@dogu-tech/common';
import { DataSource } from 'typeorm';
import { dataSourceConfig } from './config';
import { logger } from './module/logger/logger.instance';

const datasource = new DataSource(dataSourceConfig); // config is one that is defined in datasource.config.ts file
datasource
  .initialize()
  .then((value) => {
    logger.info(`typeorm options: ${stringify(value.options)}`);
  })
  .catch((e) => {
    logger.info(e);
    throw new Error(stringify(e));
  });
export default datasource;
