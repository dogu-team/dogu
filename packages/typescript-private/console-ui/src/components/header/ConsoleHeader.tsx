import React, { HTMLAttributes } from 'react';
import { UserBase } from '@dogu-private/console';
import styled, { ThemeProvider } from 'styled-components';

import { styledComponentsTheme } from '../../styles';

interface Props extends HTMLAttributes<HTMLElement> {
  account: React.ReactNode;
}

export const ConsoleHeader: React.FunctionComponent<Props> = ({ account, ...props }): React.ReactElement => {
  return (
    <ThemeProvider theme={styledComponentsTheme}>
      <Box {...props} id="header">
        {account}
      </Box>
    </ThemeProvider>
  );
};

const Box = styled.div`
  -webkit-app-region: drag;
  align-items: center;
  display: flex;
  justify-content: flex-end;
  position: relative;
  height: 48px;
  background-color: ${(props) => props.theme.main.colors.blue1};
  padding: 0 30px;
  user-select: none;
  z-index: 100;
`;
