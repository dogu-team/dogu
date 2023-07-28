import axios from 'axios';
import fs from 'fs';

function toISOStringWithTimezone(date: Date): string {
  const offset = -date.getTimezoneOffset();
  const diff = offset >= 0 ? '+' : '-';
  const padStart2: (n: number) => string = (n) => `${Math.floor(Math.abs(n))}`.padStart(2, '0');
  const padEnd3: (n: number) => string = (n) => `${Math.floor(Math.abs(n))}`.padEnd(3, '0');
  return (
    String(date.getFullYear()) +
    '-' +
    padStart2(date.getMonth() + 1) +
    '-' +
    padStart2(date.getDate()) +
    'T' +
    padStart2(date.getHours()) +
    ':' +
    padStart2(date.getMinutes()) +
    ':' +
    padStart2(date.getSeconds()) +
    '.' +
    padEnd3(date.getMilliseconds()) +
    diff +
    padStart2(offset / 60) +
    ':' +
    padStart2(offset % 60)
  );
}

fs.writeFileSync('test.log', '', { encoding: 'utf8' });

export function createLogger(category: string): {
  info: (message: any, ...args: any[]) => void;
  error: (message: any, ...args: any[]) => void;
} {
  return {
    info: (message: any, ...args: any[]): void => {
      console.log(`${toISOStringWithTimezone(new Date())} | info | ${process.pid} | ${category} |`, message, ...args);
      fs.appendFileSync('test.log', `${toISOStringWithTimezone(new Date())} | info | ${process.pid} | ${category} | ${message} ${JSON.stringify(args, undefined, 2)}\n`, {
        encoding: 'utf8',
      });
    },
    error: (message: any, ...args: any[]): void => {
      console.error(`${toISOStringWithTimezone(new Date())} | error | ${process.pid} | ${category} |`, message, ...args);
      fs.appendFileSync('test.log', `${toISOStringWithTimezone(new Date())} | error | ${process.pid} | ${category} | ${message} ${JSON.stringify(args, undefined, 2)}\n`, {
        encoding: 'utf8',
      });
    },
  };
}

export function initAxios(): void {
  axios.defaults.timeout = 60 * 1000; // unit: milliseconds
}
