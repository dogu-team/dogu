import { Vendor } from '@dogu-private/device-data';
import React, { useState } from 'react';
import styled from 'styled-components';

interface SectionProps {
  title: Vendor;
}

const PageImageSection = ({ title }: SectionProps) => {
  return (
    <Box>
      <Title>{title}</Title>
      <StyledHr />
    </Box>
  );
};

const Box = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.p`
  font-size: 152px;
  font-weight: bold;
`;

const StyledHr = styled.hr`
  display: block;
  width: 100%;
  height: 32px;
  background-color: ${(props) => props.theme.colors.gray2};
  border: none;
  margin-top: 96px;
`;

export default PageImageSection;
