import { useState } from 'react';
import { Button, Input, Modal, Radio, Space, Form } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { OrganizationId, USER_EMAIL_MAX_LENGTH } from '@dogu-private/types';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { PlusOutlined } from '@ant-design/icons';
import Trans from 'next-translate/Trans';
import { AxiosError } from 'axios';

import H5 from 'src/components/common/headings/H5';
import { checkEmail } from 'src/utils/validation';
import { inviteUsers } from 'src/api/organization';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import useDebouncedInputValues from '../../hooks/useDebouncedInputValues';
import useEventStore from '../../stores/events';
import { getErrorMessage } from '../../utils/error';
import { ORGANIZATION_ROLE } from '../../types/organization';

const InviteUserButton = () => {
  const { inputValue, debouncedValue, handleChangeValues } = useDebouncedInputValues();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState<string>();
  const [permission, setPermission] = useState<ORGANIZATION_ROLE>(ORGANIZATION_ROLE.MEMBER);
  const router = useRouter();
  const orgId = router.query.orgId as OrganizationId;
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const fireEvent = useEventStore((state) => state.fireEvent);
  const [form] = Form.useForm();

  const closeModal = () => {
    setPermission(ORGANIZATION_ROLE.MEMBER);
    setEmail(undefined);
    setIsOpen(false);
    handleChangeValues('');
  };

  const handleClickSend = async () => {
    if (!email || !checkEmail(email)) {
      return;
    }
    setLoading(true);

    try {
      await inviteUsers(orgId, { email, organizationRoleId: permission });
      sendSuccessNotification(t('org-member:inviteMemberSuccessMsg'));
      fireEvent('onInvitationSent');
      closeModal();
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('org-member:inviteMemberFailMsg', { reason: getErrorMessage(e) }));
      }
    }

    setLoading(false);
  };

  return (
    <>
      <StyledButton type="primary" onClick={() => setIsOpen(true)} access-id={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'invite-user-btn' : undefined}>
        {t('org-member:inviteMemberButtonText')}
      </StyledButton>

      <Modal
        open={isOpen}
        centered
        closable
        onCancel={closeModal}
        cancelText={t('common:cancel')}
        okText={t('common:send')}
        onOk={handleClickSend}
        confirmLoading={loading}
        {...(email ? {} : { footer: null })}
        okButtonProps={{
          id: process.env.NEXT_PUBLIC_ENV !== 'production' ? 'invite-user-send-btn' : undefined,
        }}
      >
        <H5>{t('org-member:inviteModalTitle')}</H5>
        <InputWrapper style={{ marginTop: '1rem' }}>
          {email ? (
            <div>
              <p style={{ marginBottom: '.5rem' }}>
                <Trans i18nKey="org-member:inviteEmailPermissionSelectDescription1" components={{ b: <b style={{ fontWeight: '700' }} /> }} values={{ email }} />
              </p>
              <p style={{ marginBottom: '.5rem' }}>{t('org-member:inviteEmailPermissionSelectDescription2')}</p>
              <Radio.Group
                value={permission}
                onChange={(e) => {
                  setPermission(e.target.value);
                }}
              >
                <Space direction="vertical">
                  <StyledRadio value={ORGANIZATION_ROLE.ADMIN} style={{ marginBottom: '.5rem' }}>
                    <PermissionBox>
                      <PermissionTitle>Admin</PermissionTitle>
                      <PermissionDescription>{t('org-member:inviteAdminPermssionDescription')}</PermissionDescription>
                    </PermissionBox>
                  </StyledRadio>
                  <StyledRadio value={ORGANIZATION_ROLE.MEMBER}>
                    <PermissionBox>
                      <PermissionTitle access-id={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'invite-user-member-permission-title' : undefined}>Member</PermissionTitle>
                      <PermissionDescription>{t('org-member:inviteMemberPermissionDescription')}</PermissionDescription>
                    </PermissionBox>
                  </StyledRadio>
                </Space>
              </Radio.Group>

              <p></p>
            </div>
          ) : (
            <Form
              onFinish={() => {
                setEmail(inputValue);
              }}
              form={form}
            >
              <Form.Item>
                <Input
                  value={inputValue}
                  onChange={(e) => handleChangeValues(e.target.value)}
                  maxLength={USER_EMAIL_MAX_LENGTH}
                  placeholder={t('org-member:emailPlaceholder')}
                  allowClear
                  access-id={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'invite-user-input' : undefined}
                />
              </Form.Item>
            </Form>
          )}

          {!email && !!debouncedValue && (
            <AddEmailButtonBox>
              <Button
                style={{ width: '100%' }}
                onClick={() => {
                  setEmail(debouncedValue);
                  handleChangeValues('');
                }}
                access-id={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'invite-user-add-email-btn' : undefined}
              >
                <PlusOutlined />
                &nbsp;
                <Trans i18nKey="org-member:inviteEmailButtonText" components={{ b: <b style={{ fontWeight: '700' }} /> }} values={{ email: debouncedValue }} />
              </Button>
            </AddEmailButtonBox>
          )}
        </InputWrapper>
      </Modal>
    </>
  );
};

export default InviteUserButton;

const StyledButton = styled(Button)`
  @media only screen and (max-width: 767px) {
    margin-bottom: 0.5rem;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 3rem;
`;

const AddEmailButtonBox = styled.div`
  position: absolute;
  top: 36px;
  left: 0;
  right: 0;
  border-radius: 8px;
  box-shadow: ${(props) => props.theme.main.shadows.blackBold};
`;

const StyledRadio = styled(Radio)`
  width: 100%;
`;

const PermissionBox = styled.div`
  margin-left: 0.5rem;
`;

const PermissionTitle = styled.p`
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
`;

const PermissionDescription = styled.p`
  font-size: 0.8rem;
`;
