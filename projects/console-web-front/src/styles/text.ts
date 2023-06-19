import { css } from 'styled-components';

export const clickableTextStyle = css`
  color: ${(props) => props.theme.colorPrimary};
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

export const oneLineClampStyle = css`
  display: -webkit-inline-box;
  overflow: hidden;
  word-break: break-all;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
`;

export const listActiveNameStyle = css`
  ${clickableTextStyle}
  ${oneLineClampStyle}

  width: 100%;
  line-height: 1.4;
  font-weight: 500;
`;
