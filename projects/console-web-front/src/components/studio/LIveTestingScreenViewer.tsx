import { Platform } from '@dogu-private/types';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import styled from 'styled-components';

import useDeviceInput from '../../hooks/streaming/useDeviceInput';
import useDeviceStreamingContext from '../../hooks/streaming/useDeviceStreamingContext';
import { StreamingTabMenuKey } from '../../types/streaming';
import DeviceStreaming from '../streaming/DeviceStreaming';
import InspectorSelectedNode from '../streaming/InspectorSelectedNode';
import { VideoSize } from '../streaming/StreamingVideo';

const LiveTestingScreenViewer: React.FC = () => {
  const router = useRouter();
  const { mode, inspector, deviceRTCCaller, device, updateMode } = useDeviceStreamingContext();
  const tab = (router.query.tab as StreamingTabMenuKey | undefined) ?? StreamingTabMenuKey.INFO;
  const {
    handleDoubleClick,
    handleKeyDown,
    handleKeyUp,
    handleMouseDown,
    handleMouseLeave,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleFocus,
    handleBlur,
  } = useDeviceInput(deviceRTCCaller ?? undefined, device?.platform ?? Platform.PLATFORM_UNSPECIFIED);

  const handleMouseDownVideo = useCallback(
    (e: React.MouseEvent<HTMLTextAreaElement>, videoSize: VideoSize) => {
      if (mode === 'inspect') {
        inspector?.updateInspectingNodeByPos(e);
        inspector?.updateSelectedNodeFromInspectingNode();
        inspector?.updateHitPoint(e);
        updateMode('input');
        inspector?.clearInspectingNode();
      } else {
        handleMouseDown(e, videoSize);
      }
    },
    [handleMouseDown, mode, inspector, updateMode],
  );

  const handleMouseMoveVideo = useCallback(
    (e: React.MouseEvent<HTMLTextAreaElement>, videoSize: VideoSize) => {
      if (mode === 'inspect') {
        inspector?.updateInspectingNodeByPos(e);
      }
      handleMouseMove(e, videoSize);
    },
    [handleMouseMove, mode, inspector],
  );

  const handleMouseLeaveVideo = useCallback(
    (e: React.MouseEvent<HTMLTextAreaElement>, videoSize: VideoSize) => {
      inspector?.clearInspectingNode();
      handleMouseLeave(e, videoSize);
    },
    [handleMouseLeave, inspector],
  );

  return (
    <VideoWrapper>
      <DeviceStreaming.Video
        onKeyPress={handleKeyDown}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onWheel={handleWheel}
        onMouseDown={handleMouseDownVideo}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMoveVideo}
        onMouseLeave={handleMouseLeaveVideo}
        onDoubleClick={handleDoubleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {tab === StreamingTabMenuKey.INSPECTOR && !!inspector && inspector.inspectingNode && (
          <InspectorSelectedNode nodeInfo={inspector.inspectingNode} />
        )}
      </DeviceStreaming.Video>
    </VideoWrapper>
  );
};

export default LiveTestingScreenViewer;

const VideoWrapper = styled.div`
  flex: 1;
  width: 100%;
`;
