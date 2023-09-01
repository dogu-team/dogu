import { Firefox } from './firefox';

(async (): Promise<void> => {
  const firefox = new Firefox();
  const latestVersion = await firefox.getLatestVersion({ installableName: 'firefox' });
  console.log(latestVersion);
  const findVersion0 = await firefox.findVersion({ installableName: 'firefox', prefix: '117' });
  console.log(findVersion0);
  const findVersion1 = await firefox.findVersion({ installableName: 'firefox', pattern: /(?<version>\d+\.\d+)/ });
  console.log(findVersion1);
  const findVersion2 = await firefox.findVersion({ installableName: 'firefox-devedition', prefix: '117' });
  console.log(findVersion2);
  const findVersion3 = await firefox.findVersion({ installableName: 'firefox-devedition', pattern: /(?<version>\d+\.\d+)/ });
  console.log(findVersion3);
  const findVersion4 = await firefox.install({ installableName: 'firefox', version: latestVersion });
  console.log(findVersion4);
  const latestVersion5 = await firefox.getLatestVersion({ installableName: 'firefox-devedition' });
  const findVersion5 = await firefox.install({ installableName: 'firefox-devedition', version: latestVersion5 });
  console.log(findVersion5);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
