import styled from 'styled-components';
import { Button, Divider, Input } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { UserBase } from '@dogu-private/console';
import Head from 'next/head';
import { AxiosError } from 'axios';
import { GetServerSideProps, Redirect } from 'next';
import { mutate } from 'swr';
import { useRouter } from 'next/router';
import { USER_ACCESS_TOKEN_COOKIE_NAME, USER_ID_COOKIE_NAME } from '@dogu-private/types';
import { shallow } from 'zustand/shallow';

import { NextPageWithLayout } from 'pages/_app';
import H4 from 'src/components/common/headings/H4';
import ProfileImage from 'src/components/ProfileImage';
import { deleteUser, getPersonalAccessToken, getUserByIdInServerSide, regeneratePersonalAccessToken, resetPassword, updateProfileImage, updateUser } from 'src/api/user';
import ImageCropUploader from 'src/components/images/ImageCropUploader';
import H5 from 'src/components/common/headings/H5';
import ResetPasswordForm from 'src/components/registery/ResetPasswordForm';
import { getErrorMessageFromAxios } from 'src/utils/error';
import Footer from 'src/components/layouts/Footer';
import { sendErrorNotification, sendSuccessNotification } from '../../src/utils/antd';
import { checkUserVerifiedInServerSide } from '../../src/utils/auth';
import DangerZone from '../../src/components/common/boxes/DangerZone';
import useAuthStore from '../../src/stores/auth';
import EmailPreferenceModifier from '../../src/components/users/EmailPreferenceModifier';
import { redirectWithLocale } from '../../src/ssr/locale';
import ConsoleBasicLayout from '../../src/components/layouts/ConsoleBasicLayout';
import useEventStore from '../../src/stores/events';
import RegenerateTokenButton from '../../src/components/common/RegenerateTokenButton';
import AccessTokenButton from '../../src/components/common/AccessTokenButton';
import SettingTitleDivider from '../../src/components/common/SettingTitleDivider';

interface Props {
  user: UserBase;
}

