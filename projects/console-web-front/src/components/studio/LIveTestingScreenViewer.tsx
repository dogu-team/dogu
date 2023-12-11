import { Platform } from '@dogu-private/types';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import styled from 'styled-components';

import useDeviceInput from '../../hooks/streaming/useDeviceInput';
import useDeviceStreamingContext from '../../hooks/streaming/useDeviceStreamingContext';
import { InspectorType, StreamingTabMenuKey } from '../../types/streaming';
import DeviceStreaming from '../streaming/DeviceStreaming';
import GamiumInspectorSelectedNode from '../streaming/GamiumInspectorSelectedNode';
import InspectorSelectedNode from '../streaming/InspectorSelectedNode';
import { VideoSize } from '../streaming/StreamingVideo';

const LiveTestingScreenViewer: React.FC = () => {
  const router = useRouter();
  const { mode, inspectorType, inspector, gamiumInspector, deviceRTCCaller, device, updateMode } =
    useDeviceStreamingContext();
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
        if (inspectorType === InspectorType.APP) {
          // inspector?.updateInspectingNodeByPos(e);
          inspector?.updateSelectedNodeFromInspectingNode();
        } else {
          // gamiumInspector?.throttleInpsectOnScreen(e);
          gamiumInspector?.updateSelectedNodeFromInspectingNode();
        }
        updateMode('input');
      } else {
        handleMouseDown(e, videoSize);
      }
    },
    [
      handleMouseDown,
      mode,
      // inspector?.updateInspectingNodeByPos,
      inspector?.updateSelectedNodeFromInspectingNode,
      inspectorType,
      gamiumInspector?.updateSelectedNodeFromInspectingNode,
      // gamiumInspector?.throttleInpsectOnScreen,
      updateMode,
    ],
  );

  const handleMouseMoveVideo = useCallback(
    (e: React.MouseEvent<HTMLTextAreaElement>, videoSize: VideoSize) => {
      if (mode === 'inspect') {
        if (inspectorType === InspectorType.APP) {
          inspector?.updateInspectingNodeByPos(e);
          // inspector?.updateHitPoint(e);
        } else {
          gamiumInspector?.throttleInpsectOnScreen(e);
        }
      }
      handleMouseMove(e, videoSize);
    },
    [
      handleMouseMove,
      mode,
      inspector?.updateInspectingNodeByPos,
      gamiumInspector?.throttleInpsectOnScreen,
      inspectorType,
    ],
  );

  const handleMouseLeaveVideo = useCallback(
    (e: React.MouseEvent<HTMLTextAreaElement>, videoSize: VideoSize) => {
      inspector?.clearInspectingNode();
      gamiumInspector?.clearInspectingNode();
      handleMouseLeave(e, videoSize);
    },
    [handleMouseLeave, inspector?.clearInspectingNode, gamiumInspector?.clearInspectingNode],
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
        {tab === StreamingTabMenuKey.INSPECTOR && inspectorType === InspectorType.APP && inspector?.inspectingNode && (
          <InspectorSelectedNode nodeInfo={inspector.inspectingNode} />
        )}
        {tab === StreamingTabMenuKey.INSPECTOR &&
          inspectorType === InspectorType.GAME &&
          gamiumInspector?.gamiumInspectingNode && (
            <GamiumInspectorSelectedNode nodeInfo={gamiumInspector.gamiumInspectingNode} />
          )}
      </DeviceStreaming.Video>
    </VideoWrapper>
  );
};

export default LiveTestingScreenViewer;

const VideoWrapper = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
`;
