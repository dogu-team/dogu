export function getClockTime(): string {
  const date = new Date();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  const millisecond = date.getMilliseconds().toFixed(2);
  const time = `${hour}:${minute}:${second}.${millisecond}`;
  return time;
}
