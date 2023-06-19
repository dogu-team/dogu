import 'styled-components';
import { DoguTheme } from './src/types';

declare module 'styled-components' {
  export interface DefaultTheme extends DoguTheme {}
}
