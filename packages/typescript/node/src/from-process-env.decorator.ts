import { Transform } from 'class-transformer';
import dotenv, { DotenvConfigOptions } from 'dotenv';
import lodash from 'lodash';

export function updateProcessEnv(options?: DotenvConfigOptions): void {
  dotenv.config(options);
}

export interface FromProcessEnvOptions {
  /**
   * @default (value) => value
   * @description Transform function.
   * The function to transform the value from the environment variable.
   */
  transform?: (value: string) => unknown;

  /**
   * @default process.env
   * @description Environment variables.
   */
  env?: Record<string, string | undefined>;
}

function defaultFromProcessEnvOptions(): Required<FromProcessEnvOptions> {
  return {
    transform: (value) => value,
    env: process.env,
  };
}

/**
 * @description Get value from process.env.
 * If the value is undefined, return the original value.
 */
export function FromProcessEnv<T extends Record<string, string | undefined>>(key: keyof T, options?: FromProcessEnvOptions): PropertyDecorator {
  return Transform(({ value }) => {
    const _options = lodash.merge(defaultFromProcessEnvOptions(), options);
    const { transform, env } = _options;
    const envValue = lodash.get(env, key) as string | undefined;
    if (envValue === undefined) {
      return value as unknown;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return transform(envValue);
  });
}
