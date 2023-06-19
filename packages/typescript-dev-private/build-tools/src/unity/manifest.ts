import fsPromises from 'fs/promises';
import path from 'path';

export async function modifyManifest(projectPath: string, deps: { key: string; value: string }[]): Promise<void> {
  const manifestPath = path.resolve(projectPath, 'Packages/manifest.json');
  let contents = await fsPromises.readFile(manifestPath, 'utf8');

  for (const dep of deps) {
    contents = contents.replace(new RegExp(`"${dep.key}": "(.+)",`, 'g'), (match, p1): string => {
      return `"${dep.key}": "${dep.value}",`;
    });
  }

  // contents = contents.replace(/defaultScreenWidth: (\d+)/, (match, p1): string => {
  //   return `defaultScreenWidth: ${1280}`;
  // });

  await fsPromises.writeFile(manifestPath, contents);
}
