import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { AxiosError } from 'axios';
import { notification } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { OrganizationId, USER_EMAIL_MAX_LENGTH, USER_EMAIL_MIN_LENGTH, USER_PASSWORD_MAX_LENGTH, USER_PASSWORD_MIN_LENGTH } from '@dogu-private/types';
import { useRouter } from 'next/router';

import { signIn } from 'src/api/registery';
import SubmitButton from '../buttons/SubmitButton';
import { getErrorMessage } from 'src/utils/error';
import InputItem from '../forms/InputItem';
import { sendErrorNotification } from '../../utils/antd';

interface Props {
  className?: string;
  token: string;
  organizationId: OrganizationId;
}

const InviteSignInForm = (props: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const onChangeEmail = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value), []);
  const onChangePassword = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value), []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (email && password) {
      try {
        const { lastAccessOrganizationId } = await signIn({ email, password, invitationToken: props.token, invitationOrganizationId: props.organizationId });
        if (!lastAccessOrganizationId) {
          sendErrorNotification('Invitation and account are mismatched!');
        }
        router.push(`/auth/invite-confirm?email=${email}&organizationId=${props.organizationId}&token=${props.token}`);
      } catch (e) {
        if (e instanceof AxiosError) {
          if (e.response?.status === 400 || e.response?.status === 401 || e.response?.status === 404) {
            setError(t('registery:signInValidationFailErrorMsg'));
          } else {
            sendErrorNotification(t('registery:signInErrorMsg', { reason: getErrorMessage(e) }));
          }
        }
      }
    } else {
      setError(t('registery:signInValidationFailErrorMsg'));
    }

    setLoading(false);
  };

  return (
    <StyledForm onSubmit={onSubmit} className={props.className}>
      <StyledInputItem
        desc={t('registery:signInFormEmailLabel')}
        type="email"
        value={email}
        placeholder={t('registery:signInFormEmailPlaceholder')}
        onChange={onChangeEmail}
        minLength={USER_EMAIL_MIN_LENGTH}
        maxLength={USER_EMAIL_MAX_LENGTH}
        required
        autoFocus
        autoCapitalize="off"
        autoCorrect="off"
        name="email"
      />
      <StyledInputItem
        desc={t('registery:signInFormPasswordLabel')}
        type="password"
        value={password}
        placeholder={t('registery:signInFormPasswordPlaceholder')}
        onChange={onChangePassword}
        errorMsg={error}
        minLength={USER_PASSWORD_MIN_LENGTH}
        maxLength={USER_PASSWORD_MAX_LENGTH}
        autoCapitalize="off"
        autoCorrect="off"
        name="password"
      />
      <SubmitButton loading={loading} disabled={loading}>
        {t('registery:signInSubmitButtonTitle')}
      </SubmitButton>
    </StyledForm>
  );
};

export default InviteSignInForm;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledInputItem = styled(InputItem)`
  width: 100%;
  margin-bottom: 12px;
`;
