import { OrganizationId, ProjectId } from '@dogu-private/types';
import { Select, SelectProps } from 'antd';
import styled from 'styled-components';
import useSWR from 'swr';
import { GoFileDirectory } from 'react-icons/go';

import { swrAuthFetcher } from '../../../../api';
import { flexRowCenteredStyle } from '../../../../styles/box';
import { LoadingOutlined } from '@ant-design/icons';
import useOrganizationContext from '../../../../hooks/context/useOrganizationContext';
import useRoutineEditorStore from '../../../../stores/routine-editor';

interface Props extends Omit<SelectProps, 'options'> {}

const WorkingDirectorySelector = ({ ...props }: Props) => {
  const schema = useRoutineEditorStore((state) => state.schema);
  const { organization } = useOrganizationContext();
  const { data, isLoading, error } = useSWR<string[]>(
    !!organization?.organizationId &&
      !!schema.repository &&
      `/organizations/${organization.organizationId}/scm/repositories/${schema.repository}/cwds`,
    swrAuthFetcher,
  );

  const options: SelectProps['options'] = data?.map((item) => {
    return {
      label: item,
      value: item,
    };
  });

  return (
    <Select
      options={options}
      loading={isLoading}
      dropdownMatchSelectWidth={false}
      {...props}
      notFoundContent={
        isLoading ? (
          <EmptyBox>
            <p>
              Loading... <LoadingOutlined />
            </p>
          </EmptyBox>
        ) : (
          <EmptyBox>
            <GoFileDirectory style={{ fontSize: '3rem', marginBottom: '1rem' }} />
            <EmptyText>
              No working directory found.
              <br />
              Check your git integration or{' '}
              <a href="https://docs.dogutech.io/management/project/git-integration/#prerequisites" target="_blank">
                dogu.config.json
              </a>{' '}
              file.
            </EmptyText>
          </EmptyBox>
        )
      }
    />
  );
};

export default WorkingDirectorySelector;

const EmptyBox = styled.div`
  ${flexRowCenteredStyle}
  flex-direction: column;
`;

const EmptyText = styled.p`
  font-size: 0.9rem;
  text-align: center;
  line-height: 1.5;
`;
