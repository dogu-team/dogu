import { BillingPeriod } from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
import { DateTime } from 'luxon';

export function ceilHours(dateTime: DateTime): DateTime {
  const ceiled = dateTime.minute === 0 && dateTime.second === 0 && dateTime.millisecond === 0;
  if (ceiled) {
    return dateTime;
  }

  return dateTime.startOf('hour').plus({ hours: 1 });
}

export function floorHours(dateTime: DateTime): DateTime {
  const floored = dateTime.minute === 0 && dateTime.second === 0 && dateTime.millisecond === 0;
  if (floored) {
    return dateTime;
  }

  return dateTime.startOf('hour');
}

export function floorDays(dateTime: DateTime): DateTime {
  const floored = dateTime.hour === 0 && dateTime.minute === 0 && dateTime.second === 0 && dateTime.millisecond === 0;
  if (floored) {
    return dateTime;
  }

  return dateTime.startOf('day');
}

export function calculateBoundedNow(now: Date, startedAt: NormalizedDateTime, expiredAt: NormalizedDateTime): NormalizedDateTime {
  if (now > expiredAt.date) {
    return NormalizedDateTime.fromDateTime(expiredAt.dateTime);
  } else if (now < startedAt.date) {
    return NormalizedDateTime.fromDateTime(startedAt.dateTime);
  } else {
    return NormalizedDateTime.fromDate(now);
  }
}

export function calculateFlooredNow(now: Date, startedAt: NormalizedDateTime, expiredAt: NormalizedDateTime): NormalizedDateTime {
  const boundedNow = calculateBoundedNow(now, startedAt, expiredAt);
  const flooredNow = NormalizedDateTime.fromDateTime(
    boundedNow.dateTime.minus({ hours: startedAt.dateTime.hour }).set({
      hour: startedAt.dateTime.hour,
      minute: startedAt.dateTime.minute,
      second: startedAt.dateTime.second,
      millisecond: startedAt.dateTime.millisecond,
    }),
  );
  return flooredNow;
}

export class NormalizedDateTime {
  static from(normalizedDateTime: NormalizedDateTime): NormalizedDateTime {
    return new NormalizedDateTime(normalizedDateTime.dateTime);
  }

  static fromDate(date: Date): NormalizedDateTime {
    const dateTime = DateTime.fromJSDate(date);
    const ceiledDateTime = floorHours(dateTime);
    return new NormalizedDateTime(ceiledDateTime);
  }

  static fromDateTime(dateTime: DateTime): NormalizedDateTime {
    const ceiledDateTime = floorHours(dateTime);
    return new NormalizedDateTime(ceiledDateTime);
  }

  private constructor(readonly dateTime: DateTime) {}

  get date(): Date {
    return this.dateTime.toJSDate();
  }

  toString(): string {
    return this.dateTime.toString();
  }
}

export function createExpiredAt(startedAt: NormalizedDateTime, period: BillingPeriod): NormalizedDateTime {
  switch (period) {
    case 'monthly': {
      const expiredAt = startedAt.dateTime.plus({ months: 1 });
      return NormalizedDateTime.fromDateTime(expiredAt);
    }
    case 'yearly': {
      const expiredAt = startedAt.dateTime.plus({ years: 1 });
      return NormalizedDateTime.fromDateTime(expiredAt);
    }
    default: {
      assertUnreachable(period);
    }
  }
}
