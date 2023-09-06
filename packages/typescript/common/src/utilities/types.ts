export type PromiseOrValue<T> = Promise<T> | T;

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] | null : T[P] extends object ? RecursivePartial<T[P]> : T[P] | null;
};

export type RecursiveRequired<T> = NonNullable<
  Exclude<
    Required<{
      [P in keyof T]: T[P] extends object | null | undefined ? RecursiveRequired<T[P]> : Exclude<T[P], null | undefined>;
    }>,
    null | undefined
  >
>;

export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends Record<keyof any, unknown> | unknown[] ? DeepReadonly<T[K]> : T[K];
};
