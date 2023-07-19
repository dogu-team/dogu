import { BookOutlined, GithubFilled } from '@ant-design/icons';
import { Button } from 'antd';
import Link from 'next/link';
import { SiSlack } from 'react-icons/si';
import styled from 'styled-components';

import { flexRowBaseStyle } from '../../styles/box';

interface Props {
  docsUrl?: string;
}

const GuideBanner = ({ docsUrl }: Props) => {
  return (
    <Box>
      <p style={{ marginRight: '1rem' }}>Need help? Please talk to us to help.</p>
      <ButtonWrapper>
        <Link href="https://github.com/dogu-team/dogu/discussions" target="_blank" style={{ textDecoration: 'none' }}>
          <StyledButton icon={<GithubFilled />}>Discussions</StyledButton>
        </Link>
        <Link href="https://join.slack.com/t/dogu-community/shared_invite/zt-1zespy16o-TgYIureSBI6ma6o_nG3gVw" target="_blank">
          <StyledButton icon={<SiSlack />}>&nbsp;&nbsp;Slack</StyledButton>
        </Link>
        <Link href={docsUrl ?? 'https://docs.dogutech.io'} target="_blank" style={{ textDecoration: 'none' }}>
          <StyledButton icon={<BookOutlined />}>Documentation</StyledButton>
        </Link>
      </ButtonWrapper>
    </Box>
  );
};

export default GuideBanner;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;

const Box = styled(FlexRow)`
  padding: 0 1rem;
  height: 48px;
  background-color: #f7f6d0;
  border-radius: 4px;
`;

const ButtonWrapper = styled(FlexRow)`
  button {
    margin-right: 0.5rem;
  }
`;

const StyledButton = styled(Button)`
  ${flexRowBaseStyle}
`;
