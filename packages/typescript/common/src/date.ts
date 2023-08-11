export function addMilliseconds(date: Date, milliseconds: number): Date {
  return new Date(date.getTime() + milliseconds);
}

export const Milisecond = {
  t1Second: 1000,
  t3Seconds: 3000,
  t5Seconds: 5000,
  t30Seconds: 30000,
  t1Minute: 60000,
  t2Minutes: 120000,
  t3Minutes: 180000,
};
