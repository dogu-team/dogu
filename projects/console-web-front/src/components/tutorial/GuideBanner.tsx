import { BookOutlined, GithubFilled } from '@ant-design/icons';
import { Button } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';
import { SiSlack } from 'react-icons/si';
import styled from 'styled-components';

import { flexRowBaseStyle } from '../../styles/box';
import { DoguDocsUrl } from '../../utils/url';

interface Props {
  docsUrl?: string;
}

const GuideBanner = ({ docsUrl }: Props) => {
  const { t } = useTranslation('tutorial');

  return (
    <Box>
      <p style={{ marginRight: '1rem' }}>{t('needHelpMessage')}</p>
      <ButtonWrapper>
        <Link
          href="https://join.slack.com/t/dogu-community/shared_invite/zt-1zespy16o-TgYIureSBI6ma6o_nG3gVw"
          target="_blank"
          style={{ textDecoration: 'none' }}
        >
          <StyledButton icon={<SiSlack />}>&nbsp;&nbsp;Slack Community</StyledButton>
        </Link>
        <Link href={docsUrl ?? DoguDocsUrl._index()} target="_blank" style={{ textDecoration: 'none' }}>
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
