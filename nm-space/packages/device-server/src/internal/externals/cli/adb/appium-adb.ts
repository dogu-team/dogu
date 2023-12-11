import AppiumAdbPackage from 'appium-adb';
import { adbBinary, DOGU_ADB_SERVER_PORT } from './adb';

export type AppiumAdb = Awaited<ReturnType<typeof AppiumAdbPackage.createADB>>;

export async function createAppiumAdb(): Promise<AppiumAdb> {
  return await AppiumAdbPackage.createADB({ adbPort: DOGU_ADB_SERVER_PORT, executable: { path: adbBinary(), defaultArgs: [] } });
}
