import React from 'react';
import { ColorMode, useColorMode } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  link: string;
  startsWith?: boolean;
}

const SiderButton = ({ link, startsWith, ...props }: Props) => {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const location = useLocation();
  const selected = startsWith ? location.pathname.startsWith(link) : location.pathname === link;

  return <Button selected={selected} mode={colorMode} onClick={() => navigate(link)} {...props} />;
};

export default React.memo(SiderButton);

const Button = styled.button<{ selected?: boolean; mode: ColorMode }>`
  position: relative;
  display: flex;
  width: 100%;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  align-items: center;
  background-color: ${(props) => (props.selected ? `var(--chakra-colors-gray-${props.mode === 'dark' ? '700' : '300'})` : 'transparent')};

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background-color: ${(props) => (props.selected ? 'var(--chakra-colors-blue-500)' : 'transparent')};
  }
`;
