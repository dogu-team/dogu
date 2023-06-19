import 'styled-components';
import { DoguTheme } from '../types';

declare module 'styled-components' {
  export interface DefaultTheme extends DoguTheme {}
}
