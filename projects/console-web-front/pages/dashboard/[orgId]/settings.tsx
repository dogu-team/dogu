import styled from 'styled-components';
import { Button, Divider, Input } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { OrganizationBase, UserBase } from '@dogu-private/console';
import useTranslation from 'next-translate/useTranslation';
import Head from 'next/head';
import { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import Trans from 'next-translate/Trans';

import { NextPageWithLayout } from 'pages/_app';
import ConsoleLayout from 'src/components/layouts/ConsoleLayout';
import OrganizationSideBar from 'src/components/layouts/OrganizationSideBar';
import ProfileImage from 'src/components/ProfileImage';
import ImageCropUploader from 'src/components/images/ImageCropUploader';
import {
  getOrganizationAccessToken,
  regenerateOrganizationAccessToken,
  removeOrganization,
  updateOrganization,
  updateOrganizationOwner,
  uploadOrganizationImage,
} from 'src/api/organization';
import { getOrganizationPageServerSideProps, OrganizationServerSideProps } from 'src/ssr/organization';
import { sendErrorNotification, sendSuccessNotification } from '../../../src/utils/antd';
import { getErrorMessageFromAxios } from '../../../src/utils/error';
import OrganizationOwnerSelector from '../../../src/components/organizations/OrganizationOwnerSelector';
import DangerZone from '../../../src/components/common/boxes/DangerZone';
import TokenCopyInput from '../../../src/components/common/TokenCopyInput';
import RegenerateTokenButton from '../../../src/components/common/RegenerateTokenButton';
import AccessTokenButton from '../../../src/components/common/AccessTokenButton';
import SlackButton from '../../../enterprise/components/integration/SlackConnectButton';
import SettingTitleDivider from '../../../src/components/common/SettingTitleDivider';
import useOrganizationContext from '../../../src/hooks/context/useOrganizationContext';

const OrganizationSettingPage: NextPageWithLayout<OrganizationServerSideProps> = ({ organization }) => {
  const [editingOrganization, setEditingOrganization] = useState<OrganizationBase>(organization);
  const [newOwner, setNewOwner] = useState<UserBase>();
  const [loading, setLoading] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const { mutate } = useOrganizationContext();
  const [progress, setProgress] = useState<number | null>(null);
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    setEditingOrganization(organization);
  }, [organization]);

  const handleRemove = async () => {
    try {
      await removeOrganization(organization.organizationId);
      sendSuccessNotification('Removed');
      router.push(`/account/organizations`);
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(`Failed to remove.\n${getErrorMessageFromAxios(e)}`);
      }
    }
  };

  const updateProfileImage = (src: string) =>
    setEditingOrganization((prev) => {
      return { ...prev, profileImageUrl: src };
    });

  const uploadImage = async (file: File) => {
    setIsImageUploading(true);
    setProgress(0);
    try {
      const data = await uploadOrganizationImage(organization.organizationId, file, (e) => {
        if (!e.total) {
          return;
        }

        setProgress((e.loaded / e.total) * 100);
      });
      mutate?.(data, false);
      sendSuccessNotification('Image uploaded successfully');
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(`Failed to upload image.\n${getErrorMessageFromAxios(e)}`);
      }
    }
    setIsImageUploading(false);
    setProgress(null);
  };

  const handleSubmit = async () => {
    if (!organization.organizationId) {
      return;
    }

    setLoading(true);
    try {
      await updateOrganization(organization.organizationId, {
        name: editingOrganization?.name ?? '',
      });
      sendSuccessNotification('Updated!');
      mutate?.((prev) => {
        if (prev) {
          return {
            ...prev,
            name: editingOrganization?.name ?? '',
            profileImageUrl: editingOrganization?.profileImageUrl ?? null,
          };
        }
      });
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(`Failed to update.\n${getErrorMessageFromAxios(e)}`);
      }
    }
    setLoading(false);
  };

  const handleChangeOwner = useCallback(async () => {
    if (newOwner) {
      try {
        await updateOrganizationOwner(organization.organizationId, newOwner.userId);
        sendSuccessNotification('Owner changed');
      } catch (e) {
        if (e instanceof AxiosError) {
          setNewOwner(undefined);
          sendErrorNotification(`Failed to update.\n${getErrorMessageFromAxios(e)}`);
        }
      }
    }
  }, [newOwner, organization.organizationId]);

  const getToken = useCallback(async () => {
    try {
      const token = await getOrganizationAccessToken(organization.organizationId);
      return token;
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(`Failed to get token.\n${getErrorMessageFromAxios(e)}`);
      }
    }
  }, [organization.organizationId]);

  const isChanged = JSON.stringify(organization) !== JSON.stringify(editingOrganization);

  return (
    <>
      <Head>
        <title>Setting - {organization.name} | Dogu</title>
      </Head>
      <Box>
        <SettingTitleDivider title="General" />
        <Content>
          <Label>{t('organization:sidebarSubTitle')} ID</Label>
          <TokenCopyInput value={organization.organizationId} />
        </Content>
        <Divider />
        <Content>
          <ImageCropUploader
            profileImage={
              <ProfileImage
                size={80}
                profileImageUrl={editingOrganization?.profileImageUrl ?? null}
                name={editingOrganization?.name ?? 'My team'}
                shape="square"
                style={{ fontSize: '1.5rem' }}
              />
            }
            progress={progress}
            onUpload={uploadImage}
            onCropEnd={updateProfileImage}
          />
        </Content>
        <Content>
          <Label>{t('organization:settingOrgName')}</Label>
          <Input
            value={editingOrganization?.name}
            onChange={(e) =>
              setEditingOrganization((prev) => {
                return { ...prev, name: e.target.value };
              })
            }
          />
        </Content>
        <Button
          type="primary"
          disabled={isImageUploading || !isChanged}
          loading={loading}
          onClick={handleSubmit}
          access-id="submit-org-profile-btn"
        >
          {t('common:save')}
        </Button>

        <SettingTitleDivider title="Token" />

        <Content>
          <div style={{ marginBottom: '1rem' }}></div>
          <div style={{ marginBottom: '1rem' }}>
            <Label>{t('organization:sidebarSubTitle')} Access Token</Label>
            <AccessTokenButton getToken={getToken} />
          </div>
        </Content>

        <SettingTitleDivider title="Integrations" />

        <Content>
          <SlackButton
            isConnected={organization!.organizationSlack!.length === 1}
            organizationId={organization.organizationId}
          />
        </Content>

        <div style={{ marginTop: '3rem' }}>
          <DangerZone>
            <DangerZone.Item
              title={t('common:regenerateAccessTokenTitle')}
              description={t('common:regenerateAccessTokenDescriptionText')}
              button={
                <RegenerateTokenButton
                  regenerate={async () => regenerateOrganizationAccessToken(organization.organizationId)}
                />
              }
            />
            <DangerZone.Item
              title={t('organization:settingChangeOwnerMenuTitle')}
              description={t('organization:settingChangeOwnerDescriptionText')}
              button={
                <DangerZone.Button
                  modalTitle={t('organization:settingchangeOwnerConfirmModalTitle')}
                  modalButtonTitle={t('organization:settingchangeOwnerConfirmModalButtonTitle')}
                  modalContent={
                    <div>
                      <p style={{ marginBottom: '.5rem' }}>
                        <Trans
                          i18nKey="organization:settingchangeOwnerConfirmModalContent"
                          components={{ br: <br /> }}
                        />
                      </p>
                      <div style={{ width: '100% ' }}>
                        <OrganizationOwnerSelector organization={organization} onChange={setNewOwner} />
                      </div>
                    </div>
                  }
                  onConfirm={handleChangeOwner}
                  buttonProps={{ disabled: !newOwner }}
                  access-id="change-owner-btn"
                >
                  {t('organization:settingChangeOwnerButtonTitle')}
                </DangerZone.Button>
              }
            />
            <DangerZone.Item
              title={t('organization:settingRemoveOrgMenuTitle')}
              description={t('organization:settingRemoveOrgDescriptionText')}
              button={
                <DangerZone.Button
                  modalTitle={t('organization:settingRemoveOrgConfirmModalTitle')}
                  modalButtonTitle={t('organization:settingRemoveOrgConfirmModalButtonTitle')}
                  modalContent={
                    <Trans
                      i18nKey="organization:settingRemoveOrgConfirmModalContent"
                      components={{ b: <b style={{ fontWeight: '700' }} />, br: <br /> }}
                      values={{ name: organization.name }}
                    />
                  }
                  onConfirm={handleRemove}
                  buttonProps={{
                    id: 'remove-org-confirm-btn',
                  }}
                  access-id="remove-org-btn"
                >
                  {t('organization:settingRemoveOrgButtonTitle')}
                </DangerZone.Button>
              }
            />
          </DangerZone>
        </div>
      </Box>
    </>
  );
};

OrganizationSettingPage.getLayout = (page) => {
  return (
    <ConsoleLayout
      {...page.props}
      titleI18nKey="organization:organizationSettingPageTitle"
      sidebar={<OrganizationSideBar />}
    >
      {page}
    </ConsoleLayout>
  );
};

export const getServerSideProps = getOrganizationPageServerSideProps;

export default OrganizationSettingPage;

const Box = styled.div`
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
`;

const Content = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.p`
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
`;
