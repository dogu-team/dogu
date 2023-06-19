import { LoadingOutlined } from '@ant-design/icons';
import { DestBase, RuntimeInfoResponse } from '@dogu-private/console';
import moment from 'moment';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { swrAuthFetcher } from '../../api';
import { isDestEndedWithData } from '../../utils/pipeline';
import ErrorBox from '../common/boxes/ErrorBox';
import DestEmptyData from './DestEmptyData';
import RuntimeProfiles from './RuntimeProfiles';

interface Props {
  destUnit: DestBase;
}

const DestProfileController = ({ destUnit }: Props) => {
  const router = useRouter();
  const { data, isLoading, error } = useSWR<RuntimeInfoResponse>(
    isDestEndedWithData(destUnit.state) &&
      `/organizations/${router.query.orgId}/projects/${router.query.pid}/pipelines/${router.query.pipelineId}/jobs/${router.query.jobId}/device-jobs/${router.query.deviceJobId}/steps/${destUnit.routineStepId}/dests/${destUnit.destId}/runtime-info`,
    swrAuthFetcher,
  );
  const { t } = useTranslation();

  if (!isDestEndedWithData(destUnit.state)) {
    return <DestEmptyData status={destUnit.state} />;
  }

  if (isLoading) {
    return (
      <div>
        Loading...
        <LoadingOutlined />
      </div>
    );
  }

  if (!data || error) {
    return <ErrorBox title="Error" desc="" />;
  }

  return (
    <div style={{ width: '100%' }}>
      <RuntimeProfiles
        profileData={data}
        startedAt={destUnit.inProgressAt ? moment(destUnit.inProgressAt).toDate() : new Date()}
        endedAt={destUnit.inProgressAt ? moment(destUnit.completedAt).toDate() : new Date()}
      />
    </div>
  );
};

export default DestProfileController;
