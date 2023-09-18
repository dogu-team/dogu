import { ArrowRightOutlined } from '@ant-design/icons';
import { LicenseResponse, UserBase } from '@dogu-private/console';
import { Tag, Tooltip } from 'antd';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';

import { checkCommunityEdition } from '../../utils/license';
import ProTag from '../common/ProTag';

interface Props {
  licenseInfo: LicenseResponse;
  me: UserBase;
}

const LicenseTag: React.FC<Props> = ({ licenseInfo, me }) => {
  const isCommunity = checkCommunityEdition(licenseInfo);
  const { t } = useTranslation();

  if (process.env.NEXT_PUBLIC_ENV === 'self-hosted') {
    return !isCommunity ? (
      <ProTag
        style={{ marginLeft: '-2rem' }}
        warnging={licenseInfo?.errorInfo !== null}
        warningMessage={
          licenseInfo?.errorInfo ? (
            me.isRoot ? (
              <p style={{ fontSize: '.8rem', lineHeight: '1.5' }}>
                <Trans
                  i18nKey="license:licenseRootWarningMessage"
                  components={{
                    br: <br />,
                    link: <Link href="/admin" />,
                  }}
                />
              </p>
            ) : (
              <p style={{ fontSize: '.8rem', lineHeight: '1.5' }}>
                <Trans
                  i18nKey="license:licenseCommonWarningMessage"
                  components={{
                    br: <br />,
                  }}
                />
              </p>
            )
          ) : undefined
        }
      />
    ) : (
      <Tooltip
        placement="bottom"
        title={
          <div>
            <p>Community Edition</p>
            <div style={{ marginTop: '.25rem' }}>
              <a href={`${process.env.NEXT_PUBLIC_LANDING_URL}/pricing?type=self-hosted`} target="_blank">
                {t('license:comparePlans')} <ArrowRightOutlined />
              </a>
            </div>
          </div>
        }
      >
        <Tag style={{ marginLeft: '-2rem', fontSize: '12px' }} color="blue">
          Community
        </Tag>
      </Tooltip>
    );
  }

  return null;
};

export default LicenseTag;
