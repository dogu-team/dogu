import styled from 'styled-components';

import DeviceStreaming from '../../../components/streaming/DeviceStreaming';
import useDeviceStreamingContext from '../../../hooks/streaming/useDeviceStreamingContext';
import KeyboardInput from './KeyboardInput';
import VisualScreenActionBar from './VisualScreenActionBar';

const VisualTestingScreenViewer = () => {
  const { loading, device, deviceRTCCaller } = useDeviceStreamingContext();

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
      />

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
