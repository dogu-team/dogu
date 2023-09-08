import { Alert } from 'antd';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import Cookies from 'universal-cookie';
import { USER_ID_COOKIE_NAME } from '@dogu-private/types';
import useTranslation from 'next-translate/useTranslation';
import Trans from 'next-translate/Trans';

import { TutorialSupportLanguage, REMOTE_SAMPLE_GIT_URL, TutorialSupportPlatform, tutorialSdkSupportInfo, TutorialSupportSdk } from '../../../resources/tutorials/index';
import { flexRowBaseStyle } from '../../../styles/box';
import GuideAnchor from '../GuideAnchor';
import GuideBanner from '../GuideBanner';
import GuideLayout from '../GuideLayout';
import GuideStep from '../GuideStep';
import DoneStep from './DoneStep';
import useTutorialSelector from '../../../hooks/useTutorialSelector';
import TutorialOptionSelectors from '../TutorialOptionSelectors';
import CodeWithCopyButton from '../../common/CodeWithCopyButton';
import RemoteTestResultList from './RemoteTestResultList';
import PythonVirtualEnvShell from '../PythonVirtualEnvShell';
import { RemoteTutorialProps, seleniumRemoteTutorialGuideData } from '../../../resources/tutorials/remote';

const INTRODUCTION_ID = 'introduction';
const PROJECT_SETUP_ID = 'project-setup';
const INSTALL_DEPENDENCIES_ID = 'install-dependencies';
const SET_CAPABILITIES_ID = 'set-capabilities';
const RUN_TEST_ID = 'run-test';
const RESULT_ID = 'result';
const DONE_ID = 'done';

const SeleniumRemoteTutorial = ({ organizationId, projectId }: RemoteTutorialProps) => {
  const { framework, platform, target } = useTutorialSelector({
    defaultFramework: tutorialSdkSupportInfo[TutorialSupportSdk.SELENIUM].defaultOptions.framework,
    defaultPlatform: tutorialSdkSupportInfo[TutorialSupportSdk.SELENIUM].defaultOptions.platform,
    defaultTarget: tutorialSdkSupportInfo[TutorialSupportSdk.SELENIUM].defaultOptions.target,
  });
  const [capabilityCode, setCapabilityCode] = useState<string>('');
  const { t } = useTranslation('tutorial');

  const selectedGuide = seleniumRemoteTutorialGuideData.guides.find((data) => data.framework === framework && data.target === target && data.platform === platform);
  const frameworkLanguage = Object.keys(tutorialSdkSupportInfo[TutorialSupportSdk.SELENIUM].frameworksPerLang).find((language) =>
    tutorialSdkSupportInfo[TutorialSupportSdk.SELENIUM].frameworksPerLang[language as TutorialSupportLanguage]?.includes(framework),
  );

  useEffect(() => {
    const updateCapabilityCode = async () => {
      if (!selectedGuide) {
        return;
      }

      const code = await seleniumRemoteTutorialGuideData.generateCapabilitiesCode({
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
            <TutorialOptionSelectors sdk={TutorialSupportSdk.SELENIUM} selectedFramwork={framework} selectedPlatform={platform} selectedTarget={target} />
          </div>

          <GuideAnchor
            items={[
              { id: INTRODUCTION_ID, title: t('remoteTestTutorialIntroAnchorTitle') },
              { id: PROJECT_SETUP_ID, title: t('remoteTestTutorialSampleProjectSetupAnchorTitle') },
              { id: INSTALL_DEPENDENCIES_ID, title: t('remoteTestTutorialInstallDependenciesAnchorTitle') },
              { id: SET_CAPABILITIES_ID, title: t('remoteTestTutorialSetCapabilitiesAnchorTitle') },
              { id: RUN_TEST_ID, title: t('remoteTestTutorialRunTestAnchorTitle') },
              { id: RESULT_ID, title: t('remoteTestTutorialCheckResultAnchorTitle') },
              { id: DONE_ID, title: t('doneStepTitle') },
            ]}
          />
        </div>
      }
      content={
        <div>
          <GuideStep id={INTRODUCTION_ID} title={t('remoteTestTutorialIntroTitle')} description={<p>{t('remoteTestTutorialIntroDescription')}</p>} content={null} />
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
                  components={{ code: <StyledCode />, link: <a href="https://docs.dogutech.io/test-automation/selenium" target="_blank" />, br: <br /> }}
                />
              </p>
            }
            content={<CodeWithCopyButton language={'json'} code={capabilityCode} />}
          />
          <GuideStep
            id={RUN_TEST_ID}
            title={t('remoteTestTutorialRunTestTitle')}
            description={<p>{t('remoteTestTutorialRunTestDescription')}</p>}
            content={
              <>
                {platform === TutorialSupportPlatform.MACOS && (
                  <Alert
                    message={
                      <p>
                        For Safari in macOS, please run <CodeWithCopyButton language="bash" code="sudo /usr/bin/safaridriver --enable" /> for testing.
                      </p>
                    }
                  />
                )}
                <CodeWithCopyButton language="bash" code={selectedGuide?.runCommand ?? ''} />
                {frameworkLanguage === TutorialSupportLanguage.PYTHON && <Alert message={t('remoteTestTutorialPytonErrorMessage')} type="info" showIcon />}
              </>
            }
          />

          <div style={{ marginBottom: '2rem' }}>
            <GuideBanner docsUrl="https://docs.dogutech.io/test-automation/appium" />
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

export default SeleniumRemoteTutorial;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;

const StyledCode = styled.code`
  font-size: 0.875rem;
  font-family: 'Fira Code', monospace;
  padding: 0.25rem;
  border-radius: 0.25rem;
  background-color: #e8e8e8;
`;
