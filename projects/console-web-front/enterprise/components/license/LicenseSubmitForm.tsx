import { Button, Form, FormInstance, Input } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';
import styled from 'styled-components';

export type LicenseSubmitFormValues = {
  key: string;
};

interface Props {
  form: FormInstance<LicenseSubmitFormValues>;
  onSubmit: (licenseKey: string) => Promise<void>;
}

const LicenseSubmitForm: React.FC<Props> = ({ form, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation('license');

  return (
    <StyledForm
      form={form}
      onFinish={async ({ key }) => {
        setLoading(true);
        await onSubmit(key);
        setLoading(false);
      }}
      disabled={loading}
      layout="vertical"
    >
      <Form.Item name="key" label={t('licenseActivateFormKeyLabel')} rules={[{ required: true, message: 'Input key' }]}>
        <Input
          placeholder={t('licenseActivateFormKeyInputPlaceholder')}
          autoComplete="off"
          autoCorrect="off"
          minLength={1}
          maxLength={256}
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {t('licenseActivateFormSubmitButtonText')}
        </Button>
      </Form.Item>
    </StyledForm>
  );
};

export default LicenseSubmitForm;

const StyledForm = styled(Form<LicenseSubmitFormValues>)`
  max-width: 500px;
`;
