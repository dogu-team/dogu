import { EnvironmentContext, JestEnvironmentConfig } from '@jest/environment';
import NodeEnvironment from 'jest-environment-node';

class DoguTestEnvironment extends NodeEnvironment {
  constructor(config: JestEnvironmentConfig, _context: EnvironmentContext) {
    super(config, _context);
  }

  override async setup(): Promise<void> {
    await super.setup();
    console.log('DoguTestEnvironment setup', { datetime: new Date() });
  }

  override async teardown(): Promise<void> {
    console.log('DoguTestEnvironment teardown', { datetime: new Date() });
    await super.teardown();
  }
}

// async handleTestEvent(event: Circus.SyncEvent | Circus.AsyncEvent, state: Circus.State): Promise<void> {
//   if (event.name === 'setup') {
//     console.log({ eventName: event.name, datetime: new Date() });
//   } else if (event.name === 'teardown') {
//     console.log({ eventName: event.name, datetime: new Date() });
//   } else if (event.name === 'add_hook') {
//     console.log({ eventName: event.name, hookType: event.hookType, datetime: new Date() });
//   } else if (event.name === 'add_test') {
//     console.log({ eventName: event.name, testName: event.testName, datetime: new Date() });
//   } else if (event.name === 'start_describe_definition') {
//     console.log({
//       eventName: event.name,
//       blockName: event.blockName,
//       datetime: new Date(),
//     });
//   } else if (event.name === 'finish_describe_definition') {
//     console.log({
//       eventName: event.name,
//       blockName: event.blockName,
//       datetime: new Date(),
//     });
//   } else if (event.name === 'run_start') {
//     console.log({
//       eventName: event.name,
//       datetime: new Date(),
//     });
//   } else if (event.name === 'run_finish') {
//     console.log({
//       eventName: event.name,
//       datetime: new Date(),
//     });
//   } else if (event.name === 'run_describe_start') {
//     console.log({
//       eventName: event.name,
//       blockName: event.describeBlock.name,
//       datetime: new Date(),
//     });
//   } else if (event.name === 'run_describe_finish') {
//     console.log({
//       eventName: event.name,
//       blockName: event.describeBlock.name,
//       datetime: new Date(),
//     });
//   } else if (event.name === 'test_start') {
//     console.log({
//       eventName: event.name,
//       testName: event.test.name,
//       datetime: new Date(),
//     });
//   } else if (event.name === 'test_started') {
//     console.log({
//       eventName: event.name,
//       testName: event.test.name,
//       datetime: new Date(),
//     });
//   } else if (event.name === 'test_done') {
//     console.log({
//       eventName: event.name,
//       testName: event.test.name,
//       datetime: new Date(),
//     });
//   } else if (event.name === 'test_skip') {
//     console.log({
//       eventName: event.name,
//       testName: event.test.name,
//       datetime: new Date(),
//     });
//   } else if (event.name === 'test_todo') {
//     console.log({
//       eventName: event.name,
//       testName: event.test.name,
//       datetime: new Date(),
//     });
//   } else if (event.name === 'hook_start') {
//     console.log({
//       eventName: event.name,
//       hookType: event.hook.type,
//       datetime: new Date(),
//     });
//   } else if (event.name === 'hook_success') {
//     console.log({
//       eventName: event.name,
//       hookType: event.hook.type,
//       datetime: new Date(),
//     });
//   } else if (event.name === 'hook_failure') {
//     console.log({
//       eventName: event.name,
//       hookType: event.hook.type,
//       datetime: new Date(),
//     });
//   } else if (event.name === 'test_fn_start') {
//     console.log({
//       eventName: event.name,
//       testName: event.test.name,
//       datetime: new Date(),
//     });
//   } else if (event.name === 'test_fn_success') {
//     console.log({
//       eventName: event.name,
//       testName: event.test.name,
//       datetime: new Date(),
//     });
//   } else if (event.name === 'test_fn_failure') {
//     console.log({
//       eventName: event.name,
//       testName: event.test.name,
//       datetime: new Date(),
//     });
//   } else {
//     console.log({
//       eventName: event.name,
//       blockName: _.get(event, 'blockName'),
//       testName: _.get(event, 'testName'),
//       datetime: new Date(),
//     });
//   }
// }
// }

export default DoguTestEnvironment;
