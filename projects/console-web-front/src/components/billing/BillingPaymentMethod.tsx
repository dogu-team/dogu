import { EditOutlined } from '@ant-design/icons';
import { FindBillingMethodResultSuccess } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Form, Modal } from 'antd';
import styled from 'styled-components';

import { updatePaymentMethod } from '../../api/billing';
import useModal from '../../hooks/useModal';
import useRequest from '../../hooks/useRequest';
import { parseNicePaymentMethodFormValues } from '../../utils/billing';
import BillingMethodRegistrationForm, { BillingMethodRegistrationFormValues } from './BillingMethodRegistrationForm';

interface Props {
  methods: FindBillingMethodResultSuccess['methods'];
  organizationId: OrganizationId;
}

const BillingPaymentMethod: React.FC<Props> = ({ methods, organizationId }) => {
  const [isOpen, openModal, closeModal] = useModal();
  const [form] = Form.useForm<BillingMethodRegistrationFormValues>();
  const [updateLoading, requestUpdate] = useRequest(updatePaymentMethod);

  const currentMethod = methods[0];

  const handleCloseModal = () => {
    closeModal();
    form.resetFields();
  };

  const handleFinish = async () => {
    const values = await form.validateFields();

    try {
      await requestUpdate({
        organizationId,
        registerCard: parseNicePaymentMethodFormValues(values),
      });
    } catch (e) {}
  };

  return (
    <Box>
      <CardDetail>
        Card number: **** **** **** {currentMethod.cardNumberLast4Digits} {`(${currentMethod.cardName})`}
      </CardDetail>
      <CardDetail>
        Expiration date: {currentMethod.expirationMonth} / {currentMethod.expirationYear}
      </CardDetail>

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
