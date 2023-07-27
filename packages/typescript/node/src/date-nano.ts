export class DateNano {
  static readonly nanosecondsPerSecond = 1_000_000_000n;
  static readonly nanosecondsPerMillisecond = 1_000_000n;
  static readonly nanosecondsTickOnStart = process.hrtime.bigint();
  static readonly nanosecondsSince1970OnStart = BigInt(Date.now()) * DateNano.nanosecondsPerMillisecond;
  static readonly rfc3339nanoPattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):((\d{2})(\.(\d{1,9}))?)((Z)|(([+-])(\d{2}):(\d{2})))$/;

  static now(): bigint {
    const dateNano = new DateNano();
    return dateNano.nanosecondsSince1970;
  }

  static parse(rfc3339Nano: string): bigint {
    const match = DateNano.rfc3339nanoPattern.exec(rfc3339Nano);
    if (match === null) {
      throw new Error(`Date string format is invalid: ${rfc3339Nano}`);
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = Number(match[4]);
    const minutes = Number(match[5]);
    const seconds = Number(match[7]);
    const date = new Date(Date.UTC(year, month - 1, day, hour, minutes, seconds));
    const millisecondsWithoutNanoseconds = date.getTime();
    if (isNaN(millisecondsWithoutNanoseconds)) {
      throw new Error(`Date time is invalid: ${rfc3339Nano}`);
    }

    const nanoseconds = BigInt((match[9] ?? '').padEnd(9, '0'));
    const nanosecondsWithoutOffset = BigInt(millisecondsWithoutNanoseconds) * DateNano.nanosecondsPerMillisecond + nanoseconds;

    const timezoneOffsetSignUtc = match[11];
    if (timezoneOffsetSignUtc === 'Z') {
      return nanosecondsWithoutOffset;
    } else {
      const timezoneOffsetSign = match[13];
      const timezoneOffsetHour = Number(match[14]);
      const timezoneOffsetMinute = Number(match[15]);
      if (timezoneOffsetSign === '+') {
        const hourOffset = BigInt(timezoneOffsetHour) * 60n * 60n * DateNano.nanosecondsPerSecond;
        const minutesOffset = BigInt(timezoneOffsetMinute) * 60n * DateNano.nanosecondsPerSecond;
        return nanosecondsWithoutOffset - hourOffset - minutesOffset;
      } else if (timezoneOffsetSign === '-') {
        const hourOffset = BigInt(timezoneOffsetHour) * 60n * 60n * DateNano.nanosecondsPerSecond;
        const minutesOffset = BigInt(timezoneOffsetMinute) * 60n * DateNano.nanosecondsPerSecond;
        return nanosecondsWithoutOffset + hourOffset + minutesOffset;
      } else {
        throw new Error(`Timezone offset sign is invalid: ${rfc3339Nano}`);
      }
    }
  }

  static fromDate(date: Date): DateNano {
    const milliseconds = BigInt(date.getTime());
    return new DateNano(milliseconds * DateNano.nanosecondsPerMillisecond);
  }

  static fromMillisecondsSince1970(millisecondsSince1970: number): DateNano {
    const milliseconds = BigInt(millisecondsSince1970);
    return new DateNano(milliseconds * DateNano.nanosecondsPerMillisecond);
  }

  static fromRFC3339Nano(rfc3339Nano: string): DateNano {
    const nanoseconds = DateNano.parse(rfc3339Nano);
    return new DateNano(nanoseconds);
  }

  readonly nanosecondsSince1970: bigint;

  constructor(nanosecondsSince1970?: bigint) {
    if (nanosecondsSince1970 !== undefined) {
      this.nanosecondsSince1970 = nanosecondsSince1970;
      return;
    }
    const nanosecondsSinceStart = process.hrtime.bigint() - DateNano.nanosecondsTickOnStart;
    this.nanosecondsSince1970 = nanosecondsSinceStart + DateNano.nanosecondsSince1970OnStart;
  }

  toRFC3339Nano(): string {
    const seconds = this.nanosecondsSince1970 / DateNano.nanosecondsPerSecond;
    const nanoseconds = this.nanosecondsSince1970 % DateNano.nanosecondsPerSecond;
    const date = new Date(Number(seconds) * 1000);
    const year = date.getUTCFullYear().toString().padStart(4, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    const hour = date.getUTCHours().toString().padStart(2, '0');
    const minute = date.getUTCMinutes().toString().padStart(2, '0');
    const second = date.getUTCSeconds().toString().padStart(2, '0');
    const nanosecond = nanoseconds.toString().padEnd(9, '0');
    return `${year}-${month}-${day}T${hour}:${minute}:${second}.${nanosecond}Z`;
  }

  toRFC3339NanoWithTimezone(): string {
    const seconds = this.nanosecondsSince1970 / DateNano.nanosecondsPerSecond;
    const nanoseconds = this.nanosecondsSince1970 % DateNano.nanosecondsPerSecond;
    const date = new Date(Number(seconds) * 1000);
    const year = date.getFullYear().toString().padStart(4, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    const nanosecond = nanoseconds.toString().padEnd(9, '0');
    const timezoneOffset = date.getTimezoneOffset();
    const timezoneOffsetSign = timezoneOffset < 0 ? '+' : '-';
    const timezoneOffsetHour = Math.floor(Math.abs(timezoneOffset) / 60)
      .toString()
      .padStart(2, '0');
    const timezoneOffsetMinute = (Math.abs(timezoneOffset) % 60).toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hour}:${minute}:${second}.${nanosecond}${timezoneOffsetSign}${timezoneOffsetHour}:${timezoneOffsetMinute}`;
  }

  toString(): string {
    return this.toRFC3339Nano();
  }

  toDateWithTruncate(): Date {
    const milliseconds = Number(this.nanosecondsSince1970 / DateNano.nanosecondsPerMillisecond);
    return new Date(milliseconds);
  }
}
