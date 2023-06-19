import { RuntimeInfo } from '@dogu-private/types';
import { Collapse } from 'antd';
import { useRouter } from 'next/router';
import React from 'react';
import styled from 'styled-components';

import { DeviceRuntimeInfoParser } from '../../utils/runtime-info-parser';
import CpuUsageGraph from '../graphs/CpuUsageGraph';
import MemoryUsageGraph from '../graphs/MemoryUsageGraph';

interface Props {
  infos: RuntimeInfo[];
}

const DeviceStreamingGraphContainer = ({ infos }: Props) => {
  const router = useRouter();
  const runtimeInfoParser = new DeviceRuntimeInfoParser({ locale: router.locale });
  const cpuInfos = runtimeInfoParser.parseCpuUsage(infos);
  const memoryInfos = runtimeInfoParser.parseMemoryUsage(infos);

  const currentForegroundProc = infos.length > 0 ? infos[infos.length - 1].processes?.find((item) => item.isForeground) : undefined;

  return (
    <>
      <div style={{ padding: '0 0 1rem 2rem' }}>
        <CurrentProcessDesc>
          <b>Current foreground process:</b>&nbsp;
          {currentForegroundProc?.name ?? 'None'}
        </CurrentProcessDesc>
      </div>
      <Collapse defaultActiveKey={['1', '2']} ghost style={{ userSelect: 'none' }}>
        <Collapse.Panel header={<PanelHeader>CPU</PanelHeader>} key="1">
          <CpuUsageGraph data={cpuInfos} />
        </Collapse.Panel>
        <Collapse.Panel header={<PanelHeader>Memory</PanelHeader>} key="2">
          {memoryInfos.length > 0 && (
            <div style={{ padding: '0 0 1rem 2rem' }}>
              <p>Device memory: {memoryInfos[0].total}GB</p>
            </div>
          )}
          <MemoryUsageGraph data={memoryInfos} />
        </Collapse.Panel>
      </Collapse>
    </>
  );
};

export default React.memo(DeviceStreamingGraphContainer);

const PanelHeader = styled.p`
  font-weight: 700;
  user-select: none;
`;

const CurrentProcessDesc = styled.p`
  line-height: 1.4;

  b {
    font-weight: 700;
  }
`;

const TooltipBox = styled.div`
  background-color: #ffffff;
  padding: 0.5rem;
  border: 1px solid #dcdcdc;
  font-size: 0.8rem;
`;

const TooltipContent = styled.div`
  padding: 0.25rem 0;
`;
