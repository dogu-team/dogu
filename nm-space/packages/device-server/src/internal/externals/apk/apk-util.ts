import { Manifest, open } from 'adbkit-apkreader';

export async function getManifestFromApp(appPath: string): Promise<Manifest> {
  const reader = await open(appPath);
  const manifest = await reader.readManifest();
  return manifest;
}
