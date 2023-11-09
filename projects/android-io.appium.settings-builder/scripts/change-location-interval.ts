import fs from 'fs';
import path from 'path';

export function changeLocationInterval(projectPath: string): Promise<void> {
  const locationServicePath = path.resolve(projectPath, 'app/src/main/java/io/appium/settings/LocationService.java');

  // change UPDATE_INTERVAL_MS = 2000L to UPDATE_INTERVAL_MS = 1000L
  const locationService = fs.readFileSync(locationServicePath, 'utf-8');
  const newLocationService = locationService.replace('UPDATE_INTERVAL_MS = 2000L', 'UPDATE_INTERVAL_MS = 1000L');
  fs.writeFileSync(locationServicePath, newLocationService);
  return Promise.resolve();
}
