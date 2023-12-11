import { FaGitAlt } from 'react-icons/fa';
import { Form, Modal } from 'antd';
import { isAxiosError } from 'axios';
import { shallow } from 'zustand/shallow';
import Link from 'next/link';
import { IoLogoBitbucket } from 'react-icons/io5';
import { GithubFilled, GitlabOutlined } from '@ant-design/icons';
import { OrganizationScmServiceType } from '@dogu-private/console';
import styled from 'styled-components';

import useModal from '../../hooks/useModal';
import useRequest from '../../hooks/useRequest';
import useEventStore from '../../stores/events';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import GitIntegrationForm, { GitIntegrationFormValues } from '../projects/GitIntegrationForm';
import IntegrationConnectButton from './ConnectButton';
import DisconnectButton from './DisconnectButton';
import IntegrationButton from './IntegrationCard';
import { disconnectOrganizationScm, updateOrganizationScm } from '../../api/organization';
import useOrganizationContext from '../../hooks/context/useOrganizationContext';
import { flexRowBaseStyle } from '../../styles/box';
import { isOrganizationScmIntegrated } from '../../utils/organization';
import GitIcon from 'public/resources/icons/git-logo.svg';

const ScmServiceType: React.FC<{ serviceType: OrganizationScmServiceType }> = ({ serviceType }) => {
  switch (serviceType) {
    case 'github':
      return (
        <ServiceTypeWrapper>
          <GithubFilled /> GitHub
        </ServiceTypeWrapper>
      );
    case 'bitbucket':
      return (
        <ServiceTypeWrapper>
          <IoLogoBitbucket /> Bitbucket
        </ServiceTypeWrapper>
      );
    case 'gitlab':
      return (
        <ServiceTypeWrapper>
          <GitlabOutlined /> GitLab
        </ServiceTypeWrapper>
      );
  }
};

interface Props {}

const ScmIntegrationButton: React.FC<Props> = ({}) => {
  const [deleteLoading, disconnectScm] = useRequest(disconnectOrganizationScm);
  const [saveLoading, updateScm] = useRequest(updateOrganizationScm);
  const [isOpen, openModal, closeModal] = useModal();
  const [form] = Form.useForm<GitIntegrationFormValues>();
  const { organization, mutate } = useOrganizationContext();
  const fireEvent = useEventStore((state) => state.fireEvent, shallow);

  const disconnect = async () => {
    if (!organization) {
      return;
    }

    try {
      await disconnectScm(organization.organizationId);
      sendSuccessNotification('SCM disconnected');
      mutate?.();
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification('Cannot disconnect SCM');
      }
    }
  };

  const handleClose = () => {
    form.resetFields();
    closeModal();
  };

  const updateScmIntegration = async () => {
    if (!organization) {
      return;
    }

    const values = await form.validateFields();

    try {
      await updateScm(organization.organizationId, {
        serviceType: values.git,
        url: values.url,
        token: values.token,
      });
      sendSuccessNotification('SCM integration saved');
      mutate?.();
      handleClose();
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification('Cannot save SCM integration');
      }
    }
  };

  const isConnected = !!organization ? isOrganizationScmIntegrated(organization) : false;
  const scm = organization?.organizationScms?.[0];

  return (
    <>
      <IntegrationButton
        icon={<GitIcon style={{ width: '24px', height: '24px' }} />}
        name="Git"
        description={
          isConnected && !!scm ? (
            <FlexRow>
              Integrated with&nbsp;
              <ScmServiceType serviceType={scm.serviceType} />
              &nbsp;-&nbsp;
              <a href={scm.url} target="_blank">
                {scm.url.split('/')[scm.url.split('/').length - 1]}
              </a>
            </FlexRow>
          ) : (
            <>
              Integrate organizaiton with Git.{' '}
              <Link href="https://docs.dogutech.io/management/organization/git-integration" target="_blank">
                Visit docs
              </Link>{' '}
              for learn more.
            </>
          )
        }
        connectButton={
          isConnected ? (
            <DisconnectButton
              modalTitle={'Disconnect with Git'}
              modalContent={<p>Are you sure you want to disconnect with Git?</p>}
              modalButtonTitle={'Confirm & disconnect'}
              onConfirm={disconnect}
              loading={deleteLoading}
            >
              Disconnect
            </DisconnectButton>
          ) : (
            <IntegrationConnectButton isConnected={isConnected} onClick={() => openModal()} />
          )
        }
      />

      <Modal
        open={isOpen}
        centered
        closable
        onCancel={handleClose}
        okText={'Save'}
        onOk={updateScmIntegration}
        confirmLoading={saveLoading}
        title="Git Integration"
        okButtonProps={{
          htmlType: 'submit',
          form: 'git-integration',
        }}
      >
        <GitIntegrationForm form={form} />
      </Modal>
    </>
  );
};

export default ScmIntegrationButton;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;

const ServiceTypeWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
`;
