import { USER_ID_COOKIE_NAME } from '@dogu-private/types';
import { Alert } from 'antd';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Cookies from 'universal-cookie';
import useTranslation from 'next-translate/useTranslation';
import Trans from 'next-translate/Trans';

import useTutorialSelector from '../../../hooks/useTutorialSelector';
import {
  TutorialSupportLanguage,
  TutorialSupportPlatform,
  TutorialSupportTarget,
  REMOTE_SAMPLE_GIT_URL,
  TutorialSupportSdk,
} from '../../../resources/tutorials/index';
import {
  gamiumRemoteTutorialGuideData,
  RemoteTutorialProps,
  remoteTutorialSdkSupportInfo,
} from '../../../resources/tutorials/remote';
import CodeWithCopyButton from '../../common/CodeWithCopyButton';
import DoneStep from './DoneStep';
import GuideAnchor from '../GuideAnchor';
import GuideBanner from '../GuideBanner';
import GuideLayout from '../GuideLayout';
import GuideStep from '../GuideStep';
import PythonVirtualEnvShell from '../PythonVirtualEnvShell';
import TutorialOptionSelectors from '../TutorialOptionSelectors';
import RemoteTestResultList from './RemoteTestResultList';
import SampleApplicationUploadStep from '../SampleApplicationUploadStep';
import { DoguDocsUrl } from '../../../utils/url';

const INTRODUCTION_ID = 'introduction';
const PROJECT_SETUP_ID = 'project-setup';
const INSTALL_DEPENDENCIES_ID = 'install-dependencies';
const SET_CAPABILITIES_ID = 'set-capabilities';
const UPLOAD_SAMPLE_APP_ID = 'upload-sample-app';
const RUN_TEST_ID = 'run-test';
const RESULT_ID = 'result';
const DONE_ID = 'done';

