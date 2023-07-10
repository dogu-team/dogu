import { Button } from 'antd';
import { NextPageWithLayout } from 'pages/_app';
import styled from 'styled-components';
import useTranslation from 'next-translate/useTranslation';
import Head from 'next/head';

import RefreshButton from 'src/components/buttons/RefreshButton';
import useModal from 'src/hooks/useModal';
import CreateTagModal from 'src/components/runner/CreateTagModal';
import withOrganization, { getOrganizationPageServerSideProps, WithOrganizationProps } from 'src/hoc/withOrganization';
import TagFilter from 'src/components/runner/TagFilter';
import OrganizationRunnerLayout from 'src/components/layouts/OrganizationRunnerLayout';
import TableListView from '../../../../src/components/common/TableListView';
import RunnerTagListController from '../../../../src/components/runner/RunnerTagListController';

const DeviceTagsManagementPage: NextPageWithLayout<WithOrganizationProps> = ({ organization }) => {
  const [isOpen, openModal, closeModal] = useModal();
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>Device tags - {organization.name} | Dogu</title>
      </Head>
      <TableListView
        top={
          <FlexBox>
            <TopLeftButtonBox>
              <Button type="primary" onClick={() => openModal()}>
                {t('runner:createTagButtonTitle')}
              </Button>
              <TagFilter />
            </TopLeftButtonBox>
            <RefreshButton />
          </FlexBox>
        }
        table={<RunnerTagListController organizationId={organization.organizationId} />}
      />

      <CreateTagModal isOpen={isOpen} close={closeModal} />
    </>
  );
};

DeviceTagsManagementPage.getLayout = (page) => {
  return <OrganizationRunnerLayout>{page}</OrganizationRunnerLayout>;
};

export const getServerSideProps = getOrganizationPageServerSideProps;

export default withOrganization(DeviceTagsManagementPage);

const FlexBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TaggedDeviceBox = styled.div`
  display: flex;
  align-items: center;
`;

const StyledTaggedDevice = styled.div`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid ${(props) => props.theme.colors.gray3};
  font-size: 0.9rem;
  margin: 2px;
`;

const TopLeftButtonBox = styled.div`
  display: flex;
  align-items: center;

  & > * {
    margin-right: 0.5rem;
  }
`;
