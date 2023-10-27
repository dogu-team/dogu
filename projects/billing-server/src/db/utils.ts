import { errorify } from '@dogu-tech/common';
import _ from 'lodash';
import { DataSource, EntityManager } from 'typeorm';
import { DoguLogger } from '../module/logger/logger';

export interface SerializableTransactionOptions {
  /**
   * @description The number of times to retry the transaction when serialization failure occurs.
   * @default 3
   */
  retryCount?: number;

  /**
   * @description The interval between retries.
   * @default 300
   * @unit milliseconds
   */
  retryInterval?: number;
}

function defaultSerializableTransactionOptions(): Required<SerializableTransactionOptions> {
  return {
    retryCount: 3,
    retryInterval: 300,
  };
}

export async function retrySerialize<T>(
  logger: DoguLogger,
  dataSource: DataSource,
  fn: (manager: EntityManager) => Promise<T>,
  options?: SerializableTransactionOptions,
): Promise<T> {
  const { retryCount, retryInterval } = { ...defaultSerializableTransactionOptions(), ...options };
  for (let i = 0; i < retryCount; i++) {
    try {
      return dataSource.transaction('SERIALIZABLE', fn);
    } catch (error) {
      if (i < retryCount - 1) {
        const code = _.get(error, 'code') as string | undefined;

        /**
         * @see https://www.postgresql.org/docs/13/errcodes-appendix.html
         * @description
         *  40001 serialization_failure
         *  40P01 deadlock_detected
         */
        if (code === '40001' || code === '40P01') {
          logger.warn(`transaction serialization failure. retry after ${retryInterval}ms try(${i + 1}/${retryCount})`, { error: errorify(error) });
          await new Promise((resolve) => setTimeout(resolve, retryInterval));
        }
      } else {
        throw error;
      }
    }
  }

  throw new Error('Must not reach here');
}
