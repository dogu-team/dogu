import { Button, Form, FormInstance, Input } from 'antd';

interface Props {
  form: FormInstance;
}

const LicenseSubmitForm: React.FC<Props> = ({ form }) => {
  return (
    <Form form={form}>
      <Form.Item name="key" label="License">
        <Input placeholder="License Key" autoComplete="off" autoCorrect="off" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Activate license
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LicenseSubmitForm;
