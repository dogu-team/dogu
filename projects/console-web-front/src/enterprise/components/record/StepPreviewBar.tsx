import { RecordTestStepBase } from '@dogu-private/console';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import useEventStore from '../../../stores/events';

import StepPreview from './StepPreview';

interface Props {
  steps: RecordTestStepBase[];
  currentStepIndex: number;
}

const StepPreviewBar = ({ steps, currentStepIndex }: Props) => {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = useEventStore.subscribe(({ eventName }) => {
      if (eventName === 'onRecordStepCreated') {
        if (wrapperRef.current) {
          wrapperRef.current.scrollTo({ top: wrapperRef.current.scrollHeight, behavior: 'smooth' });
        }
      }
    });

    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    if (router.query.step && currentStepIndex > -1 && wrapperRef.current) {
      wrapperRef.current.scrollTo({ top: currentStepIndex * 215, behavior: 'smooth' });
    }
  }, [router.query.step, currentStepIndex]);

  return (
    <div style={{ height: '100%' }}>
      <TitleWrapper>
        <Title>Steps</Title>
      </TitleWrapper>
      <PreviewWrapper ref={wrapperRef}>
        {steps.map((item, i) => (
          <StepPreview key={item.recordTestStepId} step={item} index={i} />
        ))}
      </PreviewWrapper>
    </div>
  );
};

export default StepPreviewBar;

const TitleWrapper = styled.div`
  height: 2rem;
`;

const Title = styled.p`
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.gray5};
`;

const PreviewWrapper = styled.div`
  height: calc(100% - 2rem);
  overflow-y: auto;
  padding-right: 0.5rem;

  &::-webkit-scrollbar {
    width: 8px;
    background: #fff;
  }

  &::-webkit-scrollbar-track {
    background: #fff;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
`;
