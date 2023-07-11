import { CheckCircleFilled, CopyOutlined } from '@ant-design/icons';
import { Button, message, Tooltip } from 'antd';
import styled from 'styled-components';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { useState } from 'react';

export interface CopyButtonContainerProps {
  code: string;
  language: string;
}

const CopyButtonContainer = ({ code, language }: CopyButtonContainerProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      message.error('Failed to copy to clipboard');
    }
  };

  return (
    <Box>
      <SyntaxHighlighter language={language} style={a11yDark}>
        {code}
      </SyntaxHighlighter>
      <Tooltip open={copied} title={'Copied'}>
        <StyledButton icon={copied ? <CheckCircleFilled style={{ color: '#32CD32' }} /> : <CopyOutlined />} onClick={handleCopy} />
      </Tooltip>
    </Box>
  );
};

export default CopyButtonContainer;

const StyledButton = styled(Button)`
  position: absolute;
  top: 8px;
  right: 8px;
  display: none;
  z-index: 1;
`;

const Box = styled.div`
  position: relative;

  &:hover ${StyledButton} {
    display: block;
  }
`;
