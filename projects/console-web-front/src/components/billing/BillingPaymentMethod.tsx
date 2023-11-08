import { EditFilled, EditOutlined } from '@ant-design/icons';
import { BillingMethodNiceBase } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Form, Modal } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import styled from 'styled-components';
import { shallow } from 'zustand/shallow';

import { updatePaymentMethod } from '../../api/billing';
import useModal from '../../hooks/useModal';
import useRequest from '../../hooks/useRequest';
import useLicenseStore from '../../stores/license';
import { flexRowSpaceBetweenStyle } from '../../styles/box';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { parseNicePaymentMethodFormValues } from '../../utils/billing';
import BillingMethodRegistrationForm, { BillingMethodRegistrationFormValues } from './BillingMethodRegistrationForm';

interface Props {
  method: BillingMethodNiceBase;
  organizationId: OrganizationId;
}

const BillingPaymentMethod: React.FC<Props> = ({ method, organizationId }) => {
  const [isOpen, openModal, closeModal] = useModal();
  const [form] = Form.useForm<BillingMethodRegistrationFormValues>();
  const [updateLoading, requestUpdate] = useRequest(updatePaymentMethod);
  const [license, updateLicense] = useLicenseStore((state) => [state.license, state.updateLicense], shallow);
  const { t } = useTranslation();

  const handleCloseModal = () => {
    closeModal();
    form.resetFields();
  };

  const handleFinish = async () => {
    const values = await form.validateFields();

    try {
      const rv = await requestUpdate({
        organizationId,
        registerCard: parseNicePaymentMethodFormValues(values),
      });

      if (rv.errorMessage || !rv.body?.ok) {
        sendErrorNotification('Failed to update payment method');
        return;
      }

      sendSuccessNotification('Updated!');
      if (license) {
        updateLicense({
          ...license,
          billingOrganization: {
            ...license.billingOrganization,
            billingMethodNice: rv.body.method,
          },
        });
      }
      handleCloseModal();
    } catch (e) {}
  };

  return (
    <Box>
      <EditCardButton
        onClick={() => {
          openModal();
        }}
      >
        <EditFilled />
      </EditCardButton>

      <CardDetail>
        <span>{t('billing:cardNumberLabel')}</span>
        <p>
          **** **** **** {method.cardNumberLast4Digits} {`(${method.cardName})`}
        </p>
      </CardDetail>
      <CardDetail>
        <span>{t('billing:cardExpiryLabel')}</span>
        <p>
          {method.expirationMonth} / {method.expirationYear}
        </p>
      </CardDetail>

      <Modal
        open={isOpen}
        closable
        centered
        destroyOnClose
        title={t('billing:updatePaymentMethodModalTitle')}
        onCancel={handleCloseModal}
        onOk={handleFinish}
        okButtonProps={{
          htmlType: 'submit',
          form: 'billing-method-form',
        }}
        cancelText={t('common:cancel')}
        okText={t('common:save')}
      >
        <BillingMethodRegistrationForm form={form} />
      </Modal>
    </Box>
  );
};

export default BillingPaymentMethod;

const Box = styled.div`
  position: relative;
  width: 18rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid ${(props) => props.theme.main.colors.gray5};
`;

const FlexRow = styled.div`
  ${flexRowSpaceBetweenStyle}
`;

const CardDetail = styled.div`
  margin-bottom: 0.25rem;

  span {
    font-size: 0.85rem;
    color: ${(props) => props.theme.main.colors.gray3};
  }

  p {
    margin-top: 0.25rem;
    font-weight: 500;
  }
`;

const EditCardButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background-color: #fff;
  color: #000;

  &:hover {
    background-color: #f5f5f5;
  }
`;
