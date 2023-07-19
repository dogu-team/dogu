import React, { useState, useRef } from 'react';
import { Checkbox, Form, Input, InputRef } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { USER_EMAIL_MAX_LENGTH, USER_EMAIL_MIN_LENGTH, USER_NAME_MAX_LENGTH, USER_NAME_MIN_LENGTH, USER_PASSWORD_MAX_LENGTH, USER_PASSWORD_MIN_LENGTH } from '@dogu-private/types';
import styled from 'styled-components';
import Trans from 'next-translate/Trans';

import SubmitButton from '../buttons/SubmitButton';
import { passwordRegex } from 'src/utils/validation';
import DoguText from '../common/DoguText';

interface Props {
  className?: string;
  onSubmit: (email: string, name: string, password: string, newsletter: boolean) => Promise<void>;
  submitButtonText?: string;
  defaultEmail?: string;
}

const SignUpForm = (props: Props) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const emailRef = useRef<InputRef>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const { userName, email, password, newsletter } = form.getFieldsValue(['orgName', 'userName', 'email', 'password', 'newsletter']);
    setLoading(true);
    await props.onSubmit(email, userName, password, newsletter ?? false);
    setLoading(false);
  };

  return (
    <Form form={form} className={props.className} onFinish={handleSubmit} layout="vertical">
      <Form.Item name="userName" label={t('registery:signUpFormNameLabel')} required rules={[{ required: true, message: 'Input your name.' }]}>
        <Input
          type="text"
          placeholder={t('registery:signUpFormNamePlaceholder')}
          minLength={USER_NAME_MIN_LENGTH}
          maxLength={USER_NAME_MAX_LENGTH}
          required
          autoComplete="nickname"
          autoCapitalize="off"
          autoCorrect="off"
          access-id={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'sign-up-form-user-name' : undefined}
        />
      </Form.Item>
      <Form.Item name="email" label={t('registery:signUpFormEmailLabel')} required rules={[{ required: true, message: 'Input your email.' }]} initialValue={props.defaultEmail}>
        <Input
          ref={emailRef}
          type="email"
          placeholder={t('registery:signUpFormEmailPlaceholder')}
          required
          minLength={USER_EMAIL_MIN_LENGTH}
          maxLength={USER_EMAIL_MAX_LENGTH}
          defaultValue={props.defaultEmail}
          disabled={!!props.defaultEmail}
          autoComplete="username"
          autoCapitalize="off"
          autoCorrect="off"
          access-id={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'sign-up-form-email' : undefined}
        />
      </Form.Item>
      <Form.Item
        name="password"
        label={t('registery:signUpFormPasswordLabel')}
        required
        rules={[{ required: true, message: t('common:invalidPasswordFormatErrorMsg'), pattern: passwordRegex }]}
      >
        <Input
          type="password"
          placeholder={t('registery:signUpFormPasswordPlaceholder')}
          minLength={USER_PASSWORD_MIN_LENGTH}
          maxLength={USER_PASSWORD_MAX_LENGTH}
          required
          name="password"
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="new-password"
          access-id={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'sign-up-form-pw' : undefined}
        />
      </Form.Item>
      <Form.Item>
        <SubmitButton loading={loading} access-id={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'sign-up-form-submit' : undefined}>
          {props.submitButtonText ?? t('registery:signUpFormSubmitButtonTitle')}
        </SubmitButton>
      </Form.Item>
      {process.env.NEXT_PUBLIC_ENV !== 'self-hosted' && (
        <Form.Item name="newsletter" valuePropName="checked">
          <Checkbox>
            <NewsletterText>
              <Trans i18nKey="registery:signUpNewsletterSubscribeText" components={{ dogu: <DoguText /> }} />
            </NewsletterText>
          </Checkbox>
        </Form.Item>
      )}
    </Form>
  );
};

export default SignUpForm;

const NewsletterText = styled.p`
  font-size: 0.9rem;
`;
