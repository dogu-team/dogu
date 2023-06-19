import { BookOutlined, GitlabOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import Trans from 'next-translate/Trans';
import { config } from '../../../config';
import useGitlabAlert from '../../hooks/useGitlabAlert';

interface Props {
  organizationId: string;
  projectId: string;
  path: string;
}

export const GitlabIDEButton = (props: Props) => {
  const { alertGitlab } = useGitlabAlert();
  const getGitlabIDEUrl = () => {
    return `${config.gitlab.url}/-/ide/project/${props.organizationId}/${props.projectId}/tree/main/-/${props.path}/`;
  };

  return (
    <a target="_blank" href={getGitlabIDEUrl()} rel="noopener noreferrer">
      <Button style={{ display: 'flex', justifyItems: 'center', alignItems: 'center' }} onClick={alertGitlab}>
        <Trans i18nKey="project-script:editorEditOnGitlabButtonTitle" components={{ icon: <BookOutlined style={{ margin: '0 0.25rem' }} /> }} />
      </Button>
    </a>
  );
};
