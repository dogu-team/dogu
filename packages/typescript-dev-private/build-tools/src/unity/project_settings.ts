import fsPromises from 'fs/promises';
import path from 'path';

// js-yaml dump behavior is different from Unity's yaml serializer.
// const kindsArray: ('sequence' | 'scalar' | 'mapping')[] = ['scalar', 'sequence', 'mapping'];
// const tags = kindsArray.map((kind): yaml.Type => {
//   return new yaml.Type('tag:unity3d.com,2011', {
//     kind: kind,
//     multi: true,
//   });
// });

// const SCHEMA = yaml.DEFAULT_SCHEMA.extend(tags);

// interface PlayerSettingsDoc {
//   PlayerSettings: {
//     defaultScreenWidth: number;
//     defaultScreenHeight: number;
//     fullscreenMode: number;
//   };
// }

// export async function modifyProjectSettingJsYaml(projectPath: string, buildTarget: BuildTarget): Promise<void> {
//   const projectSettingPath = path.resolve(projectPath, 'ProjectSettings/ProjectSettings.asset');
//   const contents = await fsPromises.readFile(projectSettingPath, 'utf8');

//   const doc = yaml.load(contents, { schema: SCHEMA }) as PlayerSettingsDoc;
//   doc.PlayerSettings.defaultScreenWidth = 1280;
//   doc.PlayerSettings.defaultScreenHeight = 720;
//   doc.PlayerSettings.fullscreenMode = 3;

//   await fsPromises.writeFile(projectSettingPath, yaml.dump(doc, { schema: SCHEMA }));
//   const a = 0;
// }

export async function modifyProjectSetting(projectPath: string, appVersion: string): Promise<void> {
  const projectSettingPath = path.resolve(projectPath, 'ProjectSettings/ProjectSettings.asset');
  const projectName = path.basename(projectPath);
  let contents = await fsPromises.readFile(projectSettingPath, 'utf8');
  contents = contents.replace(/defaultScreenWidth: (\d+)/, (match, p1): string => {
    return `defaultScreenWidth: ${1280}`;
  });
  contents = contents.replace(/defaultScreenHeight: (\d+)/, (match, p1): string => {
    return `defaultScreenHeight: ${720}`;
  });
  contents = contents.replace(/fullscreenMode: (\d+)/, (match, p1): string => {
    return `fullscreenMode: ${3}`;
  });
  // replace companyName
  contents = contents.replace(/companyName: (.+)/, (match, p1): string => {
    return 'companyName: dogutech';
  });
  contents = contents.replace(/productName: (.+)/, (match, p1): string => {
    return `productName: ${projectName}`;
  });

  // replace appVersion
  contents = contents.replace(/bundleVersion: (.+)/, (match, p1): string => {
    return `bundleVersion: ${appVersion}`;
  });

  await fsPromises.writeFile(projectSettingPath, contents);
}
