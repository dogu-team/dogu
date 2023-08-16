import { ProjectBase } from '@dogu-private/console';
import { RecordTestCaseId, RecordTestStepId } from '@dogu-private/types';
import { Spin } from 'antd';
import { useCallback } from 'react';
import styled from 'styled-components';
import { shallow } from 'zustand/shallow';

import DeviceStreaming from '../../../components/streaming/DeviceStreaming';
import { VideoSize } from '../../../components/streaming/StreamingVideo';
import useDeviceStreamingContext from '../../../hooks/streaming/useDeviceStreamingContext';
import useRequest from '../../../hooks/useRequest';
import useEventStore from '../../../stores/events';
import { sendErrorNotification } from '../../../utils/antd';
import { createStep } from '../../api/visual';
import KeyboardInput from './KeyboardInput';
import VisualScreenActionBar from './VisualScreenActionBar';

interface Props {
  project: ProjectBase;
  caseId: RecordTestCaseId | undefined;
  stepId: RecordTestStepId | undefined;
}

const VisualTestingScreenViewer = ({ project, caseId, stepId }: Props) => {
  const { loading, device, deviceRTCCaller, videoRef } = useDeviceStreamingContext();
  const [requestLoading, request] = useRequest(createStep);
  const fireEvent = useEventStore((state) => state.fireEvent, shallow);

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLTextAreaElement>, videoSize: VideoSize) => {
      if (!caseId) {
        return;
      }

      try {
        const rv = await request({
          prevRecordTestStepId: stepId ?? null,
          organizationId: project.organizationId,
          projectId: project.projectId,
          recordTestCaseId: caseId,
          actionInfo: {
            type: 'WEBDRIVER_CLICK',
            videoScreenSizeX: videoSize.width,
            videoScreenSizeY: videoSize.height,
            videoScreenPositionX: e.nativeEvent.offsetX,
            videoScreenPositionY: e.nativeEvent.offsetY,
          },
        });
        fireEvent('onRecordStepCreated', rv);
      } catch (e) {
        sendErrorNotification('Failed to take screenshot.');
      }
    },
    [caseId, project.projectId, project.organizationId, request],
  );

  return (
    <VideoWrapper>
      <DeviceStreaming.Video
        rightSidebar={loading ? null : <VisualScreenActionBar />}
        // onKeyPress={handleKeyDown}
        // onKeyDown={handleKeyDown}
        // onKeyUp={handleKeyUp}
        // onWheel={handleWheel}
        // onMouseDown={handleMouseDownVideo}
        // onMouseUp={handleMouseUp}
        // onMouseMove={handleMouseMoveVideo}
        // onMouseLeave={handleMouseLeaveVideo}
        // onDoubleClick={handleDoubleClick}
        onMouseMove={() => {
          console.log('move');
        }}
        onMouseDown={() => {
          console.log('down');
        }}
        onClick={handleClick}
      >
        {requestLoading && (
          <ScreenLoadingWrapper>
            <Spin size="large" />
          </ScreenLoadingWrapper>
        )}
      </DeviceStreaming.Video>

      <KeyboardInput />
    </VideoWrapper>
  );
};

export default VisualTestingScreenViewer;

const VideoWrapper = styled.div`
  position: relative;
  flex: 1;
  width: 100%;
  height: 95%;
`;

const ScreenLoadingWrapper = styled.div`
  position: absolute;
  display: flex;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(17, 17, 17, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 100;
`;
