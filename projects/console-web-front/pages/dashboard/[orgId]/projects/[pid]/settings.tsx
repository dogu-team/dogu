import { ProjectBase } from '@dogu-private/console';
import { PROJECT_DESC_MAX_LENGTH, PROJECT_DESC_MIN_LENGTH, PROJECT_NAME_MAX_LENGTH, PROJECT_NAME_MIN_LENGTH } from '@dogu-private/types';
import { GetServerSideProps } from 'next';
import { clone } from 'ramda';
import styled from 'styled-components';
import { Button, Divider, Input } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import Trans from 'next-translate/Trans';
import Head from 'next/head';
import { shallow } from 'zustand/shallow';

import { NextPageWithLayout } from 'pages/_app';
import { deleteProject, getProjectAccessToken, regenerateProjectAccessToken, updateProject } from 'src/api/project';
import { getErrorMessage } from 'src/utils/error';
import withProject, { getProjectPageServerSideProps, WithProjectProps } from 'src/hoc/withProject';
import { sendErrorNotification, sendSuccessNotification } from '../../../../../src/utils/antd';
import DangerZone from '../../../../../src/components/common/boxes/DangerZone';
import GitIntegrationDangerButton from '../../../../../src/components/projects/GitIntegrationDangerButton';
import TokenCopyInput from '../../../../../src/components/common/TokenCopyInput';
import RegenerateTokenButton from '../../../../../src/components/common/RegenerateTokenButton';
import AccessTokenButton from '../../../../../src/components/common/AccessTokenButton';
import ProjectLayoutWithSidebar from '../../../../../src/components/layouts/ProjectLayoutWithSidebar';
import useEventStore from '../../../../../src/stores/events';
import GithubButton from '../../../../../src/components/integration/GithubButton';
import GitlabButton from '../../../../../src/components/integration/GitlabButton';

const ProjectSettingPage: NextPageWithLayout<WithProjectProps> = ({ project, organization, mutateProject }) => {
  const [editingProject, setEditingProject] = useState<ProjectBase>(project);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation('project');
  const router = useRouter();
  const fireEvent = useEventStore((state) => state.fireEvent, shallow);

  useEffect(() => {
    if (project) {
      setEditingProject(clone(project));
    }
  }, [project]);

  const handleSave = async () => {
    if (!editingProject) {
      return;
    }

    setLoading(true);
    try {
      const data = await updateProject(organization.organizationId, project.projectId, { name: editingProject?.name, description: editingProject?.description });
      mutateProject(data, false);
      sendSuccessNotification(t('project:projectUpdateSuccessMsg'));
      fireEvent('onProjectUpdated');
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('project:projectUpdateFailedMsg', { reason: getErrorMessage(e) }));
      }
    }
    setLoading(false);
  };

  const handleDelete = useCallback(async () => {
    try {
      await deleteProject(organization.organizationId, project.projectId);
      sendSuccessNotification(t('project:projectDeleteSuccessMsg'));
      router.push(`/dashboard/${organization.organizationId}/projects`);
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('project:projectDeleteFailedMsg', { reason: getErrorMessage(e) }));
      }
    }
  }, [organization.organizationId, project.projectId, router]);

  const getToken = useCallback(async () => {
    try {
      const token = getProjectAccessToken(organization.organizationId, project.projectId);
      return token;
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(`Failed to get project token.\n${getErrorMessage(e)}`);
      }
    }
  }, [organization.organizationId, project.projectId]);

  const isChanged = JSON.stringify(project) !== JSON.stringify(editingProject);

  return (
    <>
      <Head>
        <title>Project settings - {project.name} | Dogu</title>
      </Head>
      <Box>
        <Content>
          <ContentTitle>{t('project:settingNameInputLabel')}</ContentTitle>
          <Input
            value={editingProject?.name}
            onChange={(e) =>
              setEditingProject((prev) => {
                return { ...prev, name: e.target.value };
              })
            }
            placeholder={t('project:settingNameInputPH')}
            minLength={PROJECT_NAME_MIN_LENGTH}
            maxLength={PROJECT_NAME_MAX_LENGTH}
          />
        </Content>
        <Content>
          <ContentTitle>{t('project:settingDescInputLabel')}</ContentTitle>
          <Input
            value={editingProject?.description}
            onChange={(e) =>
              setEditingProject((prev) => {
                return { ...prev, description: e.target.value };
              })
            }
            placeholder={t('project:settingDescInputPH')}
            minLength={PROJECT_DESC_MIN_LENGTH}
            maxLength={PROJECT_DESC_MAX_LENGTH}
          />
        </Content>
        <Button type="primary" onClick={handleSave} disabled={loading || !isChanged} access-id="update-project-profile-btn">
          {t('common:save')}
        </Button>
        <Divider />

        <Content>
          <div style={{ marginBottom: '1rem' }}>
            <ContentSubTitle>{t('project:organizationIdLabel')}</ContentSubTitle>
            <TokenCopyInput value={organization.organizationId} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <ContentSubTitle>{t('project:projectIdLabel')}</ContentSubTitle>
            <TokenCopyInput value={project.projectId} />
          </div>
          <div>
            <ContentSubTitle>Project Access Token</ContentSubTitle>
            <AccessTokenButton getToken={getToken} />
          </div>
        </Content>

        <Divider />

        <Content>
          <GithubButton />
          <div style={{ marginBottom: '1rem' }} />
          <GitlabButton />
        </Content>

        <Divider />

        <DangerZone>
          <DangerZone.Item title={t('project:editGitIntegrationMenuTitle')} description={t('project:editGitIntegrationDescriptionText')} button={<GitIntegrationDangerButton />} />
          <DangerZone.Item
            title={t('common:regenerateAccessTokenTitle')}
            description={t('common:regenerateAccessTokenDescriptionText')}
            button={<RegenerateTokenButton regenerate={async () => regenerateProjectAccessToken(organization.organizationId, project.projectId)} />}
          />
          <DangerZone.Item
            title={t('project:deleteProjectMenuTitle')}
            description={t('project:deleteProjectDescriptionText')}
            button={
              <DangerZone.Button
                modalTitle={t('project:deleteProjectConfirmModalTitle')}
                modalContent={
                  <Trans i18nKey="project:settingDeleteProjectConfirmContent" components={{ b: <b style={{ fontWeight: '700' }} />, br: <br /> }} values={{ name: project.name }} />
                }
                onConfirm={handleDelete}
                modalButtonTitle={t('project:deleteProjectConfirmModalButtonText')}
                access-id="delete-project-btn"
                buttonProps={{
                  id: 'delete-project-confirm-btn',
                }}
              >
                {t('project:deleteProjectButtonText')}
              </DangerZone.Button>
            }
          />
        </DangerZone>
      </Box>
    </>
  );
};

ProjectSettingPage.getLayout = (page) => {
  return <ProjectLayoutWithSidebar titleI18nKey="project:tabMenuSettingTitle">{page}</ProjectLayoutWithSidebar>;
};

export const getServerSideProps: GetServerSideProps = getProjectPageServerSideProps;

export default withProject(ProjectSettingPage);

const Box = styled.div`
  max-width: 500px;
`;

const Content = styled.div`
  margin-bottom: 24px;
`;

const ContentTitle = styled.p`
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const ContentSubTitle = styled.p`
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;
