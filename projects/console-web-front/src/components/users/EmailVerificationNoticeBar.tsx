import { UserBase } from '@dogu-private/console';
import { USER_VERIFICATION_STATUS } from '@dogu-private/types';
import { Button, message } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';
import { sendVerifyEmail } from 'src/api/registery';
import styled from 'styled-components';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';

interface Props {
  me: UserBase;
}

const EmailVerificationNoticeBar = ({ me }: Props) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleClickSend = async () => {
    if (me?.email) {
      setLoading(true);
      try {
        await sendVerifyEmail(me?.email);
        sendSuccessNotification('Verify email sent!');
      } catch (e) {
        sendErrorNotification('Failed to send verification email');
      }
      setLoading(false);
    }
  };

  if (me?.userAndVerificationToken?.status === USER_VERIFICATION_STATUS.VERIFIED) {
    return null;
  }

  return (
    <VerifyBanner>
      <p>{t('common:verifyEmail')}</p>
      <Button onClick={handleClickSend} loading={loading}>
        {t('common:resendEmail')}
      </Button>
    </VerifyBanner>
  );
};

export default EmailVerificationNoticeBar;

const VerifyBanner = styled.div`
  position: sticky;
  display: flex;
  padding: 12px 32px;
  background-color: #f78a77;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
`;
