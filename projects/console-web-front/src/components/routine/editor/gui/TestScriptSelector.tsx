import useSWR from 'swr';
import { OrganizationId, ProjectId, ProjectTestScript } from '@dogu-private/types';
import { FileOutlined } from '@ant-design/icons';
import { Select, SelectProps } from 'antd';
import styled from 'styled-components';
import Image from 'next/image';

import { swrAuthFetcher } from '../../../../api';
import { flexRowBaseStyle } from '../../../../styles/box';
import resources from '../../../../resources';

interface Props extends Omit<SelectProps, 'options'> {
  organizationId: OrganizationId;
  projectId: ProjectId;
}

const TestScriptSelector = ({ organizationId, projectId, ...props }: Props) => {
  const { data, isLoading, error } = useSWR<ProjectTestScript[]>(`/organizations/${organizationId}/projects/${projectId}/scm/scripts?type=blob`, swrAuthFetcher, {
    revalidateOnFocus: false,
  });

  const getFileIcon = (name: string) => {
    const extension = name.split('.').pop();

    switch (extension) {
      case 'js':
        return <Image src={resources.icons.javascript} width={16} height={16} alt="javascript" style={{ display: 'flex' }} />;
      case 'ts':
        return <Image src={resources.icons.typescript} width={16} height={16} alt="typescript" style={{ display: 'flex' }} />;
      case 'py':
        return <Image src={resources.icons.python} width={16} height={16} alt="python" style={{ display: 'flex' }} />;
      default:
        return <FileOutlined />;
    }
  };

  const options: SelectProps['options'] = data?.map((item) => {
    return {
      label: (
        <TestScriptBox>
          <TestScriptName>
            {getFileIcon(item.name)}&nbsp;{item.name}
          </TestScriptName>
          <TestScriptPath>{`(${item.path})`}</TestScriptPath>
        </TestScriptBox>
      ),
      value: item.path,
    };
  });

  return <Select {...props} options={options} loading={isLoading} dropdownMatchSelectWidth={false} />;
};

export default TestScriptSelector;

const TestScriptBox = styled.div``;

const TestScriptName = styled.b`
  ${flexRowBaseStyle}
  font-size: 0.875rem;
  margin-right: 0.25rem;
  font-weight: 500;

  rect {
    width: 12px;
    height: 12px;
  }
`;

const TestScriptPath = styled.p`
  font-size: 0.7rem;
  color: #999;
`;
