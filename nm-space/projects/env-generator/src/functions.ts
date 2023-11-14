import { ClassTransformOptions, plainToInstance } from 'class-transformer';
import { validateOrReject, ValidatorOptions } from 'class-validator';
import lodash from 'lodash';
import { Class, Instance } from './types';

function defaultClassTransformOptions(): ClassTransformOptions {
  return { enableCircularCheck: true };
}

function fillClassTransformOptions(options?: ClassTransformOptions): ClassTransformOptions {
  return lodash.merge(defaultClassTransformOptions(), options);
}

export function transform<T extends Class<T>, V>(constructor: T, plain: V, options?: ClassTransformOptions): Instance<T> {
  let instance: Instance<T> | null = null;
  try {
    instance = plainToInstance(constructor, plain, fillClassTransformOptions(options));
  } catch (error) {
    console.error('plainToInstance failed', { error });
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
  return lodash.merge(defaultValidatorOptions(), options);
}

export async function validate(instance: object, options?: ValidatorOptions): Promise<void> {
  try {
    await validateOrReject(instance, fillValidatorOptions(options));
  } catch (error) {
    console.error('validation failed', { error });
    throw error;
  }
}

interface TransformAndValidateOptions {
  classTransformOptions?: ClassTransformOptions;
  validatorOptions?: ValidatorOptions;
}

type FilledTransformAndValidateOptions = Required<TransformAndValidateOptions>;

function defaultTransformAndValidateOptions(): FilledTransformAndValidateOptions {
  return {
    classTransformOptions: defaultClassTransformOptions(),
    validatorOptions: defaultValidatorOptions(),
  };
}

function fillTransformAndValidateOptions(options?: TransformAndValidateOptions): FilledTransformAndValidateOptions {
  return lodash.merge(defaultTransformAndValidateOptions(), options);
}

export async function transformAndValidate<T extends Class<T>, V>(constructor: T, plain: V, options?: TransformAndValidateOptions): Promise<Instance<T>> {
  const { classTransformOptions, validatorOptions } = fillTransformAndValidateOptions(options);
  const instance = transform(constructor, plain, classTransformOptions);
  await validate(instance as object, validatorOptions);
  return instance;
}
