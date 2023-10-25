export interface IDisposable {
  create(): Promise<void>;
  dispose(): Promise<void>;
}

export async function using<T extends IDisposable, U>(resource: T, func: (resource: T) => Promise<U>): Promise<U> {
  try {
    await resource.create();
    return await func(resource);
  } finally {
    await resource.dispose();
  }
}
