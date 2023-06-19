type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}` ? `${T extends Capitalize<T> ? '_' : ''}${Lowercase<T>}${CamelToSnakeCase<U>}` : S;
type CamelToSnakeCaseProxy<T> = { [K in Extract<keyof T, string> as CamelToSnakeCase<K>]: CamelToSnakeCase<K> };

function camelToSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function camelToSnakeCasePropertiesOf<T>(obj?: T): CamelToSnakeCaseProxy<T> {
  return new Proxy(
    {},
    {
      get: (_, prop) => camelToSnakeCase(typeof prop === 'symbol' ? prop.toString() : prop),
      set: (): boolean => {
        throw new Error('Cannot set property on a proxied object');
      },
    },
  ) as CamelToSnakeCaseProxy<T>;
}

type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${U extends Capitalize<U> ? T : Lowercase<T>}${U extends Capitalize<U> ? U : Capitalize<U>}${SnakeToCamelCase<U>}`
  : S;
type SnakeToCamelCaseProxy<T> = { [K in Extract<keyof T, string>]: SnakeToCamelCase<K> };

export function snakeToCamelCase(str: string): string {
  return str.replace(/_\w/g, (letter) => (letter[1] !== undefined ? letter[1].toUpperCase() : letter));
}

export function snakeToCamelCasePropertiesOf<T>(obj?: T): SnakeToCamelCaseProxy<T> {
  return new Proxy(
    {},
    {
      get: (_, prop) => snakeToCamelCase(typeof prop === 'symbol' ? prop.toString() : prop),
      set: (): boolean => {
        throw new Error('Cannot set property on a proxied object');
      },
    },
  ) as SnakeToCamelCaseProxy<T>;
}

export type PropertiesOf<T> = { [K in Extract<keyof T, string>]: K };

export function propertiesOf<T>(obj?: T): PropertiesOf<T> {
  return new Proxy(
    {},
    {
      get: (_, prop) => prop,
      set: (): boolean => {
        throw new Error('Cannot set property on a proxied object');
      },
    },
  ) as PropertiesOf<T>;
}

export function camelToSnakeCaseWithPrefixPropertiesOf<T>(prefix: string, obj?: T): CamelToSnakeCaseProxy<T> {
  return new Proxy(
    {},
    {
      get: (_, prop) => `${prefix}${camelToSnakeCase(typeof prop === 'symbol' ? prop.toString() : prop)}`,
      set: (): boolean => {
        throw new Error('Cannot set property on a proxied object');
      },
    },
  ) as CamelToSnakeCaseProxy<T>;
}
