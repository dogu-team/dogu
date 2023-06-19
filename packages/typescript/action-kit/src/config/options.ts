import lodash from 'lodash';

export interface ConfigOptions {
  /**
   * @default process.cwd()
   */
  workingDir?: string;
}

export type FilledConfigOptions = Required<ConfigOptions>;

function defaultConfigOptions(): FilledConfigOptions {
  return {
    workingDir: process.cwd(),
  };
}

export function fillConfigOptions(options?: ConfigOptions): FilledConfigOptions {
  return lodash.merge(defaultConfigOptions(), options);
}
