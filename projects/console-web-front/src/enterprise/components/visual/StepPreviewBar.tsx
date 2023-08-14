import { RecordTestCaseBase, RecordTestStepBase } from '@dogu-private/console';
import { useRouter } from 'next/router';
import { reverse } from 'ramda';
import { useRef } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../../api';
import useRefresh from '../../../hooks/useRefresh';
import StepPreview from './StepPreview';

const StepPreviewBar = () => {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const orgId = router.query.orgId;
  const projectId = router.query.pid;
  const caseId = router.query.caseId;
  const { data, isLoading, error, mutate } = useSWR<RecordTestCaseBase>(`/organizations/${orgId}/projects/${projectId}/record-test-cases/${caseId}`, swrAuthFetcher, {
    revalidateOnFocus: false,
  });

  useRefresh(['onRecordStepCreated'], (payload) => {
    const rv = payload as RecordTestStepBase;
    if (rv.recordTestCaseId === caseId) {
      mutate().then(() => {
        wrapperRef.current?.scrollTo({ top: wrapperRef.current.scrollHeight, behavior: 'smooth' });
      });
    }
  });

  return (
    <div style={{ height: '100%' }}>
      <TitleWrapper>
        <Title>Steps</Title>
      </TitleWrapper>
      <PreviewWrapper ref={wrapperRef}>
        {isLoading && <div>Loading...</div>}
        {error && <div>Something went wrong...</div>}
        {data && data.recordTestSteps && reverse(data.recordTestSteps).map((item) => <StepPreview key={item.recordTestStepId} step={item} />)}
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
