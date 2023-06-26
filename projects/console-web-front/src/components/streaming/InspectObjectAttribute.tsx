import { message } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import styled from 'styled-components';

import { flexRowBaseStyle } from '../../styles/box';

interface Props {
  title: string;
  values: string | number | boolean | { label: string; value: string | number | boolean | undefined }[] | undefined;
  disableCopy?: boolean;
}

const InspectObjectAttribute = ({ title, values, disableCopy }: Props) => {
  const { t } = useTranslation();

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success(t('common:copyClipboard'));
    } catch (e) {
      message.error(t('common:copyClipboardFailed'));
    }
  };

  return (
    <FlexRow>
      {!!title && <StyledTitle>{title}</StyledTitle>}
      {Array.isArray(values) ? (
        <FlexRow>
          {values.map((item) => (
            <FlexRow key={item.label} style={{ marginRight: '.25rem' }}>
              <StyledLabel>{item.label}:</StyledLabel>
              {item.value !== undefined && (
                <StyledButton onClick={() => handleCopy(`${item.value}`)} disabled={disableCopy}>
                  {item.value}
                </StyledButton>
              )}
            </FlexRow>
          ))}
        </FlexRow>
      ) : (
        values !== undefined && (
          <StyledButton onClick={() => handleCopy(`${values}`)} disabled={disableCopy}>
            {values}
          </StyledButton>
        )
      )}
    </FlexRow>
  );
};

export default InspectObjectAttribute;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;

const StyledTitle = styled.b`
  font-weight: 600;
  margin-right: 0.75rem;
  flex-shrink: 0;
`;

const StyledLabel = styled.b`
  font-weight: 500;
  margin-right: 0.1rem;
`;

const StyledButton = styled.button`
  padding: 0.1rem 0.25rem;
  background-color: #fff;
  color: #000;
  cursor: copy;
  user-select: none;
  text-align: left;
  white-space: nowrap;
  border-radius: 0.1rem;

  &:hover {
    background-color: #dcdcdc;
  }
`;
