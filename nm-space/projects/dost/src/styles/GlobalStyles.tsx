import { createGlobalStyle } from 'styled-components';
import reset from 'styled-reset';

const GlobalStyles = createGlobalStyle`
  ${reset}

  * {
    box-sizing: border-box;
  }

  html {
    font-size: 16px;

    @media screen and (max-width: 767px) {
      font-size: 14px;
    }
  }

  body {
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
  }
`;

export default GlobalStyles;
