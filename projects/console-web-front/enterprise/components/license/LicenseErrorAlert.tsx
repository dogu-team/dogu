import { LicenseErrorInfo } from '@dogu-private/console';
import { Alert, Button } from 'antd';
import useTranslation from 'next-translate/useTranslation';

interface Props {
  errorInfo: LicenseErrorInfo;
}

const LicenseErrorAlert: React.FC<Props> = ({ errorInfo }) => {
  const { t } = useTranslation('license');

  const getErrorMessage = () => {
    if (errorInfo.isLicenseServerDisConnected) {
      return t('licenseServerDisconnectedMessage');
    }
    if (errorInfo.isTokenInValid) {
      return t('licenseTokenInvalidMessage');
    }
    if (errorInfo.unKnownError) {
      return t('licenseUnknownErrorMessage');
    }
  };

  return (
    <Alert
      message={getErrorMessage()}
      type="error"
      showIcon
      action={
        errorInfo.isLicenseServerDisConnected ? (
          <>
            <Button type="link" href={`https://docs.dogutech.io`} target="_blank">
              {t('visitGuide')}
            </Button>
            <Button type="link" href={`${process.env.NEXT_PUBLIC_LANDING_URL}/contact-us`} target="_blank">
              {t('contactUs')}
            </Button>
          </>
        ) : (
          <Button type="link" href={`${process.env.NEXT_PUBLIC_LANDING_URL}/contact-us`} target="_blank">
            {t('contactUs')}
          </Button>
        )
      }
    />
  );
};

export default LicenseErrorAlert;
