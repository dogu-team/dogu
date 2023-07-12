import { BookOutlined, GithubFilled } from '@ant-design/icons';
import { Button } from 'antd';
import Link from 'next/link';
import { SiDiscord } from 'react-icons/si';
import styled from 'styled-components';

import { flexRowBaseStyle } from '../../../styles/box';

interface Props {
  docsUrl?: string;
}

const GuideBanner = ({ docsUrl }: Props) => {
  return (
    <Box>
      <p style={{ marginRight: '1rem' }}>Need help? Please talk to us to help.</p>
      <ButtonWrapper>
        <Link href="https://github.com/dogu-team/dogu" target="_blank">
          <StyledButton icon={<GithubFilled />}>GitHub</StyledButton>
        </Link>
        <Link href="https://discord.com/invite/bVycd6Tu9g" target="_blank">
          <StyledButton icon={<SiDiscord />}>&nbsp;&nbsp;Discord</StyledButton>
        </Link>
        <Link href={docsUrl ?? 'https://docs.dogutech.io'} target="_blank">
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
