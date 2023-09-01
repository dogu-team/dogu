import { Firefox } from './firefox';

(async (): Promise<void> => {
  const firefox = new Firefox();
  const latestVersion = await firefox.getLatestVersion({ installableName: 'firefox' });
  console.log(latestVersion);
  const findVersion = await firefox.findVersion({ installableName: 'firefox', pattern: /(?<version>\d+\.\d+)/ });
  console.log(findVersion);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
