import { useRouter } from 'next/router';

const useScriptHashRoute = (): {
  pipelineId: string | undefined;
  jobId: string | undefined;
  deviceJobId: string | undefined;
} => {
  const router = useRouter();
  const ids: string | undefined = router.asPath.split('#')[1];

  const pipelineId = ids?.split(':')[0];
  const jobId = ids?.split(':')[1];
  const deviceJobId = ids?.split(':')[2];

  return { pipelineId, jobId, deviceJobId };
};

export default useScriptHashRoute;
