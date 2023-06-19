import { CSSProperties } from 'react';
import useTranslation from 'next-translate/useTranslation';
import styled from 'styled-components';

import GoogleSignInButton from './GoogleSignInButton';
import SocialSectionBoundary from './SocialSectionBoundary';

interface Props {
  style?: CSSProperties;
  onClickButton?: () => void;
}

const SocialSignInForm = ({ style, onClickButton }: Props) => {
  return (
    <Box>
      <SocialSectionBoundary />
      <GoogleSignInButton onClick={onClickButton} />
    </Box>
  );
};

export default SocialSignInForm;

const Box = styled.div``;
