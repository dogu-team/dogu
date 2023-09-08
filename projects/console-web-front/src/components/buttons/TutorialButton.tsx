import { BookOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import Link, { LinkProps } from 'next/link';
import styled from 'styled-components';

interface Props extends LinkProps {
  style?: React.CSSProperties;
}

const TutorialButton = ({ href, style, ...props }: Props) => {
  const { t } = useTranslation('common');

  return (
    <Link {...props} href={href} style={style}>
      <StyledButton icon={<BookOutlined />}>{t('tutorial')}</StyledButton>
    </Link>
  );
};

export default TutorialButton;

const StyledButton = styled(Button)`
  &:active {
    color: ${(props) => props.theme.colorPrimary} !important;
  }
`;
