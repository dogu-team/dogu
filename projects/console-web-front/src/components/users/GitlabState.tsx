import { GitlabOutlined } from '@ant-design/icons';
import { UserBase } from '@dogu-private/console';
import { Button, Input } from 'antd';
import Link from 'next/link';
import styled from 'styled-components';
import { config } from '../../../config';
import useGitlabAlert from '../../hooks/useGitlabAlert';

import DoguText from '../common/DoguText';

interface Props {
  user: UserBase;
}

const GitlabState = ({ user }: Props) => {
  const { alertGitlab } = useGitlabAlert();

  return (
    <Box>
      <ContentTitle>email</ContentTitle>
      <Input
        style={{ marginBottom: '1.5rem' }}
        spellCheck={false}
        value={process.env.NEXT_PUBLIC_ENV === 'production' ? user.email : user.userId}
        onChange={(e) => {
          e.preventDefault();
        }}
      />
      <ContentTitle>password</ContentTitle>
      <Input
        disabled
        style={{ marginBottom: '1.5rem' }}
        spellCheck={false}
        value={'current password'}
        onChange={(e) => {
          e.preventDefault();
        }}
      />
      <ContentTitle>token</ContentTitle>
      <Input
        style={{ marginBottom: '1.5rem' }}
        spellCheck={false}
        value={user.gitlab ? user.gitlab.gitlabToken : 'not exist'}
        onChange={(e) => {
          e.preventDefault();
        }}
      />
      <Link href={config.gitlab.url} target="_blank">
        <Button type="default" style={{ width: '100%' }} onClick={alertGitlab}>
          <GitlabOutlined style={{ fontSize: '1rem' }} />
          <DoguText style={{ fontSize: '1rem', margin: '0px 4px' }} />
          Gitlab
        </Button>
      </Link>
    </Box>
  );
};

export default GitlabState;

const Box = styled.div`
  margin-top: 1rem;
`;

const ContentTitle = styled.p`
  font-size: 1rem;
  margin-bottom: 0.5rem;
`;
