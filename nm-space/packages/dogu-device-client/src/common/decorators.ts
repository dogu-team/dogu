import { buildMessage, IsUUID, ValidateBy, ValidationOptions } from 'class-validator';

export function IsFilledString(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isFilledString',
      constraints: [],
      validator: {
        validate: (value: unknown) => {
          if (typeof value !== 'string') {
            return false;
          }
          return value.length > 0;
        },
        defaultMessage: buildMessage((eachPrefix) => eachPrefix + '$property must not be an empty string', validationOptions),
      },
    },
    validationOptions,
  );
}

export function IsUint8Array(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isUint8Array',
      constraints: [],
      validator: {
        validate: (value: unknown) => {
          return value instanceof Uint8Array;
        },
        defaultMessage: buildMessage((eachPrefix) => eachPrefix + '$property must be a Uint8Array', validationOptions),
      },
    },
    validationOptions,
  );
}

export function IsOptionalObject(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isOptionalObject',
      constraints: [],
      validator: {
        validate: (value: unknown) => {
          if (value === undefined) {
            return true;
          } else if (value === null) {
            return true;
          } else if (typeof value === 'object') {
            return true;
          }
          return false;
        },
        defaultMessage: buildMessage((eachPrefix) => eachPrefix + '$property must be undefined, null or object', validationOptions),
      },
    },
    validationOptions,
  );
}

export function IsUuidV4(): PropertyDecorator {
  return IsUUID(4);
}

export function isUrlPath(path: unknown): boolean {
  if (typeof path !== 'string') {
    return false;
  }
  return path.startsWith('/');
}

export function IsUrlPath(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isUrlPath',
      constraints: [],
      validator: {
        validate: isUrlPath,
        defaultMessage: buildMessage((eachPrefix) => eachPrefix + '$property must be start with /', validationOptions),
      },
    },
    validationOptions,
  );
}
