import { BillingPeriod } from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
import { DateTime } from 'luxon';

export class NormalizedDateTime {
  static from(normalizedDateTime: NormalizedDateTime): NormalizedDateTime {
    return new NormalizedDateTime(normalizedDateTime.dateTime);
  }

  static fromDate(date: Date): NormalizedDateTime {
    const dateTime = DateTime.fromJSDate(date);
    const ceiledDateTime = NormalizedDateTime.floorHours(dateTime);
    return new NormalizedDateTime(ceiledDateTime);
  }

  static fromDateTime(dateTime: DateTime): NormalizedDateTime {
    const ceiledDateTime = NormalizedDateTime.floorHours(dateTime);
    return new NormalizedDateTime(ceiledDateTime);
  }

  private static floorHours(dateTime: DateTime): DateTime {
    const floored = dateTime.minute === 0 && dateTime.second === 0 && dateTime.millisecond === 0;
    if (floored) {
      return dateTime;
    }

    return dateTime.startOf('hour');
  }

  private static ceilHours(dateTime: DateTime): DateTime {
    const ceiled = dateTime.minute === 0 && dateTime.second === 0 && dateTime.millisecond === 0;
    if (ceiled) {
      return dateTime;
    }

    return dateTime.startOf('hour').plus({ hours: 1 });
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
