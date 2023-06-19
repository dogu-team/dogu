import { PageBase, DeviceTagBase } from '@dogu-private/console';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import React from 'react';
import { useState } from 'react';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../../../api';
import useDebouncedInputValues from '../../../../hooks/useDebouncedInputValues';
import AddWithSelect from './AddWithSelect';

interface Props {
  onSelect: (value: string) => void;
}

const AddDeviceTagButton = ({ onSelect }: Props) => {
  const [selectable, setSelectable] = useState(false);
  const { debouncedValue, handleChangeValues } = useDebouncedInputValues();
  const router = useRouter();
  const { t } = useTranslation();

  const { data, isLoading, error } = useSWR<PageBase<DeviceTagBase>>(selectable && `/organizations/${router.query.orgId}/tags?keyword=${debouncedValue}`, swrAuthFetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  });

  return (
    <AddWithSelect
      values={data?.items.map((item) => item.name) ?? []}
      onSelect={onSelect}
      selectable={selectable}
      onSelectableChange={setSelectable}
      loading={isLoading}
      showSearch
      onSearch={handleChangeValues}
      placeholder={t('routine:routineGuiEditorJobDeviceTagSelectorPlaceholder')}
    />
  );
};

export default React.memo(AddDeviceTagButton);
