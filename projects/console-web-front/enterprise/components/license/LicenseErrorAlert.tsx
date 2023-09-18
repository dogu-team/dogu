import { LicenseErrorInfo } from '@dogu-private/console';
import { Alert, Button } from 'antd';

interface Props {
  errorInfo: LicenseErrorInfo;
}

const LicenseErrorAlert: React.FC<Props> = ({ errorInfo }) => {
  const getErrorMessage = () => {
    if (errorInfo.isLicenseServerDisConnected) {
      return 'License server is disconnected. Please check your network or contact us.';
    }
    if (errorInfo.isTokenInValid) {
      return 'License token is invalid. Please check your license token or contact us.';
    }
    if (errorInfo.unKnownError) {
      return 'Something went wrong. Please check your network or contact us.';
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
              Visit Docs
            </Button>
            <Button type="link" href={`${process.env.NEXT_PUBLIC_LANDING_URL}/contact-us`} target="_blank">
              Contact us
            </Button>
          </>
        ) : (
          <Button type="link" href={`${process.env.NEXT_PUBLIC_LANDING_URL}/contact-us`} target="_blank">
            Contact us
          </Button>
        )
      }
    />
  );
};

export default LicenseErrorAlert;
