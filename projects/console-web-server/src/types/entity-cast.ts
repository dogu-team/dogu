import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

// note. handle generic build error (https://github.com/typeorm/typeorm/issues/2904)
export function castEntity<T>(obj: T): QueryDeepPartialEntity<T> {
  return obj as QueryDeepPartialEntity<T>;
}
