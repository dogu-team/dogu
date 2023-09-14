import { RoutineBase } from '@dogu-private/console';
import { RoutineId } from '@dogu-private/types';
import { Button, Select } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../api';
import useDebouncedInputValues from '../../hooks/useDebouncedInputValues';

interface Props {
  onRunClick: (routineId: RoutineId) => Promise<void>;
}

const RoutineSelector = ({ onRunClick }: Props) => {
  const router = useRouter();
  const [inputValue, setInputValue] = useState<string>();
  const { debouncedValue, handleChangeValues } = useDebouncedInputValues();
  const [selectedRoutineId, setSelectedRoutineId] = useState<RoutineId>();
  const { data, isLoading, error } = useSWR<RoutineBase[]>(
    `/organizations/${router.query.orgId}/projects/${router.query.pid}/routines?name=${debouncedValue}`,
    swrAuthFetcher,
  );
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleClickRun = async () => {
    if (selectedRoutineId) {
      setLoading(true);
      await onRunClick(selectedRoutineId);
      setLoading(false);
    }
  };

  return (
    <Box>
      <SearchTitle>{t('routine:routineSelectorTitle')}</SearchTitle>

      <Wrapper>
        <Select<string>
          showSearch
          value={inputValue}
          placeholder={t('routine:routineSelectorInputPlaceholder')}
          defaultActiveFirstOption={false}
          showArrow={false}
          filterOption={false}
          onClick={(e) => e.stopPropagation()}
          onChange={setInputValue}
          onSearch={handleChangeValues}
          notFoundContent={null}
          options={(data || []).map((d) => ({
            value: d.routineId,
            label: d.name,
          }))}
          style={{ width: '100%' }}
          onSelect={setSelectedRoutineId}
        />
      </Wrapper>

      <div>
        <Button
          type="primary"
          disabled={selectedRoutineId === undefined}
          loading={loading}
          onClick={(e) => {
            handleClickRun();
          }}
        >
          {t('routine:routineSelectorRunButtonText')}
        </Button>
      </div>
    </Box>
  );
};

export default RoutineSelector;

const Box = styled.div`
  width: 200px;
  cursor: default;
`;

const SearchTitle = styled.p`
  margin-bottom: 0.5rem;
`;

const Wrapper = styled.div`
  position: relative;
  margin-bottom: 0.5rem;
`;

const StyledButton = styled.div`
  width: 100%;
  padding: 0.5rem;
  border-bottom: 1px solid ${(props) => props.theme.colors.gray2};
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.theme.colors.gray2};
  }
`;

const ResultBox = styled.div`
  margin-top: 0.5rem;
  max-height: 200px;
  overflow-y: auto;

  & > ${StyledButton}:last-child {
    border-bottom: none;
  }
`;

const StyledSelect = styled(Select)``;
