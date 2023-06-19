import { ConsoleLogger, PrefixLogger, Printable } from '@dogu-tech/common';
import { ClassConstructor, ClassTransformOptions, plainToInstance } from 'class-transformer';
import { validate, validateSync, ValidationError, ValidatorOptions } from 'class-validator';
import dotenv from 'dotenv';
import fs from 'fs';
import lodash from 'lodash';
import path from 'path';

export class EnvValidationError extends Error {
  constructor(readonly errors: ValidationError[]) {
    super('env validation failed');
  }
}

export function isEnvValidationError(error: unknown): error is EnvValidationError {
  return error instanceof EnvValidationError;
}

export interface EnvLoaderOptions {
  dotEnvConfigOptions?: dotenv.DotenvConfigOptions;
  classTransformOptions?: ClassTransformOptions;
  validatorOptions?: ValidatorOptions;

  /**
   * @defaunt ConsoleLogger.instance
   */
  printable?: Printable;

  /**
   * @default process.cwd()
   */
  workingDir?: string;
}

type FilledEnvLoaderOptions = Required<EnvLoaderOptions>;

function defaultEnvLoaderOptions(): FilledEnvLoaderOptions {
  return {
    dotEnvConfigOptions: {},
    classTransformOptions: {},
    validatorOptions: {},
    printable: ConsoleLogger.instance,
    workingDir: process.cwd(),
  };
}

function fillEnvLoaderOptions(options?: EnvLoaderOptions): FilledEnvLoaderOptions {
  return lodash.merge(defaultEnvLoaderOptions(), options);
}

export class EnvLoader<T> {
  readonly options: FilledEnvLoaderOptions;

  constructor(readonly classConstructor: ClassConstructor<T>, options?: EnvLoaderOptions) {
    const filledOptions = fillEnvLoaderOptions(options);
    const { printable } = filledOptions;
    this.options = filledOptions;
    this.options.printable = new PrefixLogger(printable, '[EnvLoader]');
  }

  async load(): Promise<T> {
    const { printable } = this.options;
    await this.loadDotEnv();
    const instance = this.loadToInstance();
    const { validatorOptions } = this.options ?? {};
    const errors = await validate(instance as unknown as object, validatorOptions);
    if (this.isSuccessValidation(errors)) {
      printable.info('env validation succeeded.');
      return instance;
    }
    printable.error('env validation failed.');
    const filteredErrors = this.deleteTargetFromValidationError(errors);
    printable.error(filteredErrors);
    throw new EnvValidationError(filteredErrors);
  }

  loadSync(): T {
    const { printable } = this.options;
    this.loadDotEnvSync();
    const instance = this.loadToInstance();
    const { validatorOptions } = this.options ?? {};
    const errors = validateSync(instance as unknown as object, validatorOptions);
    if (this.isSuccessValidation(errors)) {
      printable.info('env validation succeeded.');
      return instance;
    }

    printable.error('env validation failed.');
    const filteredErrors = this.deleteTargetFromValidationError(errors);
    printable.error(filteredErrors);
    throw new EnvValidationError(filteredErrors);
  }

  private envPaths(): string[] {
    const { workingDir, printable } = this.options;
    const { dotEnvConfigOptions } = this.options ?? {};
    const envPaths: string[] = [];
    if (dotEnvConfigOptions?.path) {
      envPaths.push(path.join(workingDir, dotEnvConfigOptions.path));
    } else {
      envPaths.push(path.join(workingDir, '.env.local'));
      envPaths.push(path.join(workingDir, '.env'));
    }
    printable.info(`env paths: [${envPaths.join(', ')}]`);
    return envPaths;
  }

  private loadDotEnvSync(): void {
    const { dotEnvConfigOptions, printable } = this.options;
    const envPaths = this.envPaths();
    envPaths.forEach((envPath) => {
      if (fs.existsSync(envPath)) {
        printable.info(`load env file: [${envPath}]`);
        dotenv.config({ ...dotEnvConfigOptions, path: envPath });
      }
    });
  }

  private async loadDotEnv(): Promise<void> {
    const exist = async (envPath: string): Promise<boolean> => {
      try {
        await fs.promises.access(envPath, fs.constants.R_OK);
        return true;
      } catch (error) {
        return false;
      }
    };

    const { dotEnvConfigOptions, printable } = this.options;
    const envPaths = this.envPaths();
    for (const envPath of envPaths) {
      if (await exist(envPath)) {
        printable.info(`load env file: [${envPath}]`);
        dotenv.config({ ...dotEnvConfigOptions, path: envPath });
      }
    }
  }

  private filterEnv(): Record<string, string> {
    return Object.keys(new this.classConstructor()).reduce((acc, key) => {
      if (lodash.has(process.env, key)) {
        lodash.set(acc, key, process.env[key]);
      }
      return acc;
    }, {});
  }

  private loadToInstance(): T {
    const { classTransformOptions, printable } = this.options;
    const envFiltered = this.filterEnv();
    const instance = plainToInstance(this.classConstructor, envFiltered, classTransformOptions);
    printable.info(`env loaded.`);
    printable.info(`type: [${this.classConstructor.name}]`);
    return instance;
  }

  private deleteTargetFromValidationError(errors: ValidationError[]): ValidationError[] {
    return errors.map((error) => {
      error.target = undefined;
      return error;
    });
  }

  private isSuccessValidation(errors: ValidationError[]): boolean {
    return !(errors && errors.length !== 0);
  }
}

export function loadEnvLazySync<T extends object>(constructor: ClassConstructor<T>, options?: EnvLoaderOptions): T {
  let instance: T | null = null;
  return new Proxy(
    {},
    {
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      get(target, prop, receiver) {
        if (!instance) {
          instance = new EnvLoader(constructor, options).loadSync();
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return Reflect.get(instance, prop, receiver);
      },
    },
  ) as T;
}
