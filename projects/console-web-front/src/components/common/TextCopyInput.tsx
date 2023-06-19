import { CopyOutlined } from '@ant-design/icons';
import { Input, message } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import styled from 'styled-components';

interface Props {
  value: string;
}

const TextCopyInput = ({ value }: Props) => {
  const { t } = useTranslation();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (e) {}
  };

  return (
    <StyledInput access-id={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'copy-text-input' : undefined} value={value} onSearch={handleCopy} enterButton={<CopyOutlined />} />
  );
};

export default TextCopyInput;

const StyledInput = styled(Input.Search)`
  input {
    font-family: monospace;
  }
`;
