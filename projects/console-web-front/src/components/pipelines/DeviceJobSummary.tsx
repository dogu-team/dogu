import { RoutineDeviceJobBase } from '@dogu-private/console';
import styled from 'styled-components';

import PlatformIcon from 'src/components/device/PlatformIcon';
import JobStatusIcon from 'src/components/pipelines/JobStatusIcon';
import PipelineRuntime from 'src/components/pipelines/PipelineRuntime';
import { flexRowBaseStyle, flexRowSpaceBetweenStyle } from 'src/styles/box';
import useTranslation from 'next-translate/useTranslation';
import { Platform } from '@dogu-private/types';

interface Props {
  deviceJob: RoutineDeviceJobBase;
}

const DeviceJobSummary = ({ deviceJob }: Props) => {
  const { t } = useTranslation();

  return (
    <div>
      <Title>{t('routine:deviceJobTitle')}</Title>

      <FlexSpaceBetweenBox>
        <FlexRowBox>
          <Statistic>
            <StatisticTitle>{t('routine:deviceJobStatisticStatusTitle')}</StatisticTitle>
            <div>
              <JobStatusIcon status={deviceJob.status} />
            </div>
          </Statistic>
          <Statistic>
            <StatisticTitle>{t('routine:deviceJobStatisticPlatformTitle')}</StatisticTitle>
            <div>
              <PlatformIcon platform={deviceJob.device?.platform ?? Platform.UNRECOGNIZED} />
            </div>
          </Statistic>
          <Statistic>
            <StatisticTitle>{t('routine:deviceJobStatisticVersionTitle')}</StatisticTitle>
            <div>{deviceJob.device?.version}</div>
          </Statistic>
          <Statistic>
            <StatisticTitle>{t('routine:deviceJobStatisticNameTitle')}</StatisticTitle>
            <div>{deviceJob.device?.name}</div>
          </Statistic>
          <Statistic>
            <StatisticTitle>{t('routine:deviceJobStatisticModelTitle')}</StatisticTitle>
            <div>
              {deviceJob.device?.modelName} {`(${deviceJob.device?.model})`}
            </div>
          </Statistic>
          <Statistic>
            <StatisticTitle>{t('routine:deviceJobStatisticRuntimeTitle')}</StatisticTitle>
            <div>
              <PipelineRuntime
                status={deviceJob.status}
                startedAt={deviceJob.inProgressAt && new Date(deviceJob.inProgressAt)}
                endedAt={deviceJob.completedAt && new Date(deviceJob.completedAt)}
              />
            </div>
          </Statistic>
        </FlexRowBox>
      </FlexSpaceBetweenBox>
    </div>
  );
};

export default DeviceJobSummary;

const Title = styled.p`
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const Content = styled.div`
  padding: 1rem;
`;

const FlexRowBox = styled.div`
  ${flexRowBaseStyle}
`;

const FlexSpaceBetweenBox = styled.div`
  ${flexRowSpaceBetweenStyle}
`;

const Statistic = styled.div`
  margin-right: 2rem;
`;

const StatisticTitle = styled.p`
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.gray6};
  margin-bottom: 0.5rem;
`;
