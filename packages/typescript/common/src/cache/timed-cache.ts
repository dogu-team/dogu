import { time, TimeOptions } from '..';

interface TimedCacheData<ValueType> {
  value: ValueType;
  lastUpdate: number;
}

export class TimedCacheAsync<ValueType> {
  private data: TimedCacheData<ValueType> | undefined;

  constructor(private readonly expire: TimeOptions) {}

  async update(option: { call: () => Promise<ValueType>; onCached?: () => void }): Promise<ValueType> {
    const { data } = this;
    if (data && Date.now() - data.lastUpdate < time(this.expire)) {
      option.onCached?.();
      return data.value;
    }
    const newValue = await option.call();
    this.data = {
      value: newValue,
      lastUpdate: Date.now(),
    };
    return newValue;
  }
}
