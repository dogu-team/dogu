import { AliasToken } from 'antd/es/theme/internal';

export interface DoguTheme extends Partial<AliasToken> {
  main: {
    colors: {
      black: string;
      white: string;
      gray1: string;
      gray2: string;
      gray3: string;
      gray4: string;
      gray5: string;
      gray6: string;
      gray7: string;
      blue1: string;
      blue2: string;
      blue3: string;
      blue4: string;
      blue5: string;
      blue6: string;
    };
    shadows: {
      blueBold: string;
      blueLight: string;
      blackBold: string;
      blackLight: string;
    };
  };

  colors: {
    primary: string;
    secondary: string;
    white: string;
    gray1: string;
    gray2: string;
    gray3: string;
    gray4: string;
    gray5: string;
    gray6: string;
    gray7: string;
    black: string;
    link: string;
  };
  spaces: {
    xsmall: string;
    small: string;
    medium: string;
    large: string;
    xlarge: string;
    landing: string;
  };
  fontSizes: {
    small: string;
    normal: string;
    semiLarge: string;
    large: string;
    xlarge: string;
  };
}
