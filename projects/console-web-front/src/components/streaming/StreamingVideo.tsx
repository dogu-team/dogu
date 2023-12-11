import { LoadingOutlined } from '@ant-design/icons';
import Trans from 'next-translate/Trans';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import useDeviceStreamingContext from '../../hooks/streaming/useDeviceStreamingContext';
import { flexRowCenteredStyle } from '../../styles/box';

export type VideoSize = { width: number; height: number };

interface Props {
  videoId?: string;
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
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void | Promise<void>;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void | Promise<void>;
  readonly?: boolean;
}

const StreamingVideo = ({
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
  onFocus,
  onBlur,
  readonly,
}: Props) => {
  const { videoRef, loading, deviceScreenshotBase64, isCloudDevice } = useDeviceStreamingContext();
  const [videoOriginSize, setVideoOriginSize] = useState<VideoSize>({ width: 0, height: 0 });
  const boxRef = useRef<HTMLDivElement>(null);
  const [boxSize, setBoxSize] = useState<{ width: number; height: number }>(() => {
    if (boxRef.current) {
      return { width: boxRef.current.clientWidth, height: boxRef.current.clientHeight };
    }

    return { width: 0, height: 0 };
  });
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResizeWindow = (e: UIEvent) => {
      if (boxRef.current) {
        setBoxSize({ width: boxRef.current.clientWidth, height: boxRef.current.clientHeight });
      }
    };

    // initialize width, height
    setBoxSize({ width: boxRef.current?.clientWidth ?? 0, height: boxRef.current?.clientHeight ?? 0 });

    window.addEventListener('resize', handleResizeWindow);

    return () => {
      window.removeEventListener('resize', handleResizeWindow);
    };
  }, []);

  // if ratio > 1, width > height
  const videoRatio = videoOriginSize.height > 0 ? videoOriginSize.width / videoOriginSize.height : 0;

  useEffect(() => {
    const ref = videoRef as React.MutableRefObject<HTMLVideoElement>;

    const handleResize = (event: UIEvent) => {
      if (ref.current) {
        setVideoOriginSize({ width: ref.current.videoWidth, height: ref.current.videoHeight });
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

  const focusInputForKeyboardEvent = () => inputRef.current?.focus({ preventScroll: true });

  const getVideoWidth = () => {
    return boxSize.width && boxSize.height
      ? Math.min(videoOriginSize.width * (boxSize.height / videoOriginSize.height), boxSize.width)
      : undefined;
  };

  return (
    <VideoWrapper ref={boxRef} style={style}>
      {loading && (
        <LoadingBox>
          <LoadingOutlined style={{ fontSize: '2rem' }} />
          <p style={{ lineHeight: '1.4' }}>
            {isCloudDevice ? (
              <Trans
                i18nKey="device-streaming:cloudDeviceStreamingLoadingText"
                components={{
                  br: <br />,
                }}
              />
            ) : (
              <Trans
                i18nKey="device-streaming:deviceStreamingLoadingText"
                components={{
                  br: <br />,
                  link: <Link href="https://docs.dogutech.io/device-farm/device/trouble-shooting" target="_blank" />,
                }}
              />
            )}
          </p>
        </LoadingBox>
      )}

      <InputWrapper canDisplay={!loading} ratio={videoRatio} videoWidth={getVideoWidth()}>
        <StyledVideo
          ref={videoRef}
          id={videoId}
          playsInline
          autoPlay
          muted
          boxHeight={boxRef.current?.clientHeight ?? 0}
        />
        {!!deviceScreenshotBase64 && (
          // eslint-disable-next-line @next/next/no-img-element
          <Image
            src={`data:image/;base64,${deviceScreenshotBase64}`}
            alt="device screenshot"
            fill
            style={{ cursor: 'none' }}
          />
        )}
        {!readonly && (
          <StyledInput
            ref={inputRef}
            autoFocus
            onKeyPress={(e) => {
              e.preventDefault();
              // e.stopPropagation();
              onKeyDown?.(e);
            }}
            onKeyDown={(e) => {
              e.preventDefault();
              // e.stopPropagation();
              onKeyPress?.(e);
            }}
            onKeyUp={(e) => {
              e.preventDefault();
              // e.stopPropagation();
              onKeyUp?.(e);
            }}
            value={`\n`.repeat(1000)}
            onWheel={(e) => {
              e.currentTarget.scrollTop = 1000;
              e.stopPropagation();
              onWheel?.(e, videoOriginSize);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              // e.stopPropagation();
              onMouseDown?.(e, videoOriginSize);
            }}
            onMouseUp={(e) => {
              e.preventDefault();
              // e.stopPropagation();
              onMouseUp?.(e, videoOriginSize);
            }}
            onMouseMove={(e) => {
              e.preventDefault();
              // e.stopPropagation();
              onMouseMove?.(e, videoOriginSize);
              focusInputForKeyboardEvent();
            }}
            onMouseLeave={(e) => {
              e.preventDefault();
              // e.stopPropagation();
              onMouseLeave?.(e, videoOriginSize);
              focusInputForKeyboardEvent();
            }}
            onDoubleClick={(e) => {
              e.preventDefault();
              // e.stopPropagation();
              onDoubleClick?.(e, videoOriginSize);
              focusInputForKeyboardEvent();
            }}
            onClick={(e) => {
              e.preventDefault();
              // e.stopPropagation();
              onClick?.(e, videoOriginSize);
              focusInputForKeyboardEvent();
            }}
            onFocus={(e) => {
              e.preventDefault();
              // e.stopPropagation();
              onFocus?.(e);
            }}
            onBlur={(e) => {
              e.preventDefault();
              // e.stopPropagation();
              onBlur?.(e);
            }}
            readOnly
          />
        )}
        {children}
        <CustomPointer ref={cursorRef} />
      </InputWrapper>
    </VideoWrapper>
  );
};

export default React.memo(StreamingVideo);

const VideoWrapper = styled.div`
  display: flex;
  height: 90%;
  justify-content: center;
  align-items: center;
  flex: 1;
  min-width: 400px;
  min-height: 400px;
`;

const InputWrapper = styled.div<{ canDisplay: boolean; ratio: number; videoWidth?: number }>`
  display: ${(props) => (props.canDisplay ? 'block' : 'none')};
  position: relative;
  height: auto;
  max-height: 100%;
  background-color: #000;
  ${(props) => (props.ratio > 1 ? `` : props.videoWidth ? `width: ${props.videoWidth}px;` : 'width: auto;')}
  overflow: hidden;
  border-radius: 1rem;
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
