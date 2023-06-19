import { ProjectBase } from '@dogu-private/console';
import { PROJECT_DESC_MAX_LENGTH, PROJECT_DESC_MIN_LENGTH, PROJECT_NAME_MAX_LENGTH, PROJECT_NAME_MIN_LENGTH } from '@dogu-private/types';
import { OrganizationId } from '@dogu-private/types';
import { GetServerSideProps } from 'next';
import { clone } from 'ramda';
import styled from 'styled-components';
import { Button, Divider, Input } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import Trans from 'next-translate/Trans';

import { NextPageWithLayout } from 'pages/_app';
import { deleteProject, updateProject } from 'src/api/project';
import { getErrorMessage } from 'src/utils/error';
import ProjectLayout from 'src/components/layouts/ProjectLayout';
import withProject, { getProjectPageServerSideProps, WithProjectProps } from 'src/hoc/withProject';
import { sendErrorNotification, sendSuccessNotification } from '../../../../../src/utils/antd';
import DangerZone from '../../../../../src/components/common/boxes/DangerZone';
import Head from 'next/head';

const ProjectSettingPage: NextPageWithLayout<WithProjectProps> = ({ project, mutateProject }) => {
  const [editingProject, setEditingProject] = useState<ProjectBase>(project);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation('project');
  const router = useRouter();
  const organizationId = router.query.orgId as OrganizationId;

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
      const data = await updateProject(organizationId, project.projectId, { name: editingProject?.name, description: editingProject?.description });
      mutateProject(data, false);
      sendSuccessNotification(t('project:projectUpdateSuccessMsg'));
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('project:projectUpdateFailedMsg', { reason: getErrorMessage(e) }));
      }
    }
    setLoading(false);
  };

  const handleDelete = useCallback(async () => {
    try {
      await deleteProject(organizationId, project.projectId);
      sendSuccessNotification(t('project:projectDeleteSuccessMsg'));
      router.push(`/dashboard/${organizationId}/projects`);
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('project:projectDeleteFailedMsg', { reason: getErrorMessage(e) }));
      }
    }
  }, [organizationId, project.projectId, router]);

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
        <Button type="primary" onClick={handleSave} disabled={loading || !isChanged}>
          {t('common:save')}
        </Button>
        <Divider />
        <DangerZone>
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
  return <ProjectLayout isWebview={page.props.isWebview}>{page}</ProjectLayout>;
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
