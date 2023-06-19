import { CloseOutlined } from '@ant-design/icons';
import { Select, SelectProps } from 'antd';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

interface Props extends SelectProps<string> {
  selectable?: boolean;
  onSelectableChange?: (value: boolean) => void;
  values: string[];
}

const AddWithSelect = ({ selectable: defaultSelectable, onSelectableChange, values, ...props }: Props) => {
  const [selectable, setSelectable] = useState(defaultSelectable ?? false);

  useEffect(() => {
    onSelectableChange?.(selectable);
  }, [selectable]);

  const selectOptions: SelectProps['options'] = values.map((option) => ({ label: option, value: option }));

  return (
    <Box>
      {!selectable && (
        <StyledButton
          onClick={() => {
            setSelectable(true);
          }}
        >
          +
        </StyledButton>
      )}

      {selectable && (
        <>
          <Select<string>
            {...props}
            onSelect={(e, o) => {
              props.onSelect?.(e, o);
              setSelectable(false);
            }}
            options={selectOptions}
            style={{ minWidth: '15rem' }}
            dropdownMatchSelectWidth={false}
            autoFocus
            onBlur={() => {
              setSelectable(false);
            }}
          />
          <CloseButton
            onClick={() => {
              setSelectable(false);
            }}
          >
            <CloseOutlined />
          </CloseButton>
        </>
      )}
    </Box>
  );
};

const Box = styled.div`
  display: inline-flex;
  align-items: center;
`;

const StyledButton = styled.button`
  padding: 0 7px;
  background-color: transparent;
  border: 1px dashed ${(props) => props.theme.colors.gray6};
  border-radius: 0.25rem;
  color: #000000;
`;

const CloseButton = styled.button`
  display: inline-flex;
  padding: 0 0.25rem;
  background-color: transparent;
  color: #000000;
`;

export default AddWithSelect;
