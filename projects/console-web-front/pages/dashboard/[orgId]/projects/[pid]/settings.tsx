import { ProjectBase } from '@dogu-private/console';
import { PROJECT_DESC_MAX_LENGTH, PROJECT_DESC_MIN_LENGTH, PROJECT_NAME_MAX_LENGTH, PROJECT_NAME_MIN_LENGTH, PROJECT_SCM_TYPE } from '@dogu-private/types';
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
import { getErrorMessageFromAxios } from 'src/utils/error';
import { getProjectPageServerSideProps, ProjectServerSideProps } from 'src/ssr/project';
import { sendErrorNotification, sendSuccessNotification } from '../../../../../src/utils/antd';
import DangerZone from '../../../../../src/components/common/boxes/DangerZone';
import TokenCopyInput from '../../../../../src/components/common/TokenCopyInput';
import RegenerateTokenButton from '../../../../../src/components/common/RegenerateTokenButton';
import AccessTokenButton from '../../../../../src/components/common/AccessTokenButton';
import ProjectLayoutWithSidebar from '../../../../../src/components/layouts/ProjectLayoutWithSidebar';
import useEventStore from '../../../../../src/stores/events';
import GithubButton from '../../../../../src/components/integration/GithubButton';
import GitlabButton from '../../../../../src/components/integration/GitlabButton';
import useRefresh from '../../../../../src/hooks/useRefresh';
import SettingTitleDivider from '../../../../../src/components/common/SettingTitleDivider';
import BitbucketButton from '../../../../../src/components/integration/BitbucketButton';
import UpdateTemplateButton from '../../../../../src/components/projects/UpdateTemplateButton';
import useProjectContext from '../../../../../src/hooks/context/useProjectContext';
import { getRepositoyUrl } from '../../../../../src/utils/url';

