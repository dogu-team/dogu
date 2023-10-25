type NoPromise<T> = T extends Promise<unknown> ? never : T;

export interface IDisposableSync {
  create(): void;
  dispose(): void;
}

export interface IDisposableAsync {
  create(): Promise<void> | void;
  dispose(): Promise<void> | void;
}

export function using<T extends IDisposableSync, U>(resource: T, func: (resource: T) => NoPromise<U>): U {
  try {
    resource.create();
    return func(resource);
  } finally {
    resource.dispose();
  }
}

export async function usingAsnyc<T extends IDisposableAsync, U>(resource: T, func: (resource: T) => Promise<U>): Promise<U> {
  try {
    await Promise.resolve(resource.create());
    return await func(resource);
  } finally {
    await Promise.resolve(resource.dispose());
  }
}
