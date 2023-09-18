import { Button, Form, FormInstance, Input } from 'antd';
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
      <Form.Item name="key" label="License" rules={[{ required: true, message: 'Input key' }]}>
        <Input placeholder="License Key" autoComplete="off" autoCorrect="off" minLength={1} maxLength={256} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Activate license
        </Button>
      </Form.Item>
    </StyledForm>
  );
};

export default LicenseSubmitForm;

const StyledForm = styled(Form<LicenseSubmitFormValues>)`
  max-width: 500px;
`;
