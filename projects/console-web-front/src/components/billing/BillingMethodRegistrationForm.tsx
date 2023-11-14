import { Form, FormInstance, Input, InputRef } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

export interface BillingMethodRegistrationFormValues {
  card: string;
  expiry: string;
  password: string;
  legalNumber: string;
}

interface Props {
  form: FormInstance<BillingMethodRegistrationFormValues>;
}

const BillingMethodRegistrationForm: React.FC<Props> = ({ form }) => {
  const cardRef = useRef<InputRef>(null);
  const expiryRef = useRef<InputRef>(null);
  const passwordRef = useRef<InputRef>(null);
  const legalNumberRef = useRef<InputRef>(null);
  const { t } = useTranslation('billing');

  useEffect(() => {
    return () => {
      form.resetFields();
    };
  }, [form]);

  const handleChangeCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/\D/g, '');
    let formattedNumber = '';

    for (let i = 0; i < numericValue.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedNumber += ' ';
      }
      formattedNumber += numericValue[i];
    }

    form.setFieldsValue({ card: formattedNumber });

    if (numericValue.length >= 16) {
      expiryRef.current?.focus();
    }
  };

  const formatExpiryDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/\D/g, '');
    let formattedNumber = '';

    for (let i = 0; i < numericValue.length; i++) {
      if (i > 0 && i % 2 === 0) {
        formattedNumber += ' / ';
      }
      formattedNumber += numericValue[i];
    }

    form.setFieldsValue({ expiry: formattedNumber });

    if (numericValue.length >= 4) {
      passwordRef.current?.focus();
    }
  };

  const formatPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length >= 2) {
      legalNumberRef.current?.focus();
    }
  };

  return (
    <StyledForm form={form} layout="vertical" id="billing-method-form">
      <Form.Item
        name="card"
        label={t('paymentFormCardNumberLabel')}
        validateTrigger="onBlur"
        rules={[{ required: true, message: '', len: 19 }]}
      >
        <Input
          required
          name="1"
          ref={cardRef}
          placeholder="1234 5678 1234 5678"
          minLength={19}
          maxLength={19}
          onChange={handleChangeCardNumber}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          autoFocus
          spellCheck="false"
        />
      </Form.Item>
      <Box style={{ gap: '4rem' }}>
        <Form.Item
          name="expiry"
          label={t('paymentFormExpiryLabel')}
          validateTrigger="onBlur"
          rules={[{ required: true, message: '', len: 7 }]}
        >
          <Input
            style={{ width: '100px' }}
            required
            ref={expiryRef}
            placeholder="MM / YY"
            onChange={formatExpiryDate}
            minLength={7}
            maxLength={7}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
          />
        </Form.Item>
        <div style={{ position: 'relative' }}>
          <Form.Item
            name="password"
            label={t('paymentFormPasswordLabel')}
            validateTrigger="onBlur"
            rules={[{ required: true, message: '', len: 2 }]}
          >
            <Input
              type="password"
              style={{ width: '50px' }}
              ref={passwordRef}
              required
              minLength={2}
              maxLength={2}
              onChange={formatPassword}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
            />
          </Form.Item>
          <div style={{ position: 'absolute', left: '58px', bottom: '30px' }}>● ●</div>
        </div>
      </Box>
      <Form.Item
        name="legalNumber"
        label={t('paymentFormBirthdayLabel')}
        validateTrigger="onBlur"
        rules={[{ required: true, message: '', min: 6, max: 10 }]}
      >
        <Input
          ref={legalNumberRef}
          required
          minLength={6}
          maxLength={10}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
        />
      </Form.Item>
    </StyledForm>
  );
};

export default BillingMethodRegistrationForm;

const StyledForm = styled(Form)`
  width: 100%;
`;

const Box = styled.div`
  display: flex;
`;
