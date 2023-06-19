import { ChakraBaseProvider, ColorModeScript } from '@chakra-ui/react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { init } from '@sentry/electron/renderer';
import { init as reactInit } from '@sentry/react';

import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';
import theme from './utils/theme';
import GlobalStyles from './styles/GlobalStyles';

init(
  {
    /* config */
  },
  reactInit,
);

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <ChakraBaseProvider theme={theme}>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <HashRouter>
      <GlobalStyles />
      <App />
    </HashRouter>
  </ChakraBaseProvider>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
