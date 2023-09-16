import { createGlobalStyle } from 'styled-components';
import reset from 'styled-reset';

const GlobalStyles = createGlobalStyle<{ locale?: string }>`
  ${reset}

  * {
    box-sizing: border-box;
  }

  html {
    width: auto;
    height: auto;
    color: ${(props) => props.theme.main.colors.black};
    font-family: 'Noto Sans KR', 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    font-size: 16px;
    scroll-behavior: smooth;

    @media only screen and (max-width: 1023px) {
      font-size: 15px;
    }
    @media only screen and (max-width: 767px) {
      font-size: 14px;
    }
  }

  body {
    width: auto;
    height: auto;
  }

  #__next {
  }

  input, button, textarea, pre {
    outline: none;
    font-family: 'Noto Sans', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  }
  button {
    border: none;
    cursor: pointer;
    user-select: none;
    padding: 0;
    margin: 0;
  }
  input {
    border-radius: 10px;
  }
  hr {
    display: block;
    margin: 0;
    border: none;
  }

  .ant-dropdown-menu-item-active {
    background-color: #ffffff !important;
  }

  a {
    text-decoration: none;
    color: ${(props) => props.theme.colorPrimary};
  }

  #nprogress .bar {
    background: ${(props) => props.theme.colorPrimary} !important;
  }

  #nprogress .peg {
    box-shadow: 0 0 10px ${(props) => props.theme.colorPrimary}, 0 0 5px ${(props) =>
  props.theme.colorPrimary} !important;
  }

  #nprogress .spinner {
    display: none !important;
    opacity: 0 !important;
  }
`;

export default GlobalStyles;
