import { LoadingOutlined } from '@ant-design/icons';
import Trans from 'next-translate/Trans';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import useDeviceInput from '../../hooks/streaming/useDeviceInput';
import useDeviceStreamingContext from '../../hooks/streaming/useDeviceStreamingContext';
import useInspector from '../../hooks/streaming/useInspector';
import { flexRowCenteredStyle } from '../../styles/box';

export type VideoSize = { width: number; height: number };

interface Props {
  videoId?: string;
  rightSidebar?: React.ReactNode;
  children?: React.ReactNode;
  onResize?: (e: UIEvent) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onKeyUp?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onWheel?: (e: React.WheelEvent<HTMLTextAreaElement>, videoSize: VideoSize) => void;
  onMouseDown?: (e: React.MouseEvent<HTMLTextAreaElement>, videoSize: VideoSize) => void;
  onMouseUp?: (e: React.MouseEvent<HTMLTextAreaElement>, videoSize: VideoSize) => void;
  onMouseMove?: (e: React.MouseEvent<HTMLTextAreaElement>, videoSize: VideoSize) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLTextAreaElement>, videoSize: VideoSize) => void;
  onDoubleClick?: (e: React.MouseEvent<HTMLTextAreaElement>, videoSize: VideoSize) => void;
}

const StreamingVideo = ({
  rightSidebar,
  videoId,
  children,
  onResize,
  onKeyPress,
  onKeyDown,
  onKeyUp,
  onWheel,
  onMouseDown,
  onMouseUp,
  onMouseMove,
  onMouseLeave,
  onDoubleClick,
}: Props) => {
  const { mode, videoRef, deviceRTCCaller, loading, updateMode } = useDeviceStreamingContext();
  // const { handleDoubleClick, handleKeyDown, handleKeyUp, handleMouseDown, handleMouseLeave, handleMouseMove, handleMouseUp, handleWheel } = useDeviceInput(
  //   deviceRTCCaller ?? undefined,
  // );
  const boxRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [videoSize, setVideoSize] = useState<VideoSize>({ width: 0, height: 0 });

  // if ratio > 1, width > height
  const videoRatio = videoSize.height > 0 ? videoSize.width / videoSize.height : 0;

  useEffect(() => {
    const ref = videoRef as React.MutableRefObject<HTMLVideoElement>;

    const handleResize = (event: UIEvent) => {
      if (ref.current) {
        setVideoSize({ width: ref.current.videoWidth, height: ref.current.videoHeight });
        onResize?.(event);
      }
    };

    if (ref.current) {
      ref.current?.addEventListener('resize', handleResize);
    }

    return () => {
      ref?.current?.removeEventListener('resize', handleResize);
    };
  }, [videoRef, onResize]);

  useEffect(() => {
    const preventContext = (e: Event) => e.preventDefault();

    const target = inputRef.current;

    if (target) {
      target.addEventListener('contextmenu', preventContext);
    }

    return () => {
      if (target) {
        target.removeEventListener('contextmenu', preventContext);
      }
    };
  }, []);

  // const handleMouseDownVideo = useCallback(
  //   (e: React.MouseEvent<HTMLTextAreaElement>, videoSize: { width: number; height: number }) => {
  //     if (mode === 'inspect') {
  //       inspector?.updateInspectingNodeByPos(e);
  //       inspector?.updateSelectedNodeFromInspectingNode();
  //       inspector?.updateHitPoint(e);
  //       updateMode('input');
  //       inspector?.clearInspectingNode();
  //     } else {
  //       handleMouseDown(e, videoSize);
  //     }
  //   },
  //   [handleMouseDown, mode, inspector, updateMode],
  // );

  // const handleMouseMoveVideo = useCallback(
  //   (e: React.MouseEvent<HTMLTextAreaElement>, videoSize: { width: number; height: number }) => {
  //     if (mode === 'inspect') {
  //       inspector?.updateInspectingNodeByPos(e);
  //     }
  //     handleMouseMove(e, videoSize);
  //   },
  //   [handleMouseMove, mode, inspector],
  // );

  // const handleMouseLeaveVideo = useCallback(
  //   (e: React.MouseEvent<HTMLTextAreaElement>, videoSize: { width: number; height: number }) => {
  //     inspector?.clearInspectingNode();
  //     handleMouseLeave(e, videoSize);
  //   },
  //   [handleMouseLeave, inspector],
  // );

  const focusInputForKeyboardEvent = () => inputRef.current?.focus({ preventScroll: true });

  return (
    <VideoWrapper ref={boxRef}>
      {loading && (
        <LoadingBox>
          <LoadingOutlined style={{ fontSize: '2rem' }} />
          <p style={{ lineHeight: '1.4' }}>
            <Trans
              i18nKey="device-streaming:deviceStreamingLoadingText"
              components={{ br: <br />, link: <Link href="https://docs.dogutech.io/device-farm/device/trouble-shooting" target="_blank" /> }}
            />
          </p>
        </LoadingBox>
      )}

      <InputWrapper canDisplay={!loading} ratio={videoRatio} videoWidth={videoRef?.current ? videoSize.width * (videoRef.current.offsetHeight / videoSize.height) : undefined}>
        <StyledVideo ref={videoRef} id={videoId} playsInline autoPlay muted ratio={videoRatio} boxHeight={boxRef.current?.clientHeight ?? 0} />
        <StyledInput
          ref={inputRef}
          autoFocus
          onKeyPress={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onKeyDown?.(e);
          }}
          onKeyDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onKeyPress?.(e);
          }}
          onKeyUp={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onKeyUp?.(e);
          }}
          value={`\n`.repeat(1000)}
          onWheel={(e) => {
            e.currentTarget.scrollTop = 1000;
            e.stopPropagation();
            onWheel?.(e, videoSize);
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onMouseDown?.(e, videoSize);
          }}
          onMouseUp={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onMouseUp?.(e, videoSize);
          }}
          onMouseMove={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onMouseMove?.(e, videoSize);
            focusInputForKeyboardEvent();
          }}
          onMouseLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onMouseLeave?.(e, videoSize);
            focusInputForKeyboardEvent();
          }}
          onDoubleClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDoubleClick?.(e, videoSize);
            focusInputForKeyboardEvent();
          }}
          readOnly
        />

        {children}
      </InputWrapper>
      {rightSidebar}
    </VideoWrapper>
  );
};

