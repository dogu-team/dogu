import { MobileOutlined } from '@ant-design/icons';
import { RoutineDeviceJobBase, RoutineJobBase } from '@dogu-private/console';
import { PIPELINE_STATUS } from '@dogu-private/types';
import styled from 'styled-components';
import { GoBrowser } from 'react-icons/go';

import { isDesktop } from '../../utils/device';
import DeviceLiveCell, { DeviceCellInfo } from '../device/DeviceLiveCell';

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

  const mobileJobs = jobs.filter((job) => !isDesktop(job.device));
  const desktopJobs = jobs.filter((job) => isDesktop(job.device));

  return (
    <>
      {mobileJobs.length > 0 && (
        <Box>
          {mobileJobs.map((deviceJob) => {
            if (deviceJob?.status === PIPELINE_STATUS.IN_PROGRESS) {
              return (
                <CellWrapper key={deviceJob.routineDeviceJobId} isDesktop={false}>
                  <div>
                    <DeviceLiveCell device={deviceJob.device} />
                  </div>
                </CellWrapper>
              );
            }

            return null;
          })}
        </Box>
      )}
      {desktopJobs.length > 0 && (
        <DesktopBox>
          {desktopJobs.map((deviceJob) => {
            if (deviceJob?.status === PIPELINE_STATUS.IN_PROGRESS) {
              if (!!deviceJob.browserName && deviceJob.windowProcessId !== null) {
                return (
                  <CellWrapper key={deviceJob.routineDeviceJobId} isDesktop={true}>
                    <div>
                      <DeviceLiveCell device={deviceJob.device} pid={deviceJob.windowProcessId} />
                    </div>
                  </CellWrapper>
                );
              }

              if (deviceJob.device) {
                return (
                  <CellWrapper key={deviceJob.routineDeviceJobId} isDesktop={true}>
                    <DeviceCellInfo device={deviceJob.device} />
                    <EmptyBox>
                      <GoBrowser style={{ fontSize: '4rem' }} />
                      <p style={{ marginTop: '2rem', textAlign: 'center' }}>Waiting for running...!</p>
                    </EmptyBox>
                  </CellWrapper>
                );
              }
            }

            return null;
          })}
        </DesktopBox>
      )}
    </>
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

  @media only screen and (max-width: 1079px) {
    grid-template-columns: repeat(1, 1fr);
  }
`;

const DesktopBox = styled(Box)`
  margin-top: 1rem;
  grid-template-columns: repeat(2, 1fr);

  @media only screen and (max-width: 1279px) {
    grid-template-columns: repeat(1, 1fr);
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
`;
