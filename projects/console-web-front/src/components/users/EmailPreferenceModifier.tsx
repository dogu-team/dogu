import { UserBase } from '@dogu-private/console';
import { Button, Checkbox } from 'antd';
import { AxiosError } from 'axios';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { updateUserEmailPreference } from '../../api/user';
import useRequest from '../../hooks/useRequest';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getErrorMessageFromAxios } from '../../utils/error';

interface Props {
  user: UserBase;
}

const EmailPreferenceModifier = ({ user }: Props) => {
  const userNewsletterPreference = useRef(user.emailPreference?.newsletter ?? 0);
  const [emailPreference, setEmailPreference] = useState(user.emailPreference);
  const [loading, request] = useRequest(updateUserEmailPreference);
  const { t } = useTranslation();

  useEffect(() => {
    userNewsletterPreference.current = user.emailPreference?.newsletter ?? 0;
    setEmailPreference(user.emailPreference);
  }, [user]);

  const handleSave = async () => {
    if (emailPreference?.newsletter === userNewsletterPreference.current) {
      return;
    }

    try {
      await request(user.userId, { newsletter: emailPreference?.newsletter ?? 0 });
      userNewsletterPreference.current = emailPreference?.newsletter ?? 0;
      sendSuccessNotification(t('account:updateEmailPreferenceSuccessMessage'));
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('account:updateEmailPreferenceFailureMessage', { reason: getErrorMessageFromAxios(e) }));
      }
    }
  };

  return (
    <Box>
      <Checkbox
        checked={!!emailPreference?.newsletter}
        onChange={(e) => {
          setEmailPreference((prev) => {
            if (prev) {
              return { ...prev, newsletter: e.target.checked ? 1 : 0 };
            }
          });
        }}
      >
        <CheckboxText>{t('account:newsletterCheckboxLabel')}</CheckboxText>
      </Checkbox>

      <ButtonWrapper>
        <Button type="primary" loading={loading} onClick={handleSave}>
          {t('common:save')}
        </Button>
      </ButtonWrapper>
    </Box>
  );
};

export default EmailPreferenceModifier;

const Box = styled.div``;

const CheckboxText = styled.p`
  line-height: 1.4;
`;

const ButtonWrapper = styled.div`
  margin-top: 1rem;
`;