export default React.memo(StreamingVideo);

const VideoWrapper = styled.div`
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: flex-start;
  flex: 1;
`;

const InputWrapper = styled.div<{ canDisplay: boolean; ratio: number; videoWidth?: number }>`
  display: ${(props) => (props.canDisplay ? 'block' : 'none')};
  position: relative;
  height: auto;
  max-height: 100%;
  background-color: #000;
  width: ${(props) => (props.ratio > 1 ? `min(max-content, calc(100% * ${props.ratio}))` : props.videoWidth ? `${props.videoWidth}px` : 'auto')};
  overflow: hidden;
`;

const StyledVideo = styled.video<{ ratio: number; boxHeight: number }>`
  display: block;
  width: 100%;
  height: auto;
  max-height: ${(props) => (props.ratio > 1 ? `${props.boxHeight}px` : `${props.boxHeight}px`)};
`;

const StyledInput = styled.textarea`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  padding: 0;
  margin: 0;
  outline: none;
  border: none;
  overflow-y: scroll;
  resize: none;
  z-index: 30;
  cursor: default;
  user-select: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const LoadingBox = styled.div`
  width: 100%;
  height: 90%;
  ${flexRowCenteredStyle}
  flex-direction: column;

  p {
    margin-top: 1rem;
    white-space: pre-wrap;
    text-align: center;
    line-height: 1.4;
  }
`;
