import { BookOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import Link, { LinkProps } from 'next/link';
import styled from 'styled-components';

interface Props extends LinkProps {
  style?: React.CSSProperties;
}

const TutorialButton = ({ href, style }: Props) => {
  return (
    <Link href={href} style={style}>
      <StyledButton icon={<BookOutlined />}>Tutorial</StyledButton>
    </Link>
  );
};

export default TutorialButton;

const StyledButton = styled(Button)`
  &:active {
    color: ${(props) => props.theme.colorPrimary} !important;
  }
`;
