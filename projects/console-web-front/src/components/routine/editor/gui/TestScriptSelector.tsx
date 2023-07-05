import useSWR from 'swr';
import { OrganizationId, ProjectId } from '@dogu-private/types';
import { RepositoryFileMetaTree } from '@dogu-private/console';
import { Select, SelectProps } from 'antd';
import styled from 'styled-components';

import { swrAuthFetcher } from '../../../../api';
import { flexRowBaseStyle } from '../../../../styles/box';

interface Props extends Omit<SelectProps, 'options'> {
  organizationId: OrganizationId;
  projectId: ProjectId;
}

const TestScriptSelector = ({ organizationId, projectId, ...props }: Props) => {
  const { data, isLoading, error } = useSWR<void>(`/organizations/${organizationId}/projects/${projectId}/git/scripts?type=blob`, swrAuthFetcher, {
    revalidateOnFocus: false,
  });

  // const options: SelectProps['options'] = data?.map((item) => {
  //   return {
  //     label: (
  //       <TestScriptBox>
  //         <TestScriptName>{item.name}</TestScriptName>
  //         <TestScriptPath>{`(${item.path})`}</TestScriptPath>
  //       </TestScriptBox>
  //     ),
  //     value: item.path,
  //   };
  // });

  return <Select {...props} options={[]} loading={isLoading} dropdownMatchSelectWidth={false} />;
};

export default TestScriptSelector;

const TestScriptBox = styled.div`
  ${flexRowBaseStyle}
`;

const TestScriptName = styled.b`
  margin-right: 0.25rem;
  font-weight: 500;
`;

const TestScriptPath = styled.p`
  font-size: 0.75rem;
  color: #999;
`;
