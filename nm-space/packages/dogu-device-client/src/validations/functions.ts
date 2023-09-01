import { ClassTransformOptions, plainToInstance } from 'class-transformer';
import { validateOrReject, validateSync, ValidationError, ValidatorOptions } from 'class-validator';
import _ from 'lodash';
import { ConsoleLogger, Printable } from '../common/logs.js';
import { Class, Instance } from '../common/types.js';

function defaultClassTransformOptions(): ClassTransformOptions {
  return { enableCircularCheck: true };
}

function fillClassTransformOptions(options?: ClassTransformOptions): ClassTransformOptions {
  return _.merge(defaultClassTransformOptions(), options);
}

export function transform<T extends Class<T>, V>(constructor: T, plain: V, options?: ClassTransformOptions, printable?: Printable): Instance<T> {
  let instance: Instance<T> | null = null;
  try {
    instance = plainToInstance(constructor, plain, fillClassTransformOptions(options));
  } catch (error) {
    printable?.verbose?.('plainToInstance failed', { error });
    throw error;
  }
  if (typeof instance !== 'object') {
    throw new Error('plainToInstance returned a non-object');
  }
  return instance;
}

function defaultValidatorOptions(): ValidatorOptions {
  return { forbidUnknownValues: false, whitelist: false, forbidNonWhitelisted: false };
}

function fillValidatorOptions(options?: ValidatorOptions): ValidatorOptions {
  return _.merge(defaultValidatorOptions(), options);
}

export async function validate(instance: object, options?: ValidatorOptions, printable?: Printable): Promise<void> {
  try {
    await validateOrReject(instance, fillValidatorOptions(options));
  } catch (error) {
    printable?.verbose?.('validation failed', { error });
    throw error;
  }
}

interface TransformAndValidateOptions {
  classTransformOptions?: ClassTransformOptions;
  validatorOptions?: ValidatorOptions;

  /**
   * @default ConsoleLogger.instance
   */
  printable?: Printable;
}

type FilledTransformAndValidateOptions = Required<TransformAndValidateOptions>;

function defaultTransformAndValidateOptions(): FilledTransformAndValidateOptions {
  return {
    classTransformOptions: defaultClassTransformOptions(),
    validatorOptions: defaultValidatorOptions(),
    printable: ConsoleLogger.instance,
  };
}

function fillTransformAndValidateOptions(options?: TransformAndValidateOptions): FilledTransformAndValidateOptions {
  return _.merge(defaultTransformAndValidateOptions(), options);
}

export async function transformAndValidate<T extends Class<T>, V>(constructor: T, plain: V, options?: TransformAndValidateOptions): Promise<Instance<T>> {
  const { classTransformOptions, validatorOptions, printable } = fillTransformAndValidateOptions(options);
  const instance = transform(constructor, plain, classTransformOptions, printable);
  await validate(instance as object, validatorOptions, printable);
  return instance;
}

export class FillOptionsValidationError extends Error {
  constructor(message: string, readonly validationErrors: ValidationError[], options?: ErrorOptions) {
    super(message, options);
  }
}

export function fillOptionsSync<T extends Class<T>>(constructor: T, defaultValue: Required<Instance<T>>, options?: Instance<T>): Required<Instance<T>> {
  const merged = _.merge(defaultValue, options);
  const instance = plainToInstance(constructor, merged, {
    enableCircularCheck: true,
  });
  if (typeof instance !== 'object') {
    throw new Error('Invalid transform result');
  }
  const errors = validateSync(instance as object);
  if (errors.length > 0) {
    throw new FillOptionsValidationError('Invalid options', errors);
  }
  return instance as Required<Instance<T>>;
}
