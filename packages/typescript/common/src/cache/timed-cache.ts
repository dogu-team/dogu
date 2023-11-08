import { time, TimeOptions } from '..';

interface TimedCacheData<ValueType> {
  value: ValueType;
  lastUpdate: number;
}

export class TimedCacheAsync<ValueType> {
  private data: TimedCacheData<ValueType> | undefined;

  constructor(private readonly expire: TimeOptions) {}

  async update(func: () => Promise<ValueType>): Promise<ValueType> {
    const { data } = this;
    if (data && Date.now() - data.lastUpdate < time(this.expire)) {
      return data.value;
    }
    const newValue = await func();
    this.data = {
      value: newValue,
      lastUpdate: Date.now(),
    };
    return newValue;
  }
}