const AccountPage: NextPageWithLayout<Props> = ({ user }) => {
  const [me, updateMe] = useAuthStore((state) => [state.me, state.updateAuthStore]);
  const [editingMe, setEditingMe] = useState<UserBase>();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();
  const fireEvent = useEventStore((state) => state.fireEvent<UserBase>, shallow);

  const isChanged = me?.profileImageUrl !== editingMe?.profileImageUrl || me?.name !== editingMe?.name;

  useEffect(() => {
    setEditingMe(user);
  }, [user]);

  const updateProfileImageToThumbnail = (src: string) => {
    setEditingMe((prev) => {
      if (prev) {
        return { ...prev, profileImageUrl: src };
      }
    });
  };

  const uploadImage = async (file: File) => {
    setIsImageUploading(true);
    setProgress(0);
    try {
      const result = await updateProfileImage(user.userId, file, (e) => {
        if (!e.total) {
          return;
        }
        setProgress((e.loaded / e.total) * 100);
      });
      sendSuccessNotification('Profile image uploaded successfully');
      mutate('/registery/check', result, false);
      fireEvent('onUserUpdated', result);
      updateMe(result);
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('account:profileImageUploadFailMsg', { reason: getErrorMessageFromAxios(e) }));
      }
    }
    setIsImageUploading(false);
    setProgress(null);
  };

  const handleClickSave = async () => {
    if (!user || !editingMe || !isChanged) {
      return;
    }
    setLoading(true);
    const { name } = editingMe;

    try {
      const result = await updateUser(user.userId, { name });
      sendSuccessNotification(t('account:profileUpdateSuccessMsg'));
      mutate('/registery/check', result, false);
      fireEvent('onUserUpdated', result);
      updateMe(result);
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('account:profileUpdateFailMsg', { reason: getErrorMessageFromAxios(e) }));
      }
    }
    setLoading(false);
  };

  const handleResetPassword = useCallback(
    async (currentPassword: string | undefined, newPassword: string, confirmPassword: string) => {
      if (!currentPassword || !user) {
        return;
      }

      try {
        await resetPassword(user.userId, { currentPassword, newPassword, confirmPassword });
        sendSuccessNotification(t('account:resetPasswordSuccessMsg'));
      } catch (e) {
        if (e instanceof AxiosError) {
          if (e.response?.status === 401) {
            sendErrorNotification(t('account:resetPasswordValidationFailMsg'));
            return;
          }
          sendErrorNotification(t('account:resetPasswordFailedMsg', { reason: getErrorMessageFromAxios(e) }));
        }
      }
    },
    [user],
  );

  const handleDeleteAccount = useCallback(async () => {
    if (!user) {
      return;
    }
    try {
      await deleteUser(user.userId);
      sendSuccessNotification(t('account:deleteAccountConfirmSuccessMessage'));
      router.push('/');
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('account:deleteAccountConfirmFailureMessage', { reason: getErrorMessageFromAxios(e) }));
      }
    }
  }, [user]);

  const getToken = useCallback(async () => {
    try {
      const token = await getPersonalAccessToken(user.userId);
      return token;
    } catch (e) {
      sendErrorNotification('Failed to get access token.');
    }
  }, [user.userId]);

  return (
    <>
      <Head>
        <title>Account settings | Dogu</title>
      </Head>
      <Box>
        <H4>{t('account:accountPageTitle')}</H4>
        <Divider />
        <Inner>
          <SettingTitleDivider title="General" />
          <ImageCropUploader
            profileImage={<ProfileImage size={120} profileImageUrl={editingMe?.profileImageUrl ?? null} name={editingMe?.name ?? 'Name'} style={{ fontSize: '2.5rem' }} />}
            onCropEnd={updateProfileImageToThumbnail}
            progress={progress}
            onUpload={uploadImage}
          />
          <ContentBox>
            <Label>{t('common:email')}</Label>
            <Input disabled value={user.email} />
          </ContentBox>
          <ContentBox>
            <Label>{t('common:name')}</Label>
            <Input
              type="text"
              maxLength={20}
              value={editingMe?.name}
              onChange={(e) =>
                setEditingMe((prev) => {
                  if (prev) {
                    return { ...prev, name: e.target.value };
                  }
                })
              }
            />
          </ContentBox>
          <ContentBox style={{ display: 'flex' }}>
            <Button type="primary" disabled={isImageUploading || !isChanged} loading={loading} onClick={handleClickSave} access-id="update-proifle-btn">
              {t('account:profileContentSubmitButton')}
            </Button>
          </ContentBox>
        </Inner>

        <SettingTitleDivider title="Security" />
        <Inner>
          <div style={{ marginTop: '1rem' }}>
            <Label>Personal Access Token</Label>
            <AccessTokenButton getToken={getToken} />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <Label>Update password</Label>
            <ResetPasswordForm needCurrentPassword={true} onFinish={handleResetPassword} />
          </div>
        </Inner>

        {process.env.NEXT_PUBLIC_ENV !== 'self-hosted' && (
          <>
            <SettingTitleDivider title="Email" />
            <Inner>
              <EmailPreferenceModifier user={user} />
            </Inner>
          </>
        )}

        <div style={{ marginTop: '3rem' }}>
          <DangerZone>
            <DangerZone.Item
              title={t('common:regenerateAccessTokenTitle')}
              description={t('common:regenerateAccessTokenDescriptionText')}
              button={<RegenerateTokenButton regenerate={async () => regeneratePersonalAccessToken(user.userId)} />}
            />
            <DangerZone.Item
              title={t('account:deleteAccountMenuTitle')}
              description={t('account:deleteAccountMenuDescriptionText')}
              button={
                <DangerZone.Button
                  modalTitle={t('account:deleteAccountConfirmModalTitle')}
                  modalContent={t('account:deleteAccountConfirmModalContent')}
                  modalButtonTitle={t('account:deleteAccountConfirmModalButtonTitle')}
                  onConfirm={handleDeleteAccount}
                >
                  {t('account:deleteAccountButtonTitle')}
                </DangerZone.Button>
              }
            />
          </DangerZone>
        </div>
      </Box>
    </>
  );
};

AccountPage.getLayout = (page) => {
  return (
    <ConsoleBasicLayout>
      {page}
      <Footer />
    </ConsoleBasicLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const [userResult, checkResult] = await Promise.all([getUserByIdInServerSide(context), checkUserVerifiedInServerSide(context)]);

    if ('redirect' in checkResult) {
      if (checkResult.redirect) {
        return {
          redirect: checkResult.redirect as Redirect,
        };
      }

      return {
        redirect: redirectWithLocale(context, '/signin', false),
      };
    }

    return {
      props: {
        user: userResult,
      },
    };
  } catch (e) {
    if (e instanceof AxiosError) {
      if (e.response?.status === 401) {
        context.res.setHeader('Set-Cookie', [
          `${USER_ID_COOKIE_NAME}=; path=/; expires=${new Date(0).toUTCString()};`,
          `${USER_ACCESS_TOKEN_COOKIE_NAME}=; path=/; expires=${new Date(0).toUTCString()}; httpOnly;`,
        ]);
      }
    }

    return {
      redirect: redirectWithLocale(context, '/signin', false),
    };
  }
};

export default AccountPage;

const Box = styled.div`
  padding: ${(props) => props.theme.spaces.xlarge};
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  flex: 1;
  font-size: 0.9rem;
`;

const Inner = styled.div``;

const StyledH5 = styled(H5)`
  margin-bottom: 0.5rem;
`;

const ContentBox = styled.div`
  margin-bottom: 1.25rem;
`;

const Label = styled.p`
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
`;
