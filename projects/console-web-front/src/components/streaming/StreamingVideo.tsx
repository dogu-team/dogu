import { LoadingOutlined } from '@ant-design/icons';
import Trans from 'next-translate/Trans';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import useDeviceStreamingContext from '../../hooks/streaming/useDeviceStreamingContext';
import { flexRowCenteredStyle } from '../../styles/box';

export type VideoSize = { width: number; height: number };

interface Props {
  videoId?: string;
  rightSidebar?: React.ReactNode;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  onResize?: (e: UIEvent) => void | Promise<void>;
  onKeyPress?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void | Promise<void>;
  onKeyUp?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void | Promise<void>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void | Promise<void>;
  onWheel?: (e: React.WheelEvent<HTMLTextAreaElement>, videoSize: VideoSize) => void | Promise<void>;
  onMouseDown?: (e: React.MouseEvent<HTMLTextAreaElement>, videoSize: VideoSize) => void | Promise<void>;
  onMouseUp?: (e: React.MouseEvent<HTMLTextAreaElement>, videoSize: VideoSize) => void | Promise<void>;
  onMouseMove?: (e: React.MouseEvent<HTMLTextAreaElement>, videoSize: VideoSize) => void | Promise<void>;
  onMouseLeave?: (e: React.MouseEvent<HTMLTextAreaElement>, videoSize: VideoSize) => void | Promise<void>;
  onDoubleClick?: (e: React.MouseEvent<HTMLTextAreaElement>, videoSize: VideoSize) => void | Promise<void>;
  onClick?: (e: React.MouseEvent<HTMLTextAreaElement>, videoSize: VideoSize) => void | Promise<void>;
  readonly?: boolean;
}

const StreamingVideo = ({
  rightSidebar,
  videoId,
  children,
  style,
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
  onClick,
  readonly,
}: Props) => {
  const { videoRef, loading } = useDeviceStreamingContext();
  const [videoSize, setVideoSize] = useState<VideoSize>({ width: 0, height: 0 });
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

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
    const moveCursor = (e: MouseEvent) => {
      const mouseY = e.offsetY;
      const mouseX = e.offsetX;

      if (cursorRef.current) {
        cursorRef.current.style.display = 'block';
        cursorRef.current.style.top = `${mouseY - 10}px`;
        cursorRef.current.style.left = `${mouseX - 10}px`;
      }
    };
    const hideCursor = () => {
      if (cursorRef.current) {
        cursorRef.current.style.display = 'none';
      }
    };

    const target = inputRef.current;

    if (target) {
      target.addEventListener('contextmenu', preventContext);
      target.addEventListener('mousemove', moveCursor);
      target.addEventListener('mouseleave', hideCursor);
    }

    return () => {
      if (target) {
        target.removeEventListener('contextmenu', preventContext);
        target.removeEventListener('mousemove', moveCursor);
        target.removeEventListener('mouseleave', hideCursor);
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
    <VideoWrapper ref={boxRef} style={style}>
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
        <StyledVideo ref={videoRef} id={videoId} playsInline autoPlay muted boxHeight={boxRef.current?.clientHeight ?? 0} />
        {!readonly && (
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClick?.(e, videoSize);
              focusInputForKeyboardEvent();
            }}
            readOnly
          />
        )}
        {children}
        <CustomPointer ref={cursorRef} />
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
  ${(props) => (props.ratio > 1 ? `` : props.videoWidth ? `width: ${props.videoWidth}px;` : 'width: auto;')}
  overflow: hidden;
`;

const StyledVideo = styled.video<{ boxHeight: number }>`
  display: block;
  width: 100%;
  height: auto;
  max-height: ${(props) => `${props.boxHeight}px`};
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
  cursor: none;
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

const CustomPointer = styled.div`
  position: absolute;
  display: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: transparent;
  border: 1px solid #efefef;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.7);
`;
