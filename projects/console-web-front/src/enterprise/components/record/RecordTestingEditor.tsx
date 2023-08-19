import { RecordTestCaseResponse, RecordTestStepResponse } from '@dogu-private/console';
import { OrganizationId, ProjectId, RecordTestCaseId, RecordTestStepId } from '@dogu-private/types';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../../api/index';
import useRefresh from '../../../hooks/useRefresh';
import useEventStore from '../../../stores/events';
import StepEditor from './StepEditor';
import StepNavigator from './StepNavigator';
import StepPreviewBar from './StepPreviewBar';

const RecordTestingEditor = () => {
  const router = useRouter();
  const orgId = router.query.orgId as OrganizationId;
  const projectId = router.query.pid as ProjectId;
  const caseId = router.query.caseId as RecordTestCaseId | undefined;
  const stepId = router.query.step as RecordTestStepId | undefined;
  const { data, isLoading, error, mutate } = useSWR<RecordTestCaseResponse>(caseId && `/organizations/${orgId}/projects/${projectId}/record-test-cases/${caseId}`, swrAuthFetcher, {
    revalidateOnFocus: false,
  });

  const steps = data?.recordTestSteps ?? [];
  const currentStep = steps.length ? (stepId ? steps.find((step) => step.recordTestStepId === stepId) : steps[steps.length - 1]) : undefined;
  const currentStepPageNumber = currentStep ? steps.indexOf(currentStep) + 1 ?? 0 : 0;

  useRefresh(['onRecordStepCreated'], (payload) => {
    const rv = payload as RecordTestStepResponse;
    if (rv.recordTestCaseId === caseId) {
      mutate((prev) => {
        if (prev) {
          return { ...prev, recordTestSteps: prev?.recordTestSteps?.concat(rv) };
        }
      }).then(() => {
        router.push({ query: { ...router.query, step: rv.recordTestStepId } }, undefined, { shallow: true });
      });
    }
  });

  useEffect(() => {
    const unsub = useEventStore.subscribe(({ eventName, payload }) => {
      if (eventName === 'onRecordStepDeleted') {
        const deletedStep = payload as RecordTestStepResponse;
        mutate((prev) => {
          if (prev) {
            return { ...prev, recordTestSteps: prev?.recordTestSteps?.filter((item) => item.recordTestStepId !== deletedStep.recordTestStepId) };
          }
        });
        if (deletedStep.recordTestCaseId === caseId) {
          if (steps.length === 1) {
            router.push({ query: { ...router.query, step: undefined } }, undefined, { shallow: true });
            return;
          }

          if (currentStepPageNumber === 1) {
            router.push({ query: { ...router.query, step: steps[1]?.recordTestStepId } }, undefined, { shallow: true });
            return;
          }

          router.replace({ query: { ...router.query, step: currentStep?.prevRecordTestStepId } }, undefined, { shallow: true });
        }
      }
    });

    return () => {
      unsub();
    };
  }, [caseId, currentStepPageNumber, currentStep?.prevRecordTestStepId, steps]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data || error) {
    return <div>Something went wrong...</div>;
  }

  return (
    <Box>
      <EditorWrapper>
        <StepWrapper>
          <StepEditor step={currentStep} />
        </StepWrapper>
        <NavigatorWrapper>
          <StepNavigator
            currentStepIndex={currentStepPageNumber}
            totalStepCount={steps.length}
            onCurrentStepIndexChanged={(value) => {
              router.push({ query: { ...router.query, step: steps[value - 1]?.recordTestStepId } }, undefined, { shallow: true });
            }}
            onNextStep={() => {
              router.push({ query: { ...router.query, step: steps[currentStepPageNumber]?.recordTestStepId } }, undefined, { shallow: true });
            }}
            onPrevStep={() => {
              router.push({ query: { ...router.query, step: steps[currentStepPageNumber - 2]?.recordTestStepId } }, undefined, { shallow: true });
            }}
          />
        </NavigatorWrapper>
      </EditorWrapper>
      <PreviewSidebar>
        <StepPreviewBar currentStepIndex={currentStepPageNumber - 1} steps={steps} />
      </PreviewSidebar>
    </Box>
  );
};

export default RecordTestingEditor;

const Box = styled.div`
  display: flex;
  height: 100%;
`;

const Wrapper = styled.div`
  padding: 0 1rem;
`;

const EditorWrapper = styled(Wrapper)`
  flex: 4;
  display: flex;
  flex-direction: column;
`;

const PreviewSidebar = styled(Wrapper)`
  width: 20%;
  min-width: 250px;
  border-left: 1px solid #e5e5e5;
  height: 100%;
  flex-shrink: 0;
  flex: 1;
`;

const StepWrapper = styled.div`
  flex: 1;
`;

const NavigatorWrapper = styled.div`
  margin-top: 1rem;
  height: 2rem;
`;
