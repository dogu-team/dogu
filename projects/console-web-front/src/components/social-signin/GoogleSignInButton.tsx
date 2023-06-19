import { CSSProperties } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';
import { Button } from 'antd';

import resources from '../../resources';

interface Props {
  style?: CSSProperties;
  onClick?: () => void;
}

const GoogleSignInButton = ({ style, onClick }: Props) => {
  const { t } = useTranslation();

  return (
    <Link
      href={`${process.env.NEXT_PUBLIC_DOGU_API_BASE_URL}/registery/access/google`}
      style={{
        textDecoration: 'none',
      }}
      onClick={onClick}
    >
      <StyledButton>
        <StyledImage src={resources.icons.googleLogo} width={24} height={24} alt="Google-Login" />
        <StyledP>{t('social-signin:google')}</StyledP>
      </StyledButton>
    </Link>
  );
};

export default GoogleSignInButton;

const StyledButton = styled(Button)`
  display: flex;
  width: 100%;
  height: 36px;
  justify-content: center;
  align-items: center;
`;

const StyledImage = styled(Image)`
  margin-right: 0.5rem;
`;

const StyledP = styled.p`
  font-size: 0.9rem;
`;
