import { GithubActionPublisher } from '@dogu-dev-private/publish-package';

(async (): Promise<void> => {
  const publisher = new GithubActionPublisher();
  await publisher.publish();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
