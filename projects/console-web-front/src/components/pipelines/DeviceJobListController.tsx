import { FieldTimeOutlined, LoadingOutlined } from '@ant-design/icons';
import { RoutineDeviceJobBase } from '@dogu-private/console';
import { RoutineJobId, OrganizationId, RoutinePipelineId, Platform, ProjectId } from '@dogu-private/types';
import { Button } from 'antd';
import { isAxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import useSWR from 'swr';
import { swrAuthFetcher } from '../../api';

import useLivePipelineStore from '../../stores/live-pipeline';
import { flexRowBaseStyle, tableCellStyle } from '../../styles/box';
import { getErrorMessageFromAxios } from '../../utils/error';
import ErrorBox from '../common/boxes/ErrorBox';
import PlatformIcon from '../device/PlatformIcon';
import JobStatusIcon from './JobStatusIcon';
import RuntimeTimer from './RuntimeTimer';

interface Props {
  orgId: OrganizationId;
  projectId: ProjectId;
  pipelineId: RoutinePipelineId;
  jobId: RoutineJobId;
}

const DeviceJobListController = ({ orgId, projectId, pipelineId, jobId }: Props) => {
  const { data, isLoading, error, mutate } = useSWR<RoutineDeviceJobBase[]>(
    `/organizations/${orgId}/projects/${projectId}/pipelines/${pipelineId}/jobs/${jobId}/device-jobs`,
    swrAuthFetcher,
  );
  const router = useRouter();
  const liveDeviceJobs = useLivePipelineStore(
    (state) => state.pipeline?.routineJobs?.find((job) => job.routineJobId === jobId)?.routineDeviceJobs,
  );

  if (isLoading) {
    return <LoadingOutlined />;
  }

  if (error) {
    return (
      <ErrorBox
        title="Something went wrong"
        desc={isAxiosError(error) ? getErrorMessageFromAxios(error) : 'Cannot find device jobs information'}
      />
    );
  }

  const deviceJobsData =
    liveDeviceJobs?.map((item) => ({
      ...item,
      device: data?.find((d) => d.deviceId === item.deviceId)?.device,
    })) || data;

  return (
    <Box>
      {deviceJobsData?.map((item) => {
        return (
          <Item
            key={`drj-${item.routineDeviceJobId}`}
            href={{
              pathname: router.pathname.replace(
                /\/\[pipelineId\](.+)?$/,
                '/[pipelineId]/jobs/[jobId]/device-jobs/[deviceJobId]',
              ),
              query: {
                orgId,
                pid: projectId,
                pipelineId: pipelineId,
                jobId,
                deviceJobId: item.routineDeviceJobId,
              },
            }}
          >
            <NameCell>
              <JobStatusIcon status={item.status} />
              <Name>{item.device?.name}</Name>
              {/* {item.status === PIPELINE_STATUS.IN_PROGRESS && (
                <StyledLink href={`/dashboard/${orgId}/devices/streaming/${item.deviceId}`} target="_blank" onClick={(e) => e.stopPropagation()}>
                  <StyledButton size="small">
                    <LiveCircle />
                    Live&nbsp;
                    <Image src={resources.icons.externalLink} width={14} height={14} alt="streaming" />
                  </StyledButton>
                </StyledLink>
              )} */}
            </NameCell>

            <TwoSpanCell>
              <DevicePlatform style={{ marginBottom: '.4rem' }}>
                <PlatformIcon platform={item.device?.platform ?? Platform.UNRECOGNIZED} />
                {item.device?.version}
              </DevicePlatform>
              <DeviceModel>
                {item.device?.modelName} {`(${item.device?.model})`}
              </DeviceModel>
            </TwoSpanCell>

            <TimerCell>
              <FieldTimeOutlined style={{ marginRight: '.25rem' }} />
              {item.inProgressAt ? (
                <RuntimeTimer
                  startDate={new Date(item.inProgressAt)}
                  endDate={item.completedAt && new Date(item.completedAt)}
                />
              ) : (
                'Waiting...'
              )}
            </TimerCell>
          </Item>
        );
      })}
    </Box>
  );
};

export default DeviceJobListController;

const Box = styled.div``;

const Item = styled(Link)`
  display: flex;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.colors.gray2};
  margin: 0.5rem 0;
  align-items: center;
  color: #000 !important;
`;

const NameCell = styled.div`
  ${flexRowBaseStyle}
  ${tableCellStyle}
  flex: 3;
`;

const TwoSpanCell = styled.div`
  ${tableCellStyle}
  flex: 2;
`;

const TimerCell = styled.div`
  ${tableCellStyle}
  flex: 1;
  margin-right: 0;
  text-align: right;
`;

const Name = styled.p`
  font-weight: 500;
  margin-left: 0.5rem;
`;

const DeviceModel = styled.p`
  margin-right: 0.5rem;
`;

const DevicePlatform = styled.div`
  display: flex;
  margin-right: 0.5rem;
  align-items: center;
`;

const StyledLink = styled(Link)`
  margin-left: 0.5rem;
`;

const StyledButton = styled(Button)`
  ${flexRowBaseStyle}
  font-size: 0.8rem;
`;

const LiveCircle = styled.div`
  width: 8px;
  height: 8px;
  margin-right: 0.25rem;
  border-radius: 50%;
  background-color: #ff4d4f;
`;
