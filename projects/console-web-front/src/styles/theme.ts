import { AliasToken } from 'antd/es/theme/interface';
import { DefaultTheme } from 'styled-components';

export const theme: Partial<AliasToken> = {
  colorPrimary: '#67b2ee',
  fontFamily:
    "'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

export const styledComponentsTheme: DefaultTheme = {
  ...theme,

  main: {
    colors: {
      black: '#000000',
      white: '#ffffff',
      gray1: '#232830',
      gray2: '#4D555F',
      gray3: '#86919F',
      gray4: '#9CA9BA',
      gray5: '#C4CBD6',
      gray6: '#D7DDE3',
      gray7: '#393A3F',
      blue1: '#0D1D49',
      blue2: '#152353',
      blue3: '#2D4381',
      blue4: '#4776E6',
      blue5: '#789DF4',
      blue6: '#F8FAFE',
    },
    shadows: {
      blueBold: '0px 0px 20px 0px #D8E0F1',
      blueLight: '0px 0px 35px 0px #E6EBF3',
      blackBold: '0px 4px 6px 0px #0000001A',
      blackLight: '0px 0px 35px 0px #E9E9E9',
    },
  },

  // Will be deprecated
  // TODO: Legacy styles
  colors: {
    primary: '#40a9ff',
    secondary: '#accbe1',
    white: '#ffffff',
    gray1: '#fafbfc',
    gray2: '#f1f2f3',
    gray3: '#DEDFE4',
    gray4: '#C1C2C7',
    gray5: '#919297',
    gray6: '#75767B',
    gray7: '#393A3F',
    black: '#000000',
    link: '#40a9ff',
  },
  spaces: {
    xsmall: '8px',
    small: '12px',
    medium: '16px',
    large: '24px',
    xlarge: '32px',
    landing: '12.5%',
  },
  fontSizes: {
    small: '14px',
    normal: '16px',
    semiLarge: '18px',
    large: '20px',
    xlarge: '24px',
  },
};
