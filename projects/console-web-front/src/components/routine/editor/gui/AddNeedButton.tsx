import useTranslation from 'next-translate/useTranslation';
import React from 'react';

import useRoutineEditorStore from '../../../../stores/routine-editor';
import AddWithSelect from './AddWithSelect';

interface Props {
  onSelect: (value: string) => void;
  excludeNames?: string[];
}

const AddNeedButton = ({ onSelect, excludeNames }: Props) => {
  const schema = useRoutineEditorStore((state) => state.schema);
  const jobNames = Object.keys(schema.jobs).filter((name) => !excludeNames?.includes(name));
  const { t } = useTranslation();

  return (
    <AddWithSelect
      options={jobNames.map((name) => ({ label: name, value: name }))}
      onSelect={onSelect}
      showSearch
      filterOption={(input, option) => ((option?.label ?? '') as string).toLowerCase().includes(input.toLowerCase())}
      placeholder={t('routine:routineGuiEditorJobNeedSelectorPlaceholder')}
    />
  );
};

export default React.memo(AddNeedButton);
