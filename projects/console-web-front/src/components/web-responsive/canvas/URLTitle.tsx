import React from 'react';
import styled from 'styled-components';

interface Props {
  title: string;
}

export const URLTitle = ({ title }: Props) => {
  return <Title>{title}</Title>;
};

const Title = styled.p`
  font-weight: bold;
  font-size: 192px;
`;
