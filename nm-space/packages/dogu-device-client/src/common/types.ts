import { ClassConstructor } from 'class-transformer';

export type Class<T extends ClassConstructor<InstanceType<T>>> = ClassConstructor<InstanceType<T>>;
export type Instance<T extends Class<T>> = InstanceType<T>;

export const Method = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
export type Method = (typeof Method)[number];

export type Path = `/${string}`;

// export type Headers = Record<string, string | string[]>;
export type HeaderRecord = Record<string, string>;

export type Query = Record<string, unknown>;

export type PromiseOrValue<T> = Promise<T> | T;
