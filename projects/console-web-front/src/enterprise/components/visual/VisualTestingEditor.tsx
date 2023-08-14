import { RecordTestCaseBase, RecordTestStepBase } from '@dogu-private/console';
import { OrganizationId, ProjectId, RecordTestCaseId, RecordTestStepId } from '@dogu-private/types';
import { useRouter } from 'next/router';
import { reverse } from 'ramda';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../../api';
import useRefresh from '../../../hooks/useRefresh';
import StepEditor from './StepEditor';
import StepNavigator from './StepNavigator';
import StepPreviewBar from './StepPreviewBar';

const VisualTestingEditor = () => {
  const router = useRouter();
  const orgId = router.query.orgId as OrganizationId;
  const projectId = router.query.pid as ProjectId;
  const caseId = router.query.caseId as RecordTestCaseId | undefined;
  const stepId = router.query.step as RecordTestStepId | undefined;
  const { data, isLoading, error, mutate } = useSWR<RecordTestCaseBase>(caseId && `/organizations/${orgId}/projects/${projectId}/record-test-cases/${caseId}`, swrAuthFetcher, {
    revalidateOnFocus: false,
  });

  const steps = reverse(data?.recordTestSteps ?? []);
  const currentStep = stepId ? steps.find((step) => step.recordTestStepId === stepId) : undefined;
  const currentStepPageNumber = currentStep ? steps.indexOf(currentStep) + 1 ?? 0 : 0;

  useRefresh(['onRecordStepCreated'], (payload) => {
    const rv = payload as RecordTestStepBase;
    if (rv.recordTestCaseId === caseId) {
      mutate();
    }
  });

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

export default VisualTestingEditor;

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
  margin-top: 0.5rem;
  height: 2rem;
`;
