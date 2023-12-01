import { shallow } from 'zustand/shallow';
import styled from 'styled-components';
import { EditOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Space } from 'antd';

import { updatePaddleBusiness } from '../../api/billing';
import useModal from '../../hooks/useModal';
import useRequest from '../../hooks/useRequest';
import useLicenseStore from '../../stores/license';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { flexRowBaseStyle } from '../../styles/box';

type BillingPaddleAddressForm = {
  name: string;
  companyNumber: string | undefined;
  tax: string | undefined;
};

const BillingPaddleAddressEditor: React.FC<{
  open: boolean;
  close: () => void;
}> = ({ open, close }) => {
  const [license, updateLicense] = useLicenseStore((state) => [state.license, state.updateLicense], shallow);
  const [loading, requestUpdate] = useRequest(updatePaddleBusiness);
  const [form] = Form.useForm<BillingPaddleAddressForm>();

  const handleClose = () => {
    form.resetFields();
    close();
  };

  const handleUpdateAddress = async (values: BillingPaddleAddressForm) => {
    if (!license) {
      return;
    }

    try {
      const rv = await requestUpdate({
        organizationId: license.organizationId,
        name: values.name,
        companyNumber: values.companyNumber,
        taxIdentifier: values.tax,
      });
      if (rv.body) {
        updateLicense({
          ...license,
          billingOrganization: {
            ...license.billingOrganization,
            billingMethodPaddle: {
              ...license.billingOrganization.billingMethodPaddle,
              business: rv.body,
            },
          },
        });
        sendSuccessNotification(`Successfully updated business`);
        close();
      } else {
        throw new Error('Failed to update business');
      }
    } catch (e) {
      sendErrorNotification(`Failed to update business`);
    }
  };

  if (!license?.billingOrganization.billingMethodPaddle.business) {
    return null;
  }

  const business = license.billingOrganization.billingMethodPaddle.business;
  const { name, companyNumber, taxIdentifier } = business;

  return (
    <Modal
      centered
      onCancel={handleClose}
      destroyOnClose
      open={open}
      title="Change billing business"
      okButtonProps={{
        htmlType: 'submit',
        form: 'paddle-business',
      }}
      confirmLoading={loading}
      okText={'Save'}
      cancelText={'Cancel'}
    >
      <Form form={form} id="paddle-business" layout="vertical" onFinish={handleUpdateAddress}>
        <Form.Item
          label="Name"
          name="name"
          initialValue={name}
          required
          rules={[{ required: true, message: 'Please enter name' }]}
        >
          <Input placeholder="Dogu Technologies" />
        </Form.Item>
        <Form.Item label="Company number" name="companyNumber" initialValue={companyNumber}>
          <Input placeholder="Company number for business" />
        </Form.Item>
        <Form.Item label="VAT/GST" name="tax" initialValue={taxIdentifier}>
          <Input required placeholder="VAT/GST number" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const BillingPaddleBusiness: React.FC = () => {
  const license = useLicenseStore((state) => state.license);
  const [isOpen, openModal, closeModal] = useModal();

  if (!license?.billingOrganization.billingMethodPaddle.business) {
    return null;
  }

  const business = license.billingOrganization.billingMethodPaddle.business;
  const { name, companyNumber, taxIdentifier } = business;

  const displayBusiness = [name, companyNumber, taxIdentifier].filter((v) => !!v).join(', ');

  return (
    <>
      <div>
        <TitleWrapper>
          <Title>Business</Title>
          <Button onClick={() => openModal()} icon={<EditOutlined />} type="link" />
        </TitleWrapper>
        <Content>
          <p>{displayBusiness}</p>
        </Content>
      </div>

      <BillingPaddleAddressEditor open={isOpen} close={closeModal} />
    </>
  );
};

export default BillingPaddleBusiness;

const TitleWrapper = styled.div`
  ${flexRowBaseStyle}
`;

const Title = styled.p`
  font-size: 1rem;
  font-weight: 500;
`;

const Content = styled.div`
  width: 250px;
`;
