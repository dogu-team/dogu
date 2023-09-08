import { CheckOutlined, CloseOutlined, EditFilled } from '@ant-design/icons';
import { Input } from 'antd';
import { useState } from 'react';
import styled from 'styled-components';
import { flexRowBaseStyle } from '../../../../styles/box';

interface Props {
  defaultValue: string;
  onSave: (value: string) => void;
  style?: React.CSSProperties;
  maxWidth?: number;
  maxLength?: number;
  placeholder?: string;
}

const NameEditor = ({ defaultValue, onSave, style, placeholder }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(defaultValue);

  return (
    <Box style={style}>
      <NameWrapper isEditing={isEditing}>
        {isEditing ? (
          <Input
            type="text"
            size="small"
            value={value}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSave(value);
                setIsEditing(false);
              }
            }}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => {
              setValue(defaultValue);
              setIsEditing(false);
            }}
            placeholder={placeholder}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            autoFocus
          />
        ) : (
          <p>{defaultValue}&nbsp;</p>
        )}
      </NameWrapper>
      <ButtonWrapper>
        {isEditing ? (
          <>
            <StyledButton
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSave(value);
                setIsEditing(false);
              }}
            >
              <CheckOutlined />
            </StyledButton>
            <StyledButton
              onClick={() => {
                setValue(defaultValue);
                setIsEditing(false);
              }}
            >
              <CloseOutlined />
            </StyledButton>
          </>
        ) : (
          <StyledButton onClick={() => setIsEditing(true)}>
            <EditFilled />
          </StyledButton>
        )}
      </ButtonWrapper>
    </Box>
  );
};

export default NameEditor;

const Box = styled.div`
  ${flexRowBaseStyle}
`;

const NameWrapper = styled.div<{ isEditing: boolean }>`
  flex: ${(props) => (props.isEditing ? '1' : 'none')};
`;

const ButtonWrapper = styled.div`
  ${flexRowBaseStyle}
  flex-shrink: 0;

  button {
    margin-left: 0.25rem;
  }
`;

const StyledButton = styled.button`
  padding: 0;
  background-color: transparent;
  color: #000000;
`;
