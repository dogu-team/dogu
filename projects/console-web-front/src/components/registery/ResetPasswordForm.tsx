import { Button, Form, Input } from 'antd';
import React, { CSSProperties, useState } from 'react';
import { USER_PASSWORD_MAX_LENGTH, USER_PASSWORD_MIN_LENGTH } from '@dogu-private/types';

import { checkPassword } from 'src/utils/validation';
import useTranslation from 'next-translate/useTranslation';

interface Props {
  onFinish: (currentPW: string | undefined, newPW: string, confirmPW: string) => Promise<void>;
  needCurrentPassword?: boolean;
  submitButtonStyle?: CSSProperties;
}

const ResetPasswordForm = ({ needCurrentPassword, onFinish, submitButtonStyle }: Props) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const handleFinish = async () => {
    const result: { current?: string; new: string; confirm: string } = form.getFieldsValue(['current', 'new', 'confirm']);

    setLoading(true);
    await onFinish(result.current, result.new, result.confirm);
    setLoading(false);
    form.resetFields();
  };

  return (
    <Form form={form} layout="vertical" autoComplete="off" onFinish={handleFinish}>
      {needCurrentPassword && (
        <Form.Item name="current" label={t('account:resetPasswordFormCurrentLabel')} required>
          <Input.Password
            placeholder={t('account:resetPasswordFormCurrentPlaceholder')}
            minLength={USER_PASSWORD_MIN_LENGTH}
            maxLength={USER_PASSWORD_MAX_LENGTH}
            autoComplete="current-password"
          />
        </Form.Item>
      )}
      <Form.Item
        name="new"
        label={t('account:resetPasswordFormNewLabel')}
        required
        rules={[
          {
            validator: (rule, value) => {
              if (!value || checkPassword(value)) {
                return Promise.resolve();
              }

              return Promise.reject();
            },
            message: t('common:invalidPasswordFormatErrorMsg'),
          },
        ]}
      >
        <Input.Password
          placeholder={t('account:resetPasswordFormNewPlaceholder')}
          minLength={USER_PASSWORD_MIN_LENGTH}
          maxLength={USER_PASSWORD_MAX_LENGTH}
          autoComplete="new-password"
        />
      </Form.Item>
      <Form.Item
        name="confirm"
        label={t('account:resetPasswordFormConfirmLabel')}
        required
        rules={[
          {
            validator: (rule, value) => {
              if (!value || value === form.getFieldValue('new')) {
                return Promise.resolve();
              }

              return Promise.reject();
            },
            message: t('common:confirmPasswordNotEqualErrorMsg'),
          },
        ]}
      >
        <Input.Password
          placeholder={t('account:resetPasswordFormConfirmPlaceholder')}
          minLength={USER_PASSWORD_MIN_LENGTH}
          maxLength={USER_PASSWORD_MAX_LENGTH}
          autoComplete="new-password"
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} style={submitButtonStyle}>
          {t('account:resetPasswordFormSubmitButton')}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default React.memo(ResetPasswordForm);
