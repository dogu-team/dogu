import { LoadingOutlined, MehOutlined } from '@ant-design/icons';
import { RemoteDestBase } from '@dogu-private/console';
import { DEST_TYPE, OrganizationId, ProjectId, RemoteDeviceJobId } from '@dogu-private/types';
import { isAxiosError } from 'axios';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../api/index';
import { flexRowCenteredStyle } from '../../styles/box';
import { getErrorMessageFromAxios } from '../../utils/error';
import ErrorBox from '../common/boxes/ErrorBox';
import RemoteDestJob from './RemoteDestJob';
import RemoteDestUnit from './RemoteDestUnit';

interface Props {
  organizationId: OrganizationId;
  projectId: ProjectId;
  remoteDeviceJobId: RemoteDeviceJobId;
}

const RemoteDestListController = ({ organizationId, projectId, remoteDeviceJobId }: Props) => {
  const { data, isLoading, error } = useSWR<RemoteDestBase[]>(
    `/organizations/${organizationId}/projects/${projectId}/remote-device-jobs/${remoteDeviceJobId}/remote-dests`,
    swrAuthFetcher,
  );

  if (!data && isLoading) {
    return (
      <div>
        <LoadingOutlined /> Loading...
      </div>
    );
  }

  if (!data || error) {
    return <ErrorBox title="Something went wrong" desc={isAxiosError(error) ? getErrorMessageFromAxios(error) : 'Cannot get remote dest information'} />;
  }

  if (!data.length) {
    return (
      <EmptyBox>
        <MehOutlined style={{ fontSize: '5rem' }} />
        <p style={{ marginTop: '.5rem' }}>There&apos;s no test units</p>
      </EmptyBox>
    );
  }

  return (
    <div>
      {data.map((item) => {
        switch (item.type) {
          case DEST_TYPE.JOB:
            return <RemoteDestJob key={`dest-${item.remoteDestId}`} dest={item} />;
          case DEST_TYPE.UNIT:
            return <RemoteDestUnit key={`dest-${item.remoteDestId}`} dest={item} />;
          default:
            return null;
        }
      })}
    </div>
  );
};

export default RemoteDestListController;

const EmptyBox = styled.div`
  padding: 2rem;
  ${flexRowCenteredStyle}
  flex-direction: column;
  color: #999;
  line-height: 1.5;
`;
