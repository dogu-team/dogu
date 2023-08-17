import { CloseOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Input, Space } from 'antd';
import { useState } from 'react';
import styled from 'styled-components';

import { flexRowSpaceBetweenStyle } from '../../../styles/box';

const KeyboardInput = () => {
  const [value, setValue] = useState('');

  const handleSend = async () => {
    if (!value) {
      return;
    }

    try {
      // TODO

      setValue('');
    } catch (e) {}
  };

  return (
    <Box>
      <FlexRow style={{ marginBottom: '.5rem' }}>
        <Title>Send keys to device</Title>
        <Button icon={<CloseOutlined />} type="ghost" />
      </FlexRow>

      <Space.Compact style={{ width: '100%' }}>
        <Input
          placeholder="Write anything to send"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
        />
        <Button type="primary" icon={<SendOutlined />} onClick={handleSend}>
          Send
        </Button>
      </Space.Compact>
    </Box>
  );
};

export default KeyboardInput;

const Box = styled.div`
  position: absolute;
  padding: 1rem 1rem 2rem;
  background-color: #fff;
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 0.25rem 0.25rem 0 0;
  box-shadow: 0 -4px 12px -5px rgba(160, 160, 160, 0.75);
  z-index: 40;
`;

const FlexRow = styled.div`
  ${flexRowSpaceBetweenStyle}
`;

const Title = styled.p`
  font-size: 0.9rem;
  font-weight: 500;
`;
