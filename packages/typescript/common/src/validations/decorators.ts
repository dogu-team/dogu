import { Transform } from 'class-transformer';
import { buildMessage, IsUUID, ValidateBy, ValidationOptions } from 'class-validator';
import { Method } from '../http-ws/types';
import { stringify } from '../strings/functions';

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

export function isHttpMethod(method: unknown): boolean {
  const result = Method.find((httpMethod) => httpMethod === method);
  if (result === undefined) {
    return false;
  }
  return true;
}

export function IsHttpMethod(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isHttpMethod',
      constraints: [],
      validator: {
        validate: isHttpMethod,
        defaultMessage: buildMessage((eachPrefix) => eachPrefix + `$property must be one of the following: ${Method.join(', ')}`, validationOptions),
      },
    },
    validationOptions,
  );
}

const Trues = ['true', '1', 'yes', 'y'];
const Falses = ['false', '0', 'no', 'n'];

export function transformBooleanString(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  const stringified = typeof value === 'string' ? value : String(value);
  const lowerCased = stringified.toLowerCase();
  if (Trues.includes(lowerCased)) {
    return true;
  } else if (Falses.includes(lowerCased)) {
    return false;
  }
  throw new Error(`Invalid boolean string: ${stringify(value)}`);
}

export function TransformBooleanString(): PropertyDecorator {
  return Transform(({ value }) => {
    return transformBooleanString(value ?? false);
  });
}
