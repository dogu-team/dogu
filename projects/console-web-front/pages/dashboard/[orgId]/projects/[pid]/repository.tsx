import styled from 'styled-components';
import { Button, Divider, Input } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import Head from 'next/head';
import Image from 'next/image';

import { NextPageWithLayout } from 'pages/_app';
import ProjectLayout from 'src/components/layouts/ProjectLayout';
import resources from 'src/resources';
import TextCopyInput from 'src/components/common/TextCopyInput';
import withProjectRepository, { getProjectRepositoryPageServerSideProps, WithProjectRepositoryProps } from 'src/hoc/withProjectRepository';
import { config } from '../../../../../config';

const RepositoryPage: NextPageWithLayout<WithProjectRepositoryProps> = ({ organization, project, user }) => {
  const { t } = useTranslation('project');
  // const gitlabDomain = process.env.NEXT_PUBLIC_DOGU_GITLAB_URL.replace('https://', '');
  const gitCloneCommand = `git clone ${config.gitlab.protocol}://${user.name}:${user.gitlab?.gitlabToken}@${config.gitlab.host}:${config.gitlab.port}/${organization.organizationId}/${project.projectId}.git`;

  return (
    <>
      <Head>
        <title>Project settings - {project.name} | Dogu</title>
      </Head>
      <Box>
        {/* <Content>
          <ContentTitle>{t('project-repository:projectRepositoryTitle')}</ContentTitle>
          <Button>
            {t('project-repository:projectRepositoryOpenButton')}
            <Image src={resources.icons.externalLink} width={16} height={16} alt="external link" />
          </Button>
        </Content> */}
        <Content>
          <ContentTitle>{t('project-repository:projectRepositoryCloneTitle')}</ContentTitle>
          <TextCopyInput value={gitCloneCommand} />
        </Content>
        <Divider />
        {/* <DangerZone>
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
        </DangerZone> */}
      </Box>
    </>
  );
};

RepositoryPage.getLayout = (page) => {
  return <ProjectLayout>{page}</ProjectLayout>;
};

export const getServerSideProps = getProjectRepositoryPageServerSideProps;

export default withProjectRepository(RepositoryPage);

const Box = styled.div`
  max-width: 50rem;
`;

const Content = styled.div`
  margin-bottom: 24px;
`;

const ContentTitle = styled.p`
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
`;
