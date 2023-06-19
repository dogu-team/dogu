import { color } from './internal/colorizer';

class Expect {
  private receivedValue: unknown;

  constructor(value: unknown) {
    this.receivedValue = value;
  }

  toBe(expectedValue: unknown): this {
    if (this.receivedValue !== expectedValue) {
      throw new Error(`expected\n  ${color.green(expectedValue)}\n  received\n  ${color.red(this.receivedValue)}`);
    }

    return this;
  }
}

export function expect(value: unknown): Expect {
  return new Expect(value);
}
