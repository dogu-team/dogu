import { Circus } from '@jest/types';

export const DefaultRequestTimeout = 60 * 1000; // unit: milliseconds

export enum DestType {
  JOB = 0,
  UNIT = 1,
}

export enum DestState {
  UNSPECIFIED = 0,
  PENDING = 1,
  RUNNING = 2,
  FAILED = 3,
  PASSED = 4,
  SKIPPED = 5,
}

const destCompletedStates = [DestState.FAILED, DestState.PASSED, DestState.SKIPPED];

export function isDestStateCompleted(state: DestState): boolean {
  return destCompletedStates.includes(state);
}

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

export function createLogger(category: string): {
  info: (message: any, ...args: any[]) => void;
  error: (message: any, ...args: any[]) => void;
} {
  return {
    info: (message: any, ...args: any[]): void => console.log(`${toISOStringWithTimezone(new Date())} INFO  ${category}:`, message, ...args),
    error: (message: any, ...args: any[]): void => console.error(`${toISOStringWithTimezone(new Date())} ERROR ${category}:`, message, ...args),
  };
}

export type TestNode = Pick<Circus.TestEntry, 'name' | 'type' | 'parent'>;
export type DescribeNode = Pick<Circus.DescribeBlock, 'name' | 'type' | 'parent' | 'children'>;
export type EventNode = DescribeNode | TestNode;

export interface DestInfo {
  name: string;
  type: DestType;
  children: DestInfo[];
}

export function createDestInfoRecursive(eventNode: EventNode): DestInfo {
  const { name, type } = eventNode;
  return {
    name,
    type: type === 'test' ? DestType.UNIT : DestType.JOB,
    children: type === 'test' ? [] : eventNode.children.map((child) => createDestInfoRecursive(child)),
  };
}

export function createPaths(eventNode: EventNode): string[] {
  let paths: string[] = [];
  let current: EventNode | undefined = eventNode;
  while (current) {
    const { name } = current;
    paths = [name, ...paths];
    current = current.parent;
  }
  return paths;
}
