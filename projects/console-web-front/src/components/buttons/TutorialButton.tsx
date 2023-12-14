import { BookOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import Link, { LinkProps } from 'next/link';
import { HTMLAttributeAnchorTarget } from 'react';
import styled from 'styled-components';

interface Props extends LinkProps {
  translationKey?: string;
  target?: HTMLAttributeAnchorTarget;
  style?: React.CSSProperties;
}

const TutorialButton = ({ href, style, target = '_blank', translationKey = 'guideDocs', ...props }: Props) => {
  const { t } = useTranslation('common');

  return (
    <Link {...props} href={href} style={style} target={target}>
      <StyledButton icon={<BookOutlined />}>{t(translationKey)}</StyledButton>
    </Link>
  );
};

export default TutorialButton;

const StyledButton = styled(Button)`
  background-color: #edf7ff;
  border: 1px solid #1696e6;

  &:hover {
    color: #000000 !important;
    border: 1px solid #16abe6 !important;
  }

  &:active {
    color: ${(props) => props.theme.colorPrimary} !important;
  }
`;
