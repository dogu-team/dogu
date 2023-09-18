import { Menu, Dropdown, Button, MenuProps } from 'antd';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';
import Cookies from 'universal-cookie';
import { USER_ACCESS_TOKEN_COOKIE_NAME } from '@dogu-private/types';
import { UserBase } from '@dogu-private/console';
import { useEffect, useRef } from 'react';

import useAuth from 'src/hooks/useAuth';
import ProfileImage from 'src/components/ProfileImage';
import { signOut } from 'src/api/registery';
import useAuthStore from '../stores/auth';
import useEventStore from '../stores/events';

const AccountMenu = () => {
  const { cache } = useSWRConfig();
  const { me, mutate } = useAuth();
  const [storedMe, updateAuthStore] = useAuthStore((state) => [state.me, state.updateAuthStore]);
  const router = useRouter();
  const { t } = useTranslation();
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    useEventStore.subscribe(({ eventName, payload }) => {
      if (eventName === 'onUserUpdated' && imageRef.current) {
        const user = payload as UserBase | undefined;
        if (user) {
          if (user.profileImageUrl) {
            mutate(
              (prev) => ({
                ...prev,
                ...user,
                profileImageUrl: (user.profileImageUrl += `?lastModified=${new Date().getTime()}`),
              }),
              false,
            );
            updateAuthStore({
              ...user,
              profileImageUrl: (user.profileImageUrl += `?lastModified=${new Date().getTime()}`),
            });
          } else {
            mutate((prev) => {
              if (prev) {
                return { ...prev, user };
              }
            }, false);
            updateAuthStore(user);
          }
        }
      }
    });
  }, [mutate]);

  if (!me) {
    return null;
  }

  const items: MenuProps['items'] = [
    {
      type: 'group',
      label: <GroupTitle>{t('common:accountMenuAccountTitle')}</GroupTitle>,
      key: 'group-account',
      children: [
        {
          label: (
            <StyledItem onClick={() => router.push('/account')}>
              <AccountItem>
                <ProfileImage name={storedMe?.name} size={48} profileImageUrl={storedMe?.profileImageUrl} />
                <AccountTextWrapper>
                  <Name id="account-name">{storedMe?.name}</Name>
                  <Email>{storedMe?.email}</Email>
                </AccountTextWrapper>
              </AccountItem>
            </StyledItem>
          ),
          key: 'account',
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      type: 'group',
      key: 'group-work',
      label: <GroupTitle>{t('common:accountMenuWorksTitle')}</GroupTitle>,
      children: [
        {
          label: (
            <StyledItem onClick={() => router.push(`/account/organizations`)}>
              {t('common:accountMenuMyOrgListButton')}
            </StyledItem>
          ),
          key: '1',
        },
        process.env.NEXT_PUBLIC_ENV === 'self-hosted' && me.isRoot
          ? {
              label: <StyledItem onClick={() => router.push(`/admin`)}>{t('common:accountAdminButton')}</StyledItem>,
              key: '2',
            }
          : null,
      ],
    },
    {
      type: 'divider',
    },
    {
      label: (
        <StyledSignoutItem>
          <Button
            style={{ width: '80%' }}
            onClick={async () => {
              try {
                await signOut();
                cache.delete(`/registery/check`);
                updateAuthStore(null);
              } catch (e) {
                const cookie = new Cookies();
                cookie.remove(USER_ACCESS_TOKEN_COOKIE_NAME);
              }
              sessionStorage.clear();
              router.push('/');
            }}
          >
            {t('common:signout')}
          </Button>
        </StyledSignoutItem>
      ),
      key: 'signout',
    },
  ];

  return (
    <StyledDropDown menu={{ items }} trigger={['click']}>
      <Wrapper>
        <ProfileImage ref={imageRef} profileImageUrl={storedMe?.profileImageUrl} name={storedMe?.name} size={32} />
      </Wrapper>
    </StyledDropDown>
  );
};

export default AccountMenu;

const StyledDropDown = styled(Dropdown)`
  -webkit-app-region: no-drag;
  width: 40px;
  height: 40px;
  padding: 4px;
  border-radius: 50%;
  user-select: none;

  &:hover {
    background-color: ${(props) => props.theme.colors.gray3};
    cursor: pointer;
  }
`;

const Wrapper = styled.div`
  -webkit-app-region: no-drag;
`;

const StyledMenu = styled(Menu)`
  .ant-dropdown-menu-item {
    background-color: #fff !important;
  }
`;

const GroupTitle = styled.p`
  font-weight: 600;
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.gray5};
  text-transform: uppercase;
  margin-top: 4px;
`;

const StyledSignoutItem = styled.div`
  display: flex;
  padding: 8px 0;
  justify-content: center;
`;

const StyledItem = styled.div`
  padding: 8px;
  color: ${(props) => props.theme.colors.black};
  :hover {
    background-color: #f5f5f5 !important;
  }
`;

const AccountItem = styled.div`
  display: flex;
  align-items: center;
`;

const AccountTextWrapper = styled.div`
  margin-left: 12px;
`;

const Name = styled.p`
  width: 180px;
  font-size: 1.1rem;
  font-weight: 500;
  overflow-wrap: break-word;
`;

const Email = styled.p`
  width: 180px;
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.gray6};
  overflow-wrap: break-word;
`;
