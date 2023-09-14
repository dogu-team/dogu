import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { Drawer } from 'antd';
import { CloseOutlined, MenuOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { useRouter } from 'next/router';

import H4 from 'src/components/common/headings/H4';
import useEventStore from 'src/stores/events';
import useAuthStore from 'src/stores/auth';
import resources from '../../resources';
import { maxWidthInnerStyle } from '../../styles/main';

interface Props {
  links?: React.ReactNode;
  right?: React.ReactNode;
  drawerItem?: React.ReactNode;
  limitWidth?: boolean;
  image?: React.ReactNode;
}

const Header = ({ links, right, drawerItem, limitWidth = false, image }: Props) => {
  const { me } = useAuthStore();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    useEventStore.subscribe(({ eventName }) => {
      if (eventName === 'onDrawerItemClicked') {
        setOpen(false);
      }
    });
  }, []);

  return (
    <>
      <StyledHeader>
        <RelativeWrapper limitWidth={limitWidth}>
          <Inner>
            <FlexAlignCenterBox>
              <Name>
                {image ?? (
                  <StyledLink
                    href={
                      me ? (router.query.orgId ? `/dashboard/${router.query.orgId}` : `/account/organizations`) : '/'
                    }
                  >
                    <Image src={resources.icons.logoHorizontal} width={99} height={48} alt="Dogu" priority />
                  </StyledLink>
                )}
              </Name>
              <LinkMenuContainer>{links}</LinkMenuContainer>
            </FlexAlignCenterBox>
            <FlexAlignCenterBox>
              {right}
              <MenuBox onClick={() => setOpen(true)}>
                <MenuOutlined style={{ fontSize: 24 }} />
              </MenuBox>
            </FlexAlignCenterBox>
          </Inner>
        </RelativeWrapper>
      </StyledHeader>

      <Drawer
        title={
          <DrawerHeader>
            <H4>Menu</H4>
            <MenuBox onClick={() => setOpen(false)}>
              <CloseOutlined style={{ fontSize: 24, color: '#000' }} />
            </MenuBox>
          </DrawerHeader>
        }
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
        width="80%"
        destroyOnClose
        closable={false}
        headerStyle={{ alignSelf: 'flex-end', padding: '0 1rem', width: '100%' }}
        bodyStyle={{ padding: '0' }}
      >
        {drawerItem}
      </Drawer>
    </>
  );
};

const StyledHeader = styled.header`
  height: 56px;
  background-color: ${(props) => props.theme.colors.white};
  z-index: 10;
  flex-shrink: 0;
  box-sizing: content-box;
  border-bottom: 1px solid ${(props) => props.theme.main.colors.gray6};

  @media screen and (max-width: 767px) {
    display: flex;
    align-items: center;
  }
`;

const RelativeWrapper = styled.div<{ limitWidth?: boolean }>`
  ${maxWidthInnerStyle}
  position: relative;
  height: 100%;
  ${(props) => (props.limitWidth ? '' : 'max-width: none;')}
`;

const Inner = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: space-between;
`;

const Name = styled.h1`
  display: flex;
  height: 40px;
  align-items: center;
  user-select: none;
`;

const StyledLink = styled(Link)`
  display: flex;
  font-weight: 700;
  font-size: 28px;
  color: #000;
  &:hover {
    color: #000 !important;
  }
`;

const FlexAlignCenterBox = styled.div`
  display: flex;
  align-items: center;
`;

const LinkMenuContainer = styled(FlexAlignCenterBox)`
  margin-left: 3rem;

  @media only screen and (max-width: 1023px) {
    margin-left: 1rem;
  }

  @media only screen and (max-width: 767px) {
    display: none;
  }
`;

const MenuBox = styled.div`
  display: none;
  margin-left: 1rem;
  padding: 4px;

  @media only screen and (max-width: 767px) {
    display: block;
  }
`;

const DrawerHeader = styled.div`
  display: flex;
  height: 56px;
  justify-content: space-between;
  align-items: center;
`;

export default Header;
