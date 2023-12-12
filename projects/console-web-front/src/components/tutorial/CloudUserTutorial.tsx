import { ProjectBase } from '@dogu-private/console';
import { Button } from 'antd';
import Link from 'next/link';
import { useEffect } from 'react';
import styled from 'styled-components';
import useTranslation from 'next-translate/useTranslation';
import Trans from 'next-translate/Trans';

import useModal from '../../hooks/useModal';
import useTutorialContext from '../../hooks/context/useTutorialContext';
import GuideAnchor from './GuideAnchor';
import GuideLayout from './GuideLayout';
import GuideStep from './GuideStep';
import CreateProjectModal from '../projects/CreateProjectModal';
import DoguText from '../common/DoguText';
import { TUTORIAL_PROJECT_SESSION_KEY } from './DeviceFarmTutorial';
import { DoguDocsUrl } from '../../utils/url';

const INTRODUCTION_ID = 'introduction';
const CREATE_PROJECT_ID = 'create-project';

const CloudUserTutorial = () => {
  const [isProjectModalOpen, openProjectModal, closeProjectModal] = useModal();
  const { project, updateProject, organization } = useTutorialContext();
  const { t } = useTranslation('tutorial');

  useEffect(() => {
    if (organization?.organizationId) {
      const projectRaw = sessionStorage.getItem(TUTORIAL_PROJECT_SESSION_KEY);

      if (projectRaw) {
        const data = JSON.parse(projectRaw) as ProjectBase;
        if (data.organizationId === organization.organizationId) {
          updateProject(data);
        } else {
          sessionStorage.removeItem(TUTORIAL_PROJECT_SESSION_KEY);
        }
      }
    }
  }, [organization?.organizationId]);

  return (
    <GuideLayout
      sidebar={
        <GuideAnchor
          items={[
            { id: INTRODUCTION_ID, title: t('deviceFarmTutorialIntroAnchorTitle') },
            { id: CREATE_PROJECT_ID, title: t('deviceFarmTutorialCreateProjectAnchorTitle') },
          ]}
        />
      }
      content={
        <div>
          <GuideStep
            id={INTRODUCTION_ID}
            title={t('deviceFarmTutorialIntroTitle')}
            content={
              <div>
                <p>
                  <Trans i18nKey="tutorial:deviceFarmTutorialIntroDescription" components={{ dogu: <DoguText /> }} />
                </p>

                <div style={{ marginTop: '.5rem' }}>
                  <p>
                    <Trans
                      i18nKey="tutorial:deviceFarmTutorialIntroDetailDescription"
                      components={{
                        dfLink: <Link href={DoguDocsUrl['device-farm']._index()} target="_blank" />,
                        dftLink: <Link href={DoguDocsUrl['get-started'].tutorials['device-farm']()} target="_blank" />,
                      }}
                    />
                  </p>
                </div>
              </div>
            }
          />
        </div>
      }
    />
  );
};

export default CloudUserTutorial;

const HostTokenWrapper = styled.div`
  max-width: 500px;
`;

const FlexEnd = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const MarginWrapper = styled.div`
  margin-top: 0.5rem;
`;
