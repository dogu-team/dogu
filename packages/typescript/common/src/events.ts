import { EventEmitter2 } from 'eventemitter2';
import { validate } from './validations/functions';
import { Class, Instance } from './validations/types';

export interface EventDefinition<Key extends string, Value> {
  key: Key;
  value: Value;
}

export function createEventDefinition<Key extends string, Value extends Class<Value>>(key: Key, value: Value): EventDefinition<Key, Value> {
  return { key, value };
}

export async function emitEventAsync<Key extends string, Value extends Class<Value>>(
  eventEmitter: EventEmitter2,
  eventDefinition: EventDefinition<Key, Value>,
  value: Instance<typeof eventDefinition.value>,
): Promise<unknown[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let results: any[] = [];
  try {
    const listeners = eventEmitter.listeners(eventDefinition.key);
    if (listeners.length === 0) {
      return [];
    }

    for (const listener of listeners) {
      try {
        const result = await Promise.resolve(listener(value));
        results.push(result);
      } catch (error) {
        results.push(error);
      }
    }
  } catch (error) {
    console.debug('eventEmitter.emitAsync failed', error);
    throw error;
  }
  return results as unknown[];
}

export async function validateAndEmitEventAsync<Key extends string, Value extends Class<Value>>(
  eventEmitter: EventEmitter2,
  eventDefinition: EventDefinition<Key, Value>,
  value: Instance<typeof eventDefinition.value>,
): Promise<unknown[]> {
  if (typeof value !== 'object') {
    throw new Error('value is not an object');
  }
  await validate(value as object);
  const results = await emitEventAsync(eventEmitter, eventDefinition, value);
  return results;
}
