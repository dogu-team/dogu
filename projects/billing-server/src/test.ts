import { createExpiredAt, NormalizedDateTime } from './date-time-utils';

function print(now: Date): void {
  console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
  console.log(`now: ${now}`);

  const subscriptionStartedAt = NormalizedDateTime.fromDate(now);
  console.log(`subscriptionStartedAt: ${subscriptionStartedAt}`);

  const subscriptionMonthlyExpiredAt = createExpiredAt(subscriptionStartedAt, 'monthly');
  console.log(`subscriptionMonthlyExpiredAt: ${subscriptionMonthlyExpiredAt}`);

  const subscriptionYearlyExpiredAt = createExpiredAt(subscriptionStartedAt, 'yearly');
  console.log(`subscriptionYearlyExpiredAt: ${subscriptionYearlyExpiredAt}`);
}

print(new Date('2021-01-01T00:00:00.000'));
print(new Date('2021-01-31T00:00:00.000'));
print(new Date('2021-01-31T22:30:00.000'));
print(new Date('2021-01-31T00:00:00.001'));
print(new Date('2021-01-31T23:30:00.000'));
