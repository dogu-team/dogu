import { RoutineDeviceJobBase } from '@dogu-private/console';
import { DEST_TYPE } from '@dogu-private/types';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';
import useTranslation from 'next-translate/useTranslation';

import DestStatusIcon from 'src/components/pipelines/DestStatusIcon';
import JobStatusIcon from 'src/components/pipelines/JobStatusIcon';
import { flexRowBaseStyle } from 'src/styles/box';
import { swrAuthFetcher } from '../../api';
import ErrorBox from '../common/boxes/ErrorBox';
import { isAxiosError } from 'axios';
import { getErrorMessageFromAxios } from '../../utils/error';

const getStartedAtWithFormatted = (d1: Date, d2: Date) => {
  const diff = moment(d2).diff(moment(d1), 'seconds');
  const duration = moment.duration(diff * 1000);
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  return `${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
};

interface Props {
  deviceJob: RoutineDeviceJobBase;
}

const DeviceJobVideoController = ({ deviceJob }: Props) => {
  const router = useRouter();
  const {
    data: recordUrl,
    isLoading: isRecordUrlLoading,
    error: recordUrlError,
  } = useSWR<string>(
    `/organizations/${router.query.orgId}/projects/${router.query.pid}/pipelines/${router.query.pipelineId}/jobs/${router.query.jobId}/device-jobs/${deviceJob.routineDeviceJobId}/record`,
    swrAuthFetcher,
    { revalidateOnFocus: false },
  );
  const {
    data: deviceJobDetail,
    isLoading: isDeviceJobDetailLoading,
    error: deviceJobDetailError,
  } = useSWR<RoutineDeviceJobBase>(
    `/organizations/${router.query.orgId}/projects/${router.query.pid}/pipelines/${router.query.pipelineId}/jobs/${router.query.jobId}/device-jobs/${deviceJob.routineDeviceJobId}/details`,
    swrAuthFetcher,
    { revalidateOnFocus: false },
  );
  const { t } = useTranslation();
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current && recordUrl) {
      ref.current.load();
    }
  }, [recordUrl]);

  const handleClickButton = (startedAt: Date) => {
    const currentTime = moment(startedAt).diff(moment(deviceJob.localInProgressAt).toDate(), 'seconds');

    if (ref.current) {
      ref.current.currentTime = currentTime;
    }
  };

  if (isRecordUrlLoading || isDeviceJobDetailLoading) {
    return <div>Loading...</div>;
  }

  if (!recordUrl || recordUrlError || !deviceJobDetail || deviceJobDetailError) {
    return (
      <ErrorBox
        title="Something went wrong"
        desc={
          isAxiosError(recordUrlError || deviceJobDetailError)
            ? getErrorMessageFromAxios(recordUrlError || deviceJobDetailError)
            : 'Cannot find record URL or device job information.'
        }
      />
    );
  }

  return (
    <Box>
      <StyledVideo ref={ref} controls style={{ height: 300 }}>
        {recordUrl && <source src={recordUrl} type="video/webm" />}
      </StyledVideo>

      <ControllerBox>
        <ControllerTitle>{t('routine:deviceJobRecordController')}</ControllerTitle>

        <ControllerContent>
          {deviceJobDetail.routineSteps?.map((step) => (
            <div key={step.routineStepId}>
              <ControllerStepTitle>
                {t('routine:stepTitle')}:&nbsp;
                <JobStatusIcon status={step.status} />
                &nbsp;
                <b>{step.name}</b>
              </ControllerStepTitle>
              {step.dests && step.dests.length > 0 ? (
                <ControllerDestButtonBox>
                  {step.dests.map((dest, i) =>
                    dest.type === DEST_TYPE.UNIT && !!dest.localInProgressAt && !!dest.localCompletedAt ? (
                      <ControllerButton
                        key={`${step.routineStepId} ${dest.destId}`}
                        onClick={() => handleClickButton(moment(dest.localInProgressAt).toDate())}
                      >
                        {getStartedAtWithFormatted(
                          moment(deviceJob.localInProgressAt).toDate(),
                          moment(dest.localInProgressAt).toDate(),
                        )}
                        &nbsp;
                        <DestStatusIcon state={dest.state} />
                        &nbsp;{dest.name}
                      </ControllerButton>
                    ) : null,
                  )}
                </ControllerDestButtonBox>
              ) : !!step.localInProgressAt && !!step.localCompletedAt ? (
                <div>
                  <ControllerButton onClick={() => handleClickButton(moment(step.localInProgressAt).toDate())}>
                    {getStartedAtWithFormatted(
                      moment(deviceJob.localInProgressAt).toDate(),
                      moment(step.localInProgressAt).toDate(),
                    )}
                    &nbsp;Move to step
                  </ControllerButton>
                </div>
              ) : null}
            </div>
          ))}
        </ControllerContent>
      </ControllerBox>
    </Box>
  );
};

export default React.memo(DeviceJobVideoController);

const Box = styled.div`
  width: 100%;
`;

const StyledVideo = styled.video`
  width: 100%;
`;

const ControllerBox = styled.div`
  margin-top: 1.5rem;
`;

const ControllerTitle = styled.p`
  margin-bottom: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
`;

const ControllerContent = styled.div``;

const ControllerStepTitle = styled.p`
  ${flexRowBaseStyle}
  margin-bottom: 0.25rem;

  b {
    font-weight: 500;
  }
`;

const ControllerDestButtonBox = styled.div`
  padding: 0 1rem 0.5rem;
`;

const ControllerButton = styled.button`
  ${flexRowBaseStyle}
  display: inline-flex;
  margin-right: 0.25rem;
  margin-bottom: 0.25rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  background-color: #fff;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
`;
