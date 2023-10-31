import { GCP } from './gcp/gcp';

(async () => {
  const buckets = await GCP.getBuckets();
  // await GCP.putImage(BucketName.WEB_RESPONSIVE_PAGE, undefined, '', 'image/jpeg');

  // const runClient = new ServicesClient();

  // const request = {
  //   parent: 'projects/dogu-project-379607/locations/asia-northeast3',
  // };

  // // Run request
  // const iterable = runClient.listServicesAsync(request);
  // for await (const response of iterable) {
  //   console.log(response);
  // }
})();
