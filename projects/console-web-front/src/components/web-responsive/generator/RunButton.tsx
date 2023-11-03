import { Button } from 'antd';
import React from 'react';
import styled from 'styled-components';

interface Props {
  onClick: () => Promise<void>;
}

const RunButton = (props: Props) => {
  return (
    <Button type="primary" size={'large'} onClick={props.onClick}>
      Create Check
    </Button>
  );
};

export default RunButton;

const Box = styled.div`
  display: flex;
`;
