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
import { getErrorMessage } from 'src/utils/error';
import withProject, { getProjectPageServerSideProps, WithProjectProps } from 'src/hoc/withProject';
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

  useRefresh(['onProjectScmUpdated'], mutateProject);

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
        <SettingTitleDivider title="General" style={{ marginTop: '1rem' }} />
        <Content>
          <div style={{ marginBottom: '1rem' }}>
            <Label>{t('project:organizationIdLabel')}</Label>
            <TokenCopyInput value={organization.organizationId} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <Label>{t('project:projectIdLabel')}</Label>
            <TokenCopyInput value={project.projectId} />
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
            />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <GitlabButton
              isConnected={project.projectScms?.[0]?.type === PROJECT_SCM_TYPE.GITLAB}
              disabled={!!project.projectScms && project.projectScms.length > 0 && project.projectScms[0].type !== PROJECT_SCM_TYPE.GITLAB}
              organizationId={organization.organizationId}
              projectId={project.projectId}
            />
          </div>
        </Content>

        <div style={{ marginTop: '3rem' }}>
          <DangerZone>
            {/* <DangerZone.Item title={t('project:editGitIntegrationMenuTitle')} description={t('project:editGitIntegrationDescriptionText')} button={<GitIntegrationDangerButton />} /> */}
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
                    <Trans
                      i18nKey="project:settingDeleteProjectConfirmContent"
                      components={{ b: <b style={{ fontWeight: '700' }} />, br: <br /> }}
                      values={{ name: project.name }}
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
  return <ProjectLayoutWithSidebar titleI18nKey="project:tabMenuSettingTitle">{page}</ProjectLayoutWithSidebar>;
};

export const getServerSideProps: GetServerSideProps = getProjectPageServerSideProps;

export default withProject(ProjectSettingPage);

const Box = styled.div`
  max-width: 500px;
`;

const Content = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.p`
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;
