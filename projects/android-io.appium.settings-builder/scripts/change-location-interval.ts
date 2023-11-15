import fs from 'fs';
import path from 'path';

export function changeLocationInterval(projectPath: string): Promise<void> {
  const locationServicePath = path.resolve(projectPath, 'app/src/main/java/io/appium/settings/LocationService.java');

  const locationService = fs.readFileSync(locationServicePath, 'utf-8');
  const newLocationService = locationService.replace('UPDATE_INTERVAL_MS = 2000L', 'UPDATE_INTERVAL_MS = 600L');
  fs.writeFileSync(locationServicePath, newLocationService, 'utf-8');
  return Promise.resolve();
}

export function changeFusedLocation(projectPath: string): Promise<void> {
  const javaPath = path.resolve(projectPath, 'app/src/main/java/io/appium/settings/location/FusedLocationProvider.java');

  const origin = fs.readFileSync(javaPath, 'utf-8');
  let replaced = origin
    .replace('!fusedLocationProviderClient.asGoogleApiClient().isConnected()', 'false')
    .replace('fusedLocationProviderClient.setMockLocation(location);', 'fusedLocationProviderClient.setMockMode(true);fusedLocationProviderClient.setMockLocation(location);');
  fs.writeFileSync(javaPath, replaced, 'utf-8');
  return Promise.resolve();
}

export function changeLocationAccuracy(projectPath: string): Promise<void> {
  const javaPath = path.resolve(projectPath, 'app/src/main/java/io/appium/settings/location/LocationBuilder.java');

  const origin = fs.readFileSync(javaPath, 'utf-8');
  const replaced = origin.replace('Criteria.ACCURACY_FINE', 'Criteria.ACCURACY_HIGH');
  fs.writeFileSync(javaPath, replaced, 'utf-8');
  return Promise.resolve();
}
