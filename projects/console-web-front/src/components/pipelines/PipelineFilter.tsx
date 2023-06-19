import useTranslation from 'next-translate/useTranslation';
import { useEffect } from 'react';

import usePipelineFilterStore from '../../stores/pipeline-filter';
import SelectFilterDropdown from '../SelectFilterDropdown';
import PipelineStatusSelector from './PipelineStatusSelector';

const PipelineFilter = () => {
  const [{ status }, resetFilter] = usePipelineFilterStore((state) => [state.filterValue, state.resetFilter]);
  const { t } = useTranslation();

  useEffect(() => {
    resetFilter();
  }, []);

  return (
    <div>
      <SelectFilterDropdown title={t('routine:pipelineFilterStatusTitle')} selectedCount={status.length} menu={<PipelineStatusSelector />} />
    </div>
  );
};

export default PipelineFilter;
