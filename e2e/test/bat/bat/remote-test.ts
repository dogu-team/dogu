import { ChromeDriver } from '../../../src/chromedriver';

export interface TestRemoteOptions {
  consoleFrontDriver: ChromeDriver;
}

export default function testRemote(options: TestRemoteOptions): void {
  // noop
}
