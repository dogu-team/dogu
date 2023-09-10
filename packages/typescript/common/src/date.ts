export function addMilliseconds(date: Date, milliseconds: number): Date {
  return new Date(date.getTime() + milliseconds);
}

export const Milisecond = {
  t1Second: 1_000,
  t3Seconds: 3_000,
  t5Seconds: 5_000,
  t15Seconds: 15_000,
  t30Seconds: 30_000,
  t1Minute: 60_000,
  t2Minutes: 120_000,
  t3Minutes: 180_000,
  t5Minutes: 300_000,
  t15Minutes: 900_000,
};
