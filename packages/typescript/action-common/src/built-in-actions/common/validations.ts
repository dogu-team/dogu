import { PlatformType } from '@dogu-tech/types';
import { buildMessage, ValidateBy, ValidationOptions } from 'class-validator';

export function isAppVersion(value: unknown): boolean {
  function validateValue(value: unknown): boolean {
    if (typeof value === 'number') {
      try {
        Number(value);
        return true;
      } catch (error) {
        return false;
      }
    }
    return typeof value === 'string' && value.length > 0;
  }
  if (typeof value === 'number') {
    return validateValue(value);
  } else if (typeof value === 'string') {
    return validateValue(value);
  } else if (typeof value === 'object' && value) {
    return Object.keys(value).every((key) => {
      if (!PlatformType.includes(key as PlatformType)) {
        return false;
      }
      return Object.keys(value).every((key) => validateValue(Reflect.get(value, key)));
    });
  } else {
    return false;
  }
}

export function IsAppVersion(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isAppVersion',
      constraints: [],
      validator: {
        validate(value): boolean {
          return isAppVersion(value);
        },
        defaultMessage: buildMessage((eachPrefix) => eachPrefix + `$property must be string or string with platform: ${PlatformType.join(', ')}`, validationOptions),
      },
    },
    validationOptions,
  );
}
