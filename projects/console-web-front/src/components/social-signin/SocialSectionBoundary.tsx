import { CSSProperties } from 'react';
import useTranslation from 'next-translate/useTranslation';
import styled from 'styled-components';

interface Props {
  style?: CSSProperties;
}

const SocialSectionBoundary = ({ style }: Props) => {
  const { t } = useTranslation();

  return (
    <StyledDiv>
      <StyledSpan>{t('social-signin:boundaryText')}</StyledSpan>
    </StyledDiv>
  );
};

export default SocialSectionBoundary;

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;

  &::before {
    display: block;
    background: #ebebeb;
    width: 100%;
    height: 1px;
    content: '';
  }

  &::after {
    display: block;
    background: #ebebeb;
    width: 100%;
    height: 1px;
    content: '';
  }
`;

const StyledSpan = styled.span`
  margin: 0 1rem;
  word-break: keep-all;
`;
