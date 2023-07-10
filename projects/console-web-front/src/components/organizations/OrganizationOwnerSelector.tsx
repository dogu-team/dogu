import { OrganizationBase, UserBase } from '@dogu-private/console';
import { UserId } from '@dogu-private/types';
import { Select } from 'antd';
import { useState } from 'react';
import styled from 'styled-components';

import useDebouncedInputValues from '../../hooks/useDebouncedInputValues';
import usePaginationSWR from '../../hooks/usePaginationSWR';
import { flexRowBaseStyle } from '../../styles/box';
import ProfileImage from '../ProfileImage';

interface Props {
  organization: OrganizationBase;
  onChange: (owner: UserBase) => void;
}

const OrganizationOwnerSelector = ({ organization, onChange }: Props) => {
  const { debouncedValue, inputValue, handleChangeValues } = useDebouncedInputValues();
  const { data } = usePaginationSWR<UserBase>(`/organizations/${organization.organizationId}/users?keyword=${debouncedValue}`, { skipQuestionMark: true });
  const [owner, setOwner] = useState<UserBase | undefined>(organization.owner);

  const handleUpdate = async (value: UserId) => {
    const newOwner = data?.items.find((item) => item.userId === value);
    if (newOwner) {
      setOwner(newOwner);
      onChange(newOwner);
      handleChangeValues('');
    }
  };

  const searchOptions = data?.items.map((item) => {
    return {
      value: item.userId,
      label: (
        <ProfileBox>
          <ProfileImage name={item.name} profileImageUrl={item.profileImageUrl} shape="circle" size={28} />
          <p style={{ marginLeft: '.5rem' }}>{item.name}</p>
        </ProfileBox>
      ),
    };
  });

  return (
    <StyledSelect
      size="large"
      defaultValue={owner?.userId}
      listHeight={200}
      showSearch
      searchValue={inputValue}
      onSearch={(value) => {
        handleChangeValues(value);
      }}
      value={owner?.userId}
      onChange={(value) => {
        handleUpdate(value as UserId);
      }}
      onSelect={(value) => {
        setOwner(data?.items.find((item) => item.userId === value));
      }}
      placeholder="Member"
      autoClearSearchValue
      options={
        inputValue
          ? searchOptions
          : [
              {
                value: organization.owner?.userId,
                label: (
                  <ProfileBox>
                    <ProfileImage name={organization.owner?.name} profileImageUrl={organization.owner?.profileImageUrl} shape="circle" size={28} />
                    <p style={{ marginLeft: '.5rem' }}>{organization.owner?.name}</p>
                  </ProfileBox>
                ),
              },
              ...(searchOptions?.filter((item) => item.value !== organization.owner?.userId) ?? []),
            ]
      }
      filterOption={false}
    />
  );
};

export default OrganizationOwnerSelector;

const StyledSelect = styled(Select)`
  width: 100%;
`;

const ProfileBox = styled.div`
  ${flexRowBaseStyle}
`;
