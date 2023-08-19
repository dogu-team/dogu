import { MobileOutlined } from '@ant-design/icons';
import { RoutineDeviceJobBase, RoutineJobBase } from '@dogu-private/console';
import { PIPELINE_STATUS } from '@dogu-private/types';
import { sort } from 'ramda';
import styled from 'styled-components';

import { isDesktop } from '../../utils/device';
import DeviceLiveCell from '../device/DeviceLiveCell';

interface Props {
  routineJobs: RoutineJobBase[];
}

const PipelineDeviceGrid = ({ routineJobs }: Props) => {
  const jobs = routineJobs
    .map((routineJob) => {
      if (routineJob.status === PIPELINE_STATUS.IN_PROGRESS) {
        return routineJob.routineDeviceJobs;
      }
    })
    .flat()
    .filter((item) => !!item) as RoutineDeviceJobBase[];

  if (jobs.length === 0) {
    return (
      <EmptyBox>
        <MobileOutlined style={{ fontSize: '4rem' }} />
        <p style={{ marginTop: '2rem' }}>No device running...!</p>
      </EmptyBox>
    );
  }

  return (
    <Box>
      {sort((a, b) => Number(isDesktop(a.device)) - Number(isDesktop(b.device)), jobs).map((deviceJob) => {
        if (deviceJob?.status === PIPELINE_STATUS.IN_PROGRESS) {
          const desktop = isDesktop(deviceJob.device);
          return (
            <CellWrapper key={deviceJob.routineDeviceJobId} isDesktop={desktop}>
              <div>
                <DeviceLiveCell device={deviceJob.device} />
              </div>
            </CellWrapper>
          );
        }

        return null;
      })}
    </Box>
  );
};

export default PipelineDeviceGrid;

const Box = styled.div`
  display: grid;
  grid-auto-rows: auto;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem 1rem;

  @media only screen and (max-width: 1520px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const EmptyBox = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 5rem 0;
  align-items: center;
  justify-content: center;
`;

const CellWrapper = styled.div<{ isDesktop: boolean }>`
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 0.5rem;
  ${(props) => (props.isDesktop ? 'grid-column: 1 / span 3;' : '')}
`;
