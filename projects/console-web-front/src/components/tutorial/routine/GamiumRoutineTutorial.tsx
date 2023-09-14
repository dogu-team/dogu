import styled from 'styled-components';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import useTutorialSelector from '../../../hooks/useTutorialSelector';
import {
  ROUTINE_SAMPLE_GIT_URL,
  TutorialSupportLanguage,
  TutorialSupportSdk,
  TutorialSupportTarget,
} from '../../../resources/tutorials';
import { gamiumRoutineTutorialData, routineTutorialSdkSupportInfo } from '../../../resources/tutorials/routine';
import CodeWithCopyButton from '../../common/CodeWithCopyButton';
import DoneStep from './DoneStep';
import GuideAnchor from '../GuideAnchor';
import GuideLayout from '../GuideLayout';
import GuideStep from '../GuideStep';
import TutorialOptionSelectors from '../TutorialOptionSelectors';
import RoutineGitTutorial from './RoutineGitTutorial';
import PipelineListController from '../../pipelines/PipelineListController';
import useTutorialContext from '../../../hooks/context/useTutorialContext';
import ErrorBox from '../../common/boxes/ErrorBox';
import RunRoutineButton from '../../pipelines/RunRoutineButton';
import TableListView from '../../common/TableListView';
import RefreshButton from '../../buttons/RefreshButton';
import { flexRowSpaceBetweenStyle } from '../../../styles/box';
import SampleApplicationUploadStep from '../SampleApplicationUploadStep';
import TutorialRoutineCreator from './TutorialRoutineCreator';
import DoguText from '../../common/DoguText';

const INTRODUCTION_ID = 'introduction';
const CLONE_GIT_ID = 'clone-git';
const INTEGRATE_WITH_GIT_ID = 'integrate-with-git';
const UPLOAD_SAMPLE_APP_ID = 'upload-sample-app';
const CREATE_ROUTINE_ID = 'create-routine';
const RUN_ROUTINE_ID = 'run-routine';
const DONE_ID = 'done';

const GamiumRoutineTutorial = () => {
  const { project } = useTutorialContext();
  const { framework, platform, target } = useTutorialSelector({
    defaultFramework: routineTutorialSdkSupportInfo[TutorialSupportSdk.GAMIUM].defaultOptions.framework,
    defaultPlatform: routineTutorialSdkSupportInfo[TutorialSupportSdk.GAMIUM].defaultOptions.platform,
    defaultTarget: routineTutorialSdkSupportInfo[TutorialSupportSdk.GAMIUM].defaultOptions.target,
  });
  const { t } = useTranslation('tutorial');

  const selectedGuide = gamiumRoutineTutorialData.guides.find(
    (data) => data.framework === framework && data.target === target && data.platform === platform,
  );
  const frameworkLanguage = Object.keys(
    routineTutorialSdkSupportInfo[TutorialSupportSdk.APPIUM].frameworksPerLang,
  ).find(
    (language) =>
      routineTutorialSdkSupportInfo[TutorialSupportSdk.APPIUM].frameworksPerLang[
        language as TutorialSupportLanguage
      ]?.includes(framework),
  );

  const APP_ROUTINE_SAMPLE = `name: sample-routine

on:
  workflow_dispatch:

jobs:
  sample-job:
    runs-on:
      group:
        - android
    appVersion:
    record: true
    steps:
      - name: run test
        uses: dogu-actions/run-test
        with:
          checkout: true
          environment: ${selectedGuide?.environment ?? ''}
          command: |
            ${selectedGuide?.command ?? ''}
        cwd: ${selectedGuide?.cwd ?? ''}
`;

  if (!project) {
    return <ErrorBox title="Something went wrong" desc="Project not found" />;
  }

  return (
    <GuideLayout
      sidebar={
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <TutorialOptionSelectors
              sdk={TutorialSupportSdk.GAMIUM}
              sdkSupportInfo={routineTutorialSdkSupportInfo[TutorialSupportSdk.GAMIUM]}
              selectedFramwork={framework}
              selectedPlatform={platform}
              selectedTarget={target}
            />
          </div>

          <GuideAnchor
            items={[
              { id: INTRODUCTION_ID, title: t('routineTutorialIntroAnchorTitle') },
              { id: CLONE_GIT_ID, title: t('routineTutorialRepositoryConfigurationAnchorTitle') },
              {
                id: INTEGRATE_WITH_GIT_ID,
                title: t('routineTutorialGitIntegrationAnchorTitle'),
              },
              { id: UPLOAD_SAMPLE_APP_ID, title: t('routineTutorialUploadSampleAppAnchorTitle') },
              { id: CREATE_ROUTINE_ID, title: t('routineTutorialCreateRoutineAnchorTitle') },
              { id: RUN_ROUTINE_ID, title: t('routineTutorialRunRoutineAnchorTitle') },
              { id: DONE_ID, title: t('doneStepTitle') },
            ]}
          />
        </div>
      }
      content={
        <div>
          <GuideStep
            id={INTRODUCTION_ID}
            title={t('routineTutorialIntroTitle')}
            description={
              <p>
                <Trans i18nKey="tutorial:routineTutorialIntroDescription" components={{ br: <br /> }} />
              </p>
            }
            content={null}
          />
          <GuideStep
            id={CLONE_GIT_ID}
            title={t('routineTutorialRepositoryConfigurationTitle')}
            description={
              <p>
                <Trans
                  i18nKey="tutorial:routineTutorialRepositoryConfigurationDescription"
                  components={{
                    dogu: <DoguText />,
                  }}
                />
              </p>
            }
            content={
              <div>
                <CodeWithCopyButton language="bash" code={`git clone ${ROUTINE_SAMPLE_GIT_URL}`} />
              </div>
            }
          />
          <GuideStep
            id={INTEGRATE_WITH_GIT_ID}
            title={t('routineTutorialGitIntegrationTitle')}
            description={<p>{t('routineTutorialGitIntegrationDescription')}</p>}
            content={<RoutineGitTutorial />}
          />
          <GuideStep
            id={UPLOAD_SAMPLE_APP_ID}
            title={t('routineTutorialUploadSampleAppTitle')}
            description={<p>{t('routineTutorialUploadSampleAppDescription')}</p>}
            content={<SampleApplicationUploadStep hasSampleApp={selectedGuide?.hasSampleApp} category="game" />}
          />
          <GuideStep
            id={CREATE_ROUTINE_ID}
            title={t('routineTutorialCreateRoutineTitle')}
            description={<p>{t('routineTutorialCreateRoutineDescription')}</p>}
            content={
              <div style={{ marginTop: '1rem' }}>
                <TutorialRoutineCreator project={project} sampleYaml={APP_ROUTINE_SAMPLE} />
              </div>
            }
          />
          <GuideStep
            id={RUN_ROUTINE_ID}
            title={t('routineTutorialRunRoutineTitle')}
            description={<p>{t('routineTutorialRunRoutineDescription')}</p>}
            content={
              <TableListView
                top={
                  <FlexSpaceBetween>
                    <RunRoutineButton orgId={project.organizationId} projectId={project.projectId} />
                    <RefreshButton />
                  </FlexSpaceBetween>
                }
                table={
                  <PipelineListController
                    organizationId={project.organizationId}
                    projectId={project.projectId}
                    hideEmpty
                  />
                }
              />
            }
          />
          <DoneStep id={DONE_ID} />
        </div>
      }
    />
  );
};

export default GamiumRoutineTutorial;

const FlexSpaceBetween = styled.div`
  ${flexRowSpaceBetweenStyle}
`;
