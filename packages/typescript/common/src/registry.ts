import { stringifyShort } from './strings/functions';

export class Registry<Key, Value> {
  protected readonly map: Map<Key, Value> = new Map();

  constructor(protected readonly name: string) {}

  register(key: Key, value: Value): void {
    if (this.map.has(key)) {
      throw new Error(`${this.name} Key ${stringifyShort(key)} already registered`);
    }

    this.map.set(key, value);
  }

  unregister(key: Key): void {
    if (!this.map.has(key)) {
      return;
    }

    this.map.delete(key);
  }

  get(key: Key): Value {
    const value = this.map.get(key);
    if (value === undefined) {
      throw new Error(`${this.name} Key ${stringifyShort(key)} not registered`);
    }
    return value;
  }

  update(key: Key, value: Value): void {
    if (!this.map.has(key)) {
      throw new Error(`${this.name} Key ${stringifyShort(key)} not registered`);
    }
    this.map.set(key, value);
  }

  forEach(callback: (value: Value, key: Key, map: Map<Key, Value>) => void): void {
    this.map.forEach(callback);
  }
}
