import lodash from 'lodash';

export interface DestOptions {
  /**
   * @default 60000
   * @unit milliseconds
   */
  timeout?: number;

  /**
   * @default false
   */
  logToFile?: boolean;
}

export type FilledDestOptions = Required<DestOptions>;

export function defaultDestOptions(): FilledDestOptions {
  return {
    timeout: 60000,
    logToFile: false,
  };
}

export function fillDestOptions(options?: DestOptions): FilledDestOptions {
  return lodash.merge(defaultDestOptions(), options);
}
