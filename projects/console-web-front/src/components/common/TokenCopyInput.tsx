import { CopyOutlined } from '@ant-design/icons';
import { Input, message } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import styled from 'styled-components';

interface Props {
  value: string;
}

const TokenCopyInput = ({ value }: Props) => {
  const { t } = useTranslation();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      message.success(t('common:copyClipboard'));
    } catch (e) {
      message.error(t('common:copyClipboardFailed'));
    }
  };

  return (
    <StyledInput access-id={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'copy-token-input' : undefined} value={value} onSearch={handleCopy} enterButton={<CopyOutlined />} />
  );
};

export default TokenCopyInput;

const StyledInput = styled(Input.Search)`
  input {
    font-family: monospace;
  }
`;
