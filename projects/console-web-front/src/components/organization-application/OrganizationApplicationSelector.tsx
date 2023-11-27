import { AppstoreOutlined, LoadingOutlined, WarningFilled } from '@ant-design/icons';
import { OrganizationApplicationWithIcon, PageBase } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Select, SelectProps } from 'antd';
import Link from 'next/link';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../api/index';
import useDebouncedInputValues from '../../hooks/useDebouncedInputValues';
import { flexRowCenteredStyle } from '../../styles/box';
import OrganizationApplicationOptionItem from './OrganizationApplicationOptionItem';

interface Props extends Omit<SelectProps<string>, 'options'> {
  selectedApplication: OrganizationApplicationWithIcon | undefined;
  organizationId: OrganizationId;
  onSelectApp: (version: string | undefined, app: OrganizationApplicationWithIcon | undefined) => void;
  toggleOpen: () => void;
  close: () => void;
  extension?: string;
}

const OrganizationApplicationSelector = ({
  selectedApplication,
  organizationId,
  extension,
  toggleOpen,
  close,
  onSelectApp,
  ...props
}: Props) => {
  const { debouncedValue, handleChangeValues } = useDebouncedInputValues();
  const { data, isLoading, error } = useSWR<OrganizationApplicationWithIcon[]>(
    `/organizations/${organizationId}/applications/packages${extension ? `?extension=${extension}` : ''}`,
    swrAuthFetcher,
  );

  const applications = selectedApplication ? [selectedApplication, ...(data || [])] : data;
  const options: SelectProps['options'] = applications?.map((item) => ({
    label: <OrganizationApplicationOptionItem app={item} />,
    value: item.package,
  }));
  const isInvalid = !!props.value && props.value !== 'latest' && !data?.find((item) => item.package === props.value);

  return (
    <Select<string>
      loading={isLoading}
      options={options}
      style={{ width: '100%' }}
      showSearch
      status={isInvalid ? 'warning' : undefined}
      suffixIcon={isInvalid ? <WarningFilled style={{ color: '#ffd666' }} /> : undefined}
      onSearch={handleChangeValues}
      onChange={(appPackage) => {
        const selected = data?.find((item) => item.package === appPackage);
        onSelectApp(appPackage, selected);
      }}
      dropdownMatchSelectWidth={false}
      filterOption={false}
      onClick={() => toggleOpen()}
      onBlur={() => close()}
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
            <AppstoreOutlined style={{ fontSize: '3rem', marginBottom: '1rem' }} />
            <EmptyText>
              No applicaiton.
              <br />
              Please upload your app from <Link href={`/dashboard/${organizationId}/apps`}>app menu</Link>.
            </EmptyText>
          </EmptyBox>
        )
      }
    />
  );
};

export default OrganizationApplicationSelector;

const EmptyBox = styled.div`
  ${flexRowCenteredStyle}
  flex-direction: column;
`;

const EmptyText = styled.p`
  font-size: 0.9rem;
  text-align: center;
  line-height: 1.5;
`;