const ProjectSettingPage: NextPageWithLayout<ProjectServerSideProps> = ({ project: serverProject, organization }) => {
  const [editingProject, setEditingProject] = useState<ProjectBase>(serverProject);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation('project');
  const router = useRouter();
  const { project, mutate } = useProjectContext();
  const fireEvent = useEventStore((state) => state.fireEvent, shallow);

  useEffect(() => {
    if (serverProject) {
      setEditingProject(clone(serverProject));
    }
  }, [serverProject]);

  useRefresh(['onProjectScmUpdated'], () => mutate?.());

  const handleSave = async () => {
    if (!editingProject) {
      return;
    }

    setLoading(true);
    try {
      const data = await updateProject(organization.organizationId, serverProject.projectId, { name: editingProject?.name, description: editingProject?.description });
      mutate?.(data, false);
      sendSuccessNotification(t('project:projectUpdateSuccessMsg'));
      fireEvent('onProjectUpdated');
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('project:projectUpdateFailedMsg', { reason: getErrorMessageFromAxios(e) }));
      }
    }
    setLoading(false);
  };

  const handleDelete = useCallback(async () => {
    try {
      await deleteProject(organization.organizationId, serverProject.projectId);
      sendSuccessNotification(t('project:projectDeleteSuccessMsg'));
      router.push(`/dashboard/${organization.organizationId}/projects`);
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('project:projectDeleteFailedMsg', { reason: getErrorMessageFromAxios(e) }));
      }
    }
  }, [organization.organizationId, serverProject.projectId, router]);

  const getToken = useCallback(async () => {
    try {
      const token = getProjectAccessToken(organization.organizationId, serverProject.projectId);
      return token;
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(`Failed to get project token.\n${getErrorMessageFromAxios(e)}`);
      }
    }
  }, [organization.organizationId, serverProject.projectId]);

  const isChanged =
    JSON.stringify({ name: project?.name, description: project?.description }) !== JSON.stringify({ name: editingProject.name, description: editingProject.description });

  if (!project) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Project settings - {serverProject.name} | Dogu</title>
      </Head>
      <Box>
        <SettingTitleDivider title="General" style={{ marginTop: '1rem' }} />
        <Content>
          <div style={{ marginBottom: '1rem' }}>
            <Label>{t('project:organizationIdLabel')}</Label>
            <TokenCopyInput value={organization.organizationId} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <Label>{t('project:projectIdLabel')}</Label>
            <TokenCopyInput value={serverProject.projectId} />
          </div>
        </Content>
        <Divider />
        <Content>
          <Label>{t('project:settingNameInputLabel')}</Label>
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
          <Label>{t('project:settingDescInputLabel')}</Label>
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

        <SettingTitleDivider title="Token" />
        <Content>
          <Label>Project Access Token</Label>
          <AccessTokenButton getToken={getToken} />
        </Content>

        <SettingTitleDivider title="Integrations" />
        <Content>
          <div>
            <GithubButton
              isConnected={project.projectScms?.[0]?.type === PROJECT_SCM_TYPE.GITHUB}
              disabled={!!project.projectScms && project.projectScms.length > 0 && project.projectScms[0].type !== PROJECT_SCM_TYPE.GITHUB}
              organizationId={organization.organizationId}
              projectId={project.projectId}
              description={
                project.projectScms?.[0]?.type === PROJECT_SCM_TYPE.GITHUB ? (
                  <>
                    Integrated with{' '}
                    <a href={project.projectScms[0].url} target="_blank">
                      {getRepositoyUrl(project.projectScms[0].url)}
                    </a>
                  </>
                ) : undefined
              }
            />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <GitlabButton
              isConnected={project.projectScms?.[0]?.type === PROJECT_SCM_TYPE.GITLAB}
              disabled={!!project.projectScms && project.projectScms.length > 0 && project.projectScms[0].type !== PROJECT_SCM_TYPE.GITLAB}
              organizationId={organization.organizationId}
              projectId={project.projectId}
              description={
                project.projectScms?.[0]?.type === PROJECT_SCM_TYPE.GITLAB ? (
                  <>
                    Integrated with{' '}
                    <a href={project.projectScms[0].url} target="_blank">
                      {getRepositoyUrl(project.projectScms[0].url)}
                    </a>
                  </>
                ) : undefined
              }
            />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <BitbucketButton
              isConnected={project.projectScms?.[0]?.type === PROJECT_SCM_TYPE.BITBUCKET}
              disabled={!!project.projectScms && project.projectScms.length > 0 && project.projectScms[0].type !== PROJECT_SCM_TYPE.BITBUCKET}
              organizationId={organization.organizationId}
              projectId={project.projectId}
              description={
                project.projectScms?.[0]?.type === PROJECT_SCM_TYPE.BITBUCKET ? (
                  <>
                    Integrated with{' '}
                    <a href={project.projectScms[0].url} target="_blank">
                      {getRepositoyUrl(project.projectScms[0].url)}
                    </a>
                  </>
                ) : undefined
              }
            />
          </div>
        </Content>

        <div style={{ marginTop: '3rem' }}>
          <DangerZone>
            {/* <DangerZone.Item title={t('project:editGitIntegrationMenuTitle')} description={t('project:editGitIntegrationDescriptionText')} button={<GitIntegrationDangerButton />} /> */}
            <DangerZone.Item
              title={t('common:regenerateAccessTokenTitle')}
              description={t('common:regenerateAccessTokenDescriptionText')}
              button={<RegenerateTokenButton regenerate={async () => regenerateProjectAccessToken(organization.organizationId, serverProject.projectId)} />}
            />
            <DangerZone.Item
              title={t('project:changeProjectTemplateMenuTitle')}
              description={t('project:changeProjectTemplateDescriptionText')}
              button={<UpdateTemplateButton />}
            />
            <DangerZone.Item
              title={t('project:deleteProjectMenuTitle')}
              description={t('project:deleteProjectDescriptionText')}
              button={
                <DangerZone.Button
                  modalTitle={t('project:deleteProjectConfirmModalTitle')}
                  modalContent={
                    <Trans
                      i18nKey="project:settingDeleteProjectConfirmContent"
                      components={{ b: <b style={{ fontWeight: '700' }} />, br: <br /> }}
                      values={{ name: serverProject.name }}
                    />
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
        </div>
      </Box>
    </>
  );
};

ProjectSettingPage.getLayout = (page) => {
  return (
    <ProjectLayoutWithSidebar {...page.props} titleI18nKey="project:tabMenuSettingTitle">
      {page}
    </ProjectLayoutWithSidebar>
  );
};

export const getServerSideProps: GetServerSideProps = getProjectPageServerSideProps;

export default ProjectSettingPage;

const Box = styled.div`
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
`;

const Content = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.p`
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;
