import { PromiseOrValue } from '@dogu-tech/common';
import { Builder } from './internal/builder';
import { Runner } from './internal/runner';

export function job(name: string, fn: () => void): void {
  Builder.instance.job(name, fn);
}

export function test(name: string, fn: () => PromiseOrValue<void>): void {
  Builder.instance.test(name, fn);
}

export function beforeAll(fn: () => PromiseOrValue<void>): void {
  if (Runner.instance.isRunning) {
    throw new Error('Cannot add a beforeAll while the test run is in progress');
  }
  Builder.instance.beforeAll(fn);
}

export function beforeEach(fn: () => PromiseOrValue<void>): void {
  if (Runner.instance.isRunning) {
    throw new Error('Cannot add a beforeEach while the test run is in progress');
  }
  Builder.instance.beforeEach(fn);
}

export function afterAll(fn: () => PromiseOrValue<void>): void {
  if (Runner.instance.isRunning) {
    throw new Error('Cannot add a afterAll while the test run is in progress');
  }
  Builder.instance.afterAll(fn);
}

export function afterEach(fn: () => PromiseOrValue<void>): void {
  if (Runner.instance.isRunning) {
    throw new Error('Cannot add a afterEach while the test run is in progress');
  }
  Builder.instance.afterEach(fn);
}
