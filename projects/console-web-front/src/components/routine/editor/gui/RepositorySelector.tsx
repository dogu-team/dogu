import { LoadingOutlined } from '@ant-design/icons';
import { OrganizationScmRespository } from '@dogu-private/console';
import { Select, SelectProps } from 'antd';
import styled from 'styled-components';
import useSWR from 'swr';
import { VscRepo } from 'react-icons/vsc';

import { swrAuthFetcher } from '../../../../api';
import useOrganizationContext from '../../../../hooks/context/useOrganizationContext';
import { flexRowCenteredStyle } from '../../../../styles/box';
import useRefresh from '../../../../hooks/useRefresh';

interface Props extends Omit<SelectProps, 'options'> {}

const RepositorySelector: React.FC<Props> = ({ ...props }) => {
  const { organization } = useOrganizationContext();
  const { data, isLoading, error, mutate } = useSWR<OrganizationScmRespository[]>(
    !!organization?.organizationId && `/organizations/${organization?.organizationId}/scm/repositories`,
    swrAuthFetcher,
  );

  useRefresh(['onOrganizationScmUpdated'], () => mutate());

  const options: SelectProps['options'] = data?.map((item) => {
    return {
      label: item.name,
      value: item.name,
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
            <VscRepo style={{ fontSize: '3rem', marginBottom: '1rem' }} />
            <EmptyText>
              No repository found.
              <br />
              Check your git integration.
            </EmptyText>
          </EmptyBox>
        )
      }
    />
  );
};

export default RepositorySelector;

const EmptyBox = styled.div`
  ${flexRowCenteredStyle}
  flex-direction: column;
`;

const EmptyText = styled.p`
  font-size: 0.9rem;
  text-align: center;
  line-height: 1.5;
`;
