import { ColorMode, Flex, useColorMode } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ipc } from '../../utils/window';

const WindowsTitleButtonContainer = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const { colorMode } = useColorMode();

  useEffect(() => {
    ipc.windowClient.onMaximize(() => {
      setIsMaximized(true);
    });

    ipc.windowClient.onUnmaximize(() => {
      setIsMaximized(false);
    });
  }, []);

  return (
    <Box>
      <StyledButton
        mode={colorMode}
        onClick={() => {
          ipc.windowClient.minimize();
        }}
      >
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048" focusable="false" fill="currentColor">
            <path d="M2048 819v205H0V819h2048z"></path>
          </svg>
        </div>
      </StyledButton>
      {isMaximized ? (
        <StyledButton
          mode={colorMode}
          onClick={() => {
            ipc.windowClient.unmaximize();
          }}
        >
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048" focusable="false">
              <path d="M2048 1638h-410v410H0V410h410V0h1638v1638zM1434 614H205v1229h1229V614zm409-409H614v205h1024v1024h205V205z"></path>
            </svg>
          </div>
        </StyledButton>
      ) : (
        <StyledButton
          mode={colorMode}
          onClick={() => {
            ipc.windowClient.maximize();
          }}
        >
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048" focusable="false">
              <path d="M1920 128v1792H128V128h1792zm-128 128H256v1536h1536V256z"></path>
            </svg>
          </div>
        </StyledButton>
      )}

      <StyledButton
        closable
        mode={colorMode}
        onClick={() => {
          ipc.windowClient.close();
        }}
      >
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048" focusable="false">
            <path d="M1169 1024l879 879-145 145-879-879-879 879L0 1903l879-879L0 145 145 0l879 879L1903 0l145 145-879 879z"></path>
          </svg>
        </div>
      </StyledButton>
    </Box>
  );
};

export default WindowsTitleButtonContainer;

const Box = styled(Flex)`
  align-items: center;
  app-region: no-drag;
`;

const StyledButton = styled.button<{ closable?: boolean; mode: ColorMode }>`
  display: flex;
  width: 48px;
  height: 42px;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-color: transparent;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${(props) => (props.closable ? '#e81123' : props.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')};
  }

  div {
    width: 12px;
    height: 12px;
  }

  svg {
    height: 100%;
    fill: currentColor;
    vertical-align: top;
    forced-color-adjust: auto;
  }
`;