const GamiumRemoteTutorial = ({ organizationId, projectId }: RemoteTutorialProps) => {
  const { framework, platform, target } = useTutorialSelector({
    defaultFramework: remoteTutorialSdkSupportInfo[TutorialSupportSdk.GAMIUM].defaultOptions.framework,
    defaultPlatform: remoteTutorialSdkSupportInfo[TutorialSupportSdk.GAMIUM].defaultOptions.platform,
    defaultTarget: remoteTutorialSdkSupportInfo[TutorialSupportSdk.GAMIUM].defaultOptions.target,
  });
  const [capabilityCode, setCapabilityCode] = useState<string>('');
  const { t } = useTranslation('tutorial');

  const selectedGuide = gamiumRemoteTutorialGuideData.guides.find(
    (data) => data.framework === framework && data.target === target && data.platform === platform,
  );
  const frameworkLanguage = Object.keys(remoteTutorialSdkSupportInfo[TutorialSupportSdk.GAMIUM].frameworksPerLang).find(
    (language) =>
      remoteTutorialSdkSupportInfo[TutorialSupportSdk.GAMIUM].frameworksPerLang[
        language as TutorialSupportLanguage
      ]?.includes(framework),
  );

  useEffect(() => {
    const updateCapabilityCode = async () => {
      if (!selectedGuide) {
        return;
      }

      const code = await gamiumRemoteTutorialGuideData.generateCapabilitiesCode({
        orgId: organizationId,
        projectId,
        framework,
        platform,
        target,
        userId: new Cookies().get(USER_ID_COOKIE_NAME),
      });
      setCapabilityCode(code);
    };

    updateCapabilityCode();
  }, [selectedGuide, framework, target, platform, organizationId, projectId]);

  return (
    <GuideLayout
      sidebar={
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <TutorialOptionSelectors
              sdk={TutorialSupportSdk.GAMIUM}
              sdkSupportInfo={remoteTutorialSdkSupportInfo[TutorialSupportSdk.GAMIUM]}
              selectedFramwork={framework}
              selectedPlatform={platform}
              selectedTarget={target}
            />
          </div>

          <GuideAnchor
            items={[
              { id: INTRODUCTION_ID, title: t('remoteTestTutorialIntroAnchorTitle') },
              { id: PROJECT_SETUP_ID, title: t('remoteTestTutorialSampleProjectSetupAnchorTitle') },
              {
                id: INSTALL_DEPENDENCIES_ID,
                title: t('remoteTestTutorialInstallDependenciesAnchorTitle'),
              },
              { id: SET_CAPABILITIES_ID, title: t('remoteTestTutorialSetCapabilitiesAnchorTitle') },
              {
                id: UPLOAD_SAMPLE_APP_ID,
                title: t('remoteTestTutorialUploadSampleAppAnchorTitle'),
              },
              { id: RUN_TEST_ID, title: t('remoteTestTutorialRunTestAnchorTitle') },
              { id: RESULT_ID, title: t('remoteTestTutorialCheckResultAnchorTitle') },
              { id: DONE_ID, title: t('doneStepTitle') },
            ]}
          />
        </div>
      }
      content={
        <div>
          <GuideStep
            id={INTRODUCTION_ID}
            title={t('remoteTestTutorialIntroTitle')}
            description={<p>{t('remoteTestTutorialIntroDescription')}</p>}
            content={null}
          />
          <GuideStep
            id={PROJECT_SETUP_ID}
            title={t('remoteTestTutorialSampleProjectSetupTitle')}
            description={<p>{t('remoteTestTutorialSampleProjectSetupDescription')}</p>}
            content={
              <>
                <CodeWithCopyButton language="bash" code={`git clone ${REMOTE_SAMPLE_GIT_URL}`} />
                <CodeWithCopyButton language="bash" code={selectedGuide?.cd ?? ''} />
                {frameworkLanguage === TutorialSupportLanguage.PYTHON && (
                  <div style={{ marginTop: '.5rem' }}>
                    <p>{t('remoteTestTutorialInstallDependenciesVenvDescription')}</p>
                    <PythonVirtualEnvShell />
                  </div>
                )}
              </>
            }
          />
          <GuideStep
            id={INSTALL_DEPENDENCIES_ID}
            title={t('remoteTestTutorialInstallDependenciesTitle')}
            description={<p>{t('remoteTestTutorialInstallDependenciesDescription')}</p>}
            content={<CodeWithCopyButton language="bash" code={selectedGuide?.installDependencies ?? ''} />}
          />
          <GuideStep
            id={SET_CAPABILITIES_ID}
            title={t('remoteTestTutorialSetCapabilitiesTitle')}
            description={
              <p>
                <Trans
                  i18nKey="tutorial:remoteTestTutorialSetCapabilitiesDescription"
                  components={{
                    code: <StyledCode />,
                    link: <a href={DoguDocsUrl['test-automation'].gamium()} target="_blank" />,
                    br: <br />,
                  }}
                />
              </p>
            }
            content={<CodeWithCopyButton language={'json'} code={capabilityCode} />}
          />
          <GuideStep
            id={UPLOAD_SAMPLE_APP_ID}
            title={t('remoteTestTutorialUploadSampleAppTitle')}
            description={<p>{t('remoteTestTutorialUploadSampleAppDescription')}</p>}
            content={<SampleApplicationUploadStep hasSampleApp={selectedGuide?.hasSampleApp} category="game" />}
          />
          <GuideStep
            id={RUN_TEST_ID}
            title={t('remoteTestTutorialRunTestTitle')}
            description={<p>{t('remoteTestTutorialRunTestDescription')}</p>}
            content={
              target === TutorialSupportTarget.APP && platform === TutorialSupportPlatform.IOS ? (
                <Alert message={t('runTestNotSupportMessage')} showIcon type="warning" />
              ) : (
                <>
                  <CodeWithCopyButton language="bash" code={selectedGuide?.runCommand ?? ''} />
                  {frameworkLanguage === TutorialSupportLanguage.PYTHON && (
                    <Alert message={t('remoteTestTutorialPytonErrorMessage')} type="info" showIcon />
                  )}
                </>
              )
            }
          />
          <div style={{ marginBottom: '2rem' }}>
            <GuideBanner docsUrl={DoguDocsUrl['test-automation'].gamium()} />
          </div>

          <GuideStep
            id={RESULT_ID}
            title={t('remoteTestTutorialCheckResultTitle')}
            description={<p>{t('remoteTestTutorialCheckResultDescription')}</p>}
            content={<RemoteTestResultList />}
          />
          <DoneStep id={DONE_ID} />
        </div>
      }
    />
  );
};

export default GamiumRemoteTutorial;

const StyledCode = styled.code`
  font-size: 0.875rem;
  font-family: 'Fira Code', monospace;
  padding: 0.25rem;
  border-radius: 0.25rem;
  background-color: #e8e8e8;
`;
