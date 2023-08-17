import { CopyOutlined } from '@ant-design/icons';
import { Input, InputRef, message } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useRef } from 'react';
import styled from 'styled-components';

interface Props {
  value: string;
}

const TokenCopyInput = ({ value }: Props) => {
  const { t } = useTranslation();
  const inputRef = useRef<InputRef>(null);

  const handleCopy = async () => {
    try {
      throw new Error('!');
      await navigator.clipboard.writeText(value);
      message.success(t('common:copyClipboard'));
    } catch (e) {
      message.error(t('common:copyClipboardFailed'));
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(0, value.length);
    }
  };

  return (
    <StyledInput
      ref={inputRef}
      access-id={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'copy-token-input' : undefined}
      value={value}
      onSearch={handleCopy}
      enterButton={<CopyOutlined />}
    />
  );
};

export default TokenCopyInput;

const StyledInput = styled(Input.Search)`
  input {
    font-family: monospace;
  }
`;
