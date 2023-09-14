import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { flexRowBaseStyle } from '../../styles/box';

type Direction = 'vertical' | 'horizontal';

interface Props {
  direction: Direction;
  first: React.ReactNode;
  last: React.ReactNode;
  initFirstSize: number;
  firstStyle?: CSSProperties;
  lastStyle?: CSSProperties;
  firstMinSize?: number;
  firstMaxSize?: number;
  onResize?: (size: number) => void;
}

const ResizableLayout = ({
  direction,
  first,
  last,
  firstStyle,
  lastStyle,
  initFirstSize,
  onResize,
  firstMinSize,
  firstMaxSize,
}: Props) => {
  const [pressPos, setPressPos] = useState<{ x: number; y: number }>();
  const [size, setSize] = useState(initFirstSize);
  const [isPressing, setIsPressing] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!boxRef.current || !firstRef.current || !dividerRef.current) {
      return;
    }

    const newWidthPercent = (initFirstSize / boxRef.current.clientWidth) * 100;

    firstRef.current.style.width = `${newWidthPercent}%`;
    dividerRef.current.style.left = `${newWidthPercent}%`;
  }, [initFirstSize]);

  const handleMove = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      if (!pressPos || !firstRef.current || !dividerRef.current || !boxRef.current) {
        return;
      }

      const dx = e.clientX - pressPos.x;
      const dy = e.clientY - pressPos.y;

      if (direction === 'horizontal') {
        let newWidth = size + dx;
        if (newWidth < 0) {
          newWidth = 0;
        } else if (newWidth > boxRef.current.clientWidth - 10) {
          newWidth = boxRef.current.clientWidth - 10;
        }

        if (firstMinSize !== undefined && newWidth < firstMinSize) {
          newWidth = firstMinSize;
        }

        if (firstMaxSize !== undefined && newWidth > firstMaxSize) {
          newWidth = firstMaxSize;
        }

        const newWidthPercent = (newWidth / boxRef.current.clientWidth) * 100;

        firstRef.current.style.width = `${newWidthPercent}%`;
        dividerRef.current.style.left = `${newWidthPercent}%`;
        onResize?.(newWidth);
      } else {
        let newHeight = size + dy;
        if (newHeight < 0) {
          newHeight = 0;
        } else if (newHeight > boxRef.current.clientHeight - 10) {
          newHeight = boxRef.current.clientHeight - 10;
        }

        firstRef.current.style.height = `${newHeight}px`;
        dividerRef.current.style.top = `${newHeight}px`;
        onResize?.(newHeight);
      }
    },
    [pressPos, direction, size, firstMinSize, firstMaxSize],
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      if (isPressing) {
        setIsPressing(false);
      }
      setPressPos(undefined);
    },
    [isPressing],
  );

  const handleDown = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (firstRef.current) {
      setIsPressing(true);
      setSize(firstRef.current?.clientWidth);
      setPressPos({ x: e.clientX, y: e.clientY });
    }
  }, []);

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.addEventListener('mousemove', handleMove);
      boxRef.current.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      boxRef.current?.removeEventListener('mousemove', handleMove);
      boxRef.current?.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMove, handleMouseUp]);

  return (
    <Box ref={boxRef} direction={direction} isPressing={isPressing}>
      <FirstBoxWrapper ref={firstRef} style={firstStyle} width={initFirstSize}>
        {first}
      </FirstBoxWrapper>
      {!!initFirstSize && (
        <Divider
          initSize={initFirstSize}
          ref={dividerRef}
          direction={direction}
          onMouseDown={handleDown}
          onMouseMove={handleMove}
          onMouseUp={handleMouseUp}
        >
          <div />
        </Divider>
      )}
      <LastBoxWrapper style={lastStyle}>{last}</LastBoxWrapper>
    </Box>
  );
};

export default ResizableLayout;

const Box = styled.div<{ direction: Direction; isPressing: boolean }>`
  ${flexRowBaseStyle}
  position: relative;
  width: 100%;
  height: 100%;
  ${(props) => (props.direction === 'vertical' ? 'flex-direction: column;' : '')}
  align-items: flex-start;
  flex: 1;
  user-select: ${(props) => (props.isPressing ? 'none' : 'auto')};
`;

const Divider = styled.div<{ direction: Direction; initSize: number }>`
  position: absolute;
  top: ${(props) => (props.direction === 'horizontal' ? 0 : `${props.initSize}px`)};
  left: ${(props) => (props.direction === 'horizontal' ? `${props.initSize}px` : 0)};
  ${(props) => (props.direction === 'horizontal' ? 'bottom: 0;' : 'right: 0;')}
  width: ${(props) => (props.direction === 'horizontal' ? '10px' : '100%')};
  height: ${(props) => (props.direction === 'horizontal' ? '100%' : '10px')};
  cursor: ${(props) => (props.direction === 'horizontal' ? 'col-resize' : 'row-resize')};
  flex-shrink: 0;
  background-color: #ffffff;

  div {
    width: ${(props) => (props.direction === 'horizontal' ? '3px' : '100%')};
    height: ${(props) => (props.direction === 'horizontal' ? '100%' : '3px')};
    transition: all 0.2s;
    background-color: #dcdcdc;
  }

  &:hover div {
    background-color: ${(props) => props.theme.colorPrimary};
  }

  &:active div {
    background-color: ${(props) => props.theme.colorPrimary};
  }
`;

const FirstBoxWrapper = styled.div<{ width: number }>`
  width: ${(props) => props.width}px;
  padding: 0.5rem;
  height: 100%;
  overflow: auto;
`;

const LastBoxWrapper = styled.div`
  flex: 1;
  padding-left: 10px;
  height: 100%;
  overflow: auto;
`;
