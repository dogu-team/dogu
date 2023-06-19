import { ColorMode, useColorMode } from '@chakra-ui/react';
import styled from 'styled-components';

interface Props extends Omit<React.HTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: React.ReactNode;
  selected?: boolean;
}

const HeaderIconMenuButon = ({ icon, ...props }: Props) => {
  const { colorMode } = useColorMode();

  return (
    <HeaderButton mode={colorMode} {...props}>
      {icon}
    </HeaderButton>
  );
};

const HeaderButton = styled.button<{ mode: ColorMode; selected?: boolean }>`
  display: flex;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => (props.selected ? `var(--chakra-colors-gray-${props.mode === 'light' ? 300 : 700})` : 'transparent')};
  font-size: 16px;

  &:hover {
    background-color: var(--chakra-colors-gray-${(props) => (props.mode === 'light' ? 300 : 700)});
  }
`;

export default HeaderIconMenuButon;
