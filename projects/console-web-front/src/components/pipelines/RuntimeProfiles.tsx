import { RuntimeInfoResponse } from '@dogu-private/console';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { flexRowCenteredStyle } from '../../styles/box';
import { stringifyDuration } from '../../utils/date';

import { DeviceRuntimeInfoParser } from '../../utils/runtime-info-parser';
import CpuUsageGraph from '../graphs/CpuUsageGraph';
import FpsGraph from '../graphs/FpsGraph';
import MemoryUsageGraph from '../graphs/MemoryUsageGraph';

interface Props {
  profileData: RuntimeInfoResponse;
  startedAt: Date;
  endedAt: Date;
}

const RuntimeProfiles = ({ profileData, startedAt, endedAt }: Props) => {
  const router = useRouter();
  const { t } = useTranslation();

  const runtimeInfoParser = new DeviceRuntimeInfoParser({ locale: router.locale });
  const cpuInfos = runtimeInfoParser.parseCpuUsage(profileData.deviceRuntimeInfos ?? [], {
    duration: true,
    startedAt,
  });
  const memoryInfos = runtimeInfoParser.parseMemoryUsage(profileData.deviceRuntimeInfos ?? [], {
    duration: true,
    startedAt,
  });
  const fpsInfos = runtimeInfoParser.parseFps(profileData.gameRuntimeInfos ?? [], {
    duration: true,
    startedAt,
  });
  const xDomains = runtimeInfoParser.getDurationXAxisDomains(startedAt, endedAt);

  return (
    <div style={{ padding: '1rem' }}>
      <GraphContent>
        <GraphTitle>{t('common:deviceProfileCpuUsage')}</GraphTitle>
        <CpuUsageGraph
          data={cpuInfos}
          durationTicks={xDomains}
          durationTicksFormatter={(value) => stringifyDuration(value)}
          empty={
            <EmptyContent>
              <EmptyTitle>{t('routine:destTestNoGraphDataTitle')}</EmptyTitle>
              <EmptyDescription>{t('routine:destTestNoCpuGraphDataDescription')}</EmptyDescription>
            </EmptyContent>
          }
        />
      </GraphContent>
      <GraphContent>
        <GraphTitle>{t('common:deviceProfileMemoryUsage')}</GraphTitle>
        <p style={{ margin: '.5rem 0' }}>
          {t('common:deviceProfileMemoryMax')}: {memoryInfos?.[0]?.total ?? '-'}GB
        </p>
        <MemoryUsageGraph
          data={memoryInfos}
          durationTicks={xDomains}
          durationTicksFormatter={(value) => stringifyDuration(value)}
          empty={
            <EmptyContent>
              <EmptyTitle>{t('routine:destTestNoGraphDataTitle')}</EmptyTitle>
              <EmptyDescription>{t('routine:destTestNoMemoryGraphDataDescription')}</EmptyDescription>
            </EmptyContent>
          }
        />
      </GraphContent>
      <GraphContent>
        <GraphTitle>{t('common:deviceProfileFps')}</GraphTitle>
        <FpsGraph
          data={fpsInfos}
          durationTicks={xDomains}
          durationTicksFormatter={(value) => stringifyDuration(value)}
          empty={
            <EmptyContent>
              <EmptyTitle>{t('routine:destTestNoGraphDataTitle')}</EmptyTitle>
              <EmptyDescription>{t('routine:destTestNoFpsGraphDataDescription')}</EmptyDescription>
            </EmptyContent>
          }
        />
      </GraphContent>
    </div>
  );
};

export default RuntimeProfiles;

const GraphContent = styled.div`
  margin-bottom: 1rem;
`;

const GraphTitle = styled.p`
  margin-bottom: 0.5rem;
  font-weight: 700;
  line-height: 1.4;
`;

const EmptyContent = styled.div`
  ${flexRowCenteredStyle}
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const EmptyTitle = styled.b`
  font-size: 1.1rem;
  font-weight: 700;
`;

const EmptyDescription = styled.p`
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;
