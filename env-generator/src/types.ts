import { ClassConstructor } from 'class-transformer';

export type Class<T extends ClassConstructor<InstanceType<T>>> = ClassConstructor<InstanceType<T>>;
export type Instance<T extends Class<T>> = InstanceType<T>;
