import { RecordTestStepResponse } from '@dogu-private/console';
import Image from 'next/image';
import { useRef } from 'react';
import styled from 'styled-components';
import { flexRowCenteredStyle } from '../../../styles/box';
import DeleteStepButton from './DeleteStepButton';

interface Props {
  step: RecordTestStepResponse | undefined;
}

const StepEditor = ({ step }: Props) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);

  const resizeImageAndAddBound = (img: HTMLImageElement) => {
    if (itemRef.current && imageWrapperRef.current) {
      const parentWidth = itemRef.current.clientWidth;
      const parentHeight = itemRef.current.clientHeight;
      const imageWidth = img.naturalWidth;
      const imageHeight = img.naturalHeight;
      const imageRatio = imageWidth / imageHeight;

      imageWrapperRef.current.style.maxHeight = `${parentHeight}px`;

      if (imageRatio > 1) {
        imageWrapperRef.current.style.width = `100%`;
        imageWrapperRef.current.style.height = `${(imageHeight * parentWidth) / imageWidth}px`;
      } else {
        imageWrapperRef.current.style.width = `${(imageWidth * parentHeight) / imageHeight}px`;
        imageWrapperRef.current.style.height = '100%';
      }
    }
  };

  return (
    <Box>
      {step ? (
        <FlexRow>
          <FlexItem ref={itemRef}>
            <RelativeBox ref={imageWrapperRef}>
              <Image
                src={step.screenshotUrl}
                fill
                sizes="(max-width: 767px) 100vw, 33vw"
                quality={90}
                style={{ objectFit: 'contain' }}
                alt={step.recordTestStepId}
                onLoadingComplete={resizeImageAndAddBound}
              />
            </RelativeBox>
          </FlexItem>
          <MenuWrapper>
            <DeleteStepButton step={step} />
          </MenuWrapper>
        </FlexRow>
      ) : (
        <div>Select step!</div>
      )}
    </Box>
  );
};

export default StepEditor;

const Box = styled.div`
  width: 100%;
  height: 100%;
`;

const FlexRow = styled.div`
  display: flex;
  height: 100%;
`;

const MenuWrapper = styled.div`
  width: 2rem;
  margin-left: 0.5rem;
`;

const FlexItem = styled.div`
  display: flex;
  justify-content: center;
  flex: 1;
`;

const RelativeBox = styled.div`
  position: relative;
`;
