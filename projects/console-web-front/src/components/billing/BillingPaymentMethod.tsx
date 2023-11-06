import { EditOutlined } from '@ant-design/icons';
import { CallBillingApiResponse, FindBillingMethodResponse } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Button, Form, Modal } from 'antd';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../api';
import useModal from '../../hooks/useModal';
import ErrorBox from '../common/boxes/ErrorBox';
import BillingMethodRegistrationForm, { BillingMethodRegistrationFormValues } from './BillingMethodRegistrationForm';

interface Props {
  organizationId: OrganizationId;
}

const BillingPaymentMethod: React.FC<Props> = ({ organizationId }) => {
  const { data, isLoading } = useSWR<CallBillingApiResponse<FindBillingMethodResponse>>(
    `/billing/methods?organizationId=${organizationId}`,
    swrAuthFetcher,
    {
      revalidateOnFocus: false,
    },
  );
  const [isOpen, openModal, closeModal] = useModal();
  const [form] = Form.useForm<BillingMethodRegistrationFormValues>();

  const handleCloseModal = () => {
    closeModal();
    form.resetFields();
  };

  const handleFinish = async () => {
    const values = await form.validateFields();

    try {
    } catch (e) {}
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data || data.errorMessage || !data.body?.ok) {
    return <ErrorBox title="Something went wrong" desc="Failed to find payment methods" />;
  }

  if (!data.body.methods || data.body.methods.length === 0) {
    return (
      <div>
        <Button type="primary" onClick={() => openModal()}>
          Add payment method
        </Button>

        <Modal
          open={isOpen}
          closable
          centered
          destroyOnClose
          title="Add your payment method"
          onCancel={handleCloseModal}
          onOk={handleFinish}
        >
          <BillingMethodRegistrationForm form={form} />
        </Modal>
      </div>
    );
  }

  return (
    <Box>
      <CardDetail>
        Card number: **** **** **** {data.body.methods[0].cardNumberLast4Digits} {`(${data.body.methods[0].cardName})`}
      </CardDetail>
      <CardDetail>Expiration date: MM / YYYY</CardDetail>

      <div>
        <EditCardButton
          onClick={() => {
            openModal();
          }}
        >
          <EditOutlined /> Edit
        </EditCardButton>
      </div>

      <Modal
        open={isOpen}
        closable
        centered
        destroyOnClose
        title="Update your payment method"
        onCancel={handleCloseModal}
        onOk={handleFinish}
        okButtonProps={{
          htmlType: 'submit',
          form: 'billing-method-form',
        }}
      >
        <BillingMethodRegistrationForm form={form} />
      </Modal>
    </Box>
  );
};

export default BillingPaymentMethod;

const Box = styled.div``;

const CardDetail = styled.div`
  margin-bottom: 0.25rem;
`;

const EditCardButton = styled.button`
  padding: 0.25rem 0.5rem;
  background-color: #fff;
  color: ${(props) => props.theme.colorPrimary};
`;
