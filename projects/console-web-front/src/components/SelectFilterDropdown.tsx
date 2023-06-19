import React from 'react';
import { CaretDownFilled, CloseOutlined } from '@ant-design/icons';
import { Button, Checkbox, Dropdown, MenuProps } from 'antd';
import { CheckboxProps } from 'antd/lib/checkbox';
import styled from 'styled-components';
import useTranslation from 'next-translate/useTranslation';

import { CommonUIProps } from 'src/types/common';

interface DropdownMenuProps extends CommonUIProps {
  selectedItems?: React.ReactNode[];
  optionItems?: React.ReactNode[];
  hideSelectedItems?: boolean;
  title?: string;
  input?: React.ReactNode;
}

export const SelectFilterDropdownMenu = ({ title, input, selectedItems, optionItems, hideSelectedItems = false, className }: DropdownMenuProps) => {
  const { t } = useTranslation();

  return (
    <Box onClick={(e) => e.stopPropagation()} className={className}>
      {title && <Title>{title}</Title>}
      {input}
      {!hideSelectedItems && !!selectedItems && selectedItems.length > 0 && <FilterTagBox>{...selectedItems}</FilterTagBox>}
      {!!optionItems ? <TagBox>{...optionItems}</TagBox> : <div>{t('common:emptySearchResultText')}</div>}
    </Box>
  );
};

interface FilterSelectedTagProps {
  value: string;
  onClick: (value: string) => void;
}

export const FilterSelectedTag = React.memo(({ value, onClick }: FilterSelectedTagProps) => {
  return (
    <SelectedTag onClick={() => onClick(value)}>
      <p>{value}</p>
      <CloseOutlined style={{ fontSize: 10, marginLeft: 4, padding: 2 }} />
    </SelectedTag>
  );
});

FilterSelectedTag.displayName = 'FilterSelectedTag';

interface FilterSelectOptionProps extends CheckboxProps {}

export const FilterSelectOption = (props: FilterSelectOptionProps) => {
  return <StyledCheckbox {...props} />;
};

interface Props {
  hideCount?: boolean;
  title: string;
  menu: React.ReactNode;
  selectedCount: number;
}

const SelectFilterDropdown = ({ hideCount = false, selectedCount, title, menu }: Props) => {
  const items: MenuProps['items'] = [
    {
      label: menu,
      key: title,
    },
  ];

  return (
    <Dropdown trigger={['click']} menu={{ items }}>
      <Button>
        {title}
        {!hideCount && selectedCount > 0 && <Count>{`+${selectedCount}`}</Count>}
        <CaretDownFilled />
      </Button>
    </Dropdown>
  );
};

const Box = styled.div`
  li:hover {
    background-color: #fff !important;
  }
`;

const Title = styled.p`
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const FilterTagBox = styled.div`
  display: flex;
  margin: 0.25rem 0;
  flex-wrap: wrap;
`;

const TagBox = styled.div`
  position: relative;
  margin-top: 0.5rem;
`;

const SelectedTag = styled.div`
  display: flex;
  align-items: center;
  border-radius: 4px;
  margin: 0 4px 4px 0;
  border: 1px solid #d9d9d9;
  padding: 0 7px;
  background-color: ${(props) => props.theme.colors.gray2};

  p {
    display: -webkit-box;
    font-size: 12px;
    max-width: 150px;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    overflow-wrap: break-word;
  }
`;

const StyledCheckbox = styled(Checkbox)`
  display: flex;
  padding: 0.5rem;
  background-color: #fff;
  color: #000;
  align-items: center;
  margin-left: 0 !important;

  & > span:last-child {
    width: 220px;
    overflow-wrap: break-word;
  }
`;

const Count = styled.b`
  margin: 0 0.25rem;
  padding: 0.1rem 0.25rem;
  background-color: ${(props) => props.theme.colors.gray3};
  border-radius: 8px;
  font-size: 0.9rem;
`;

export default SelectFilterDropdown;
