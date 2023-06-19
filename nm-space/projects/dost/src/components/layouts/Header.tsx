import { ColorMode, Flex, Image, useColorMode } from '@chakra-ui/react';
import styled from 'styled-components';

import useEnvironmentStore from '../../stores/environment';
import WindowsTitleButtonContainer from './WindowsTitleButtonContainer';

interface Props {
  right?: React.ReactNode;
}

const Header = ({ right }: Props) => {
  const platform = useEnvironmentStore((state) => state.platform);
  const { colorMode } = useColorMode();

  return (
    <StyledHeader mode={colorMode}>
      <DostTitleWrapper style={{ paddingLeft: platform === 'darwin' ? '64px' : '0' }}>
        <DostTitle>Dost</DostTitle>
      </DostTitleWrapper>

      <Flex alignItems="center">
        <div style={{ padding: '0 1rem' }}>{right}</div>
        {platform === 'win32' && <WindowsTitleButtonContainer />}
      </Flex>
    </StyledHeader>
  );
};

export default Header;

const StyledHeader = styled.header<{ mode: ColorMode }>`
  position: sticky;
  top: 0;
  display: flex;
  height: 42px;
  justify-content: space-between;
  align-items: center;
  -webkit-app-region: drag;
  background-color: ${(props) => (props.mode === 'dark' ? '#000000' : 'var(--chakra-colors-gray-100)')};
  z-index: 999;

  button {
    -webkit-app-region: no-drag;
  }
`;

const DostTitleWrapper = styled.div`
  margin-left: 1rem;
`;

const DostTitle = styled.p`
  font-size: 16px;
  font-weight: 700;
  -webkit-user-select: none;
  -webkit-app-region: drag;
`;
