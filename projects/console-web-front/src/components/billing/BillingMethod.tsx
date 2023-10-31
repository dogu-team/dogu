import useSWR from 'swr';

import { swrAuthFetcher } from '../../api';

interface Props {}

const BillingMethod: React.FC = () => {
  const { data } = useSWR('/billing/payment-method', swrAuthFetcher, { revalidateOnFocus: false });

  return (
    <div>
      <div>Card number: {data?.cardNumber}</div>
      <div>Expiry: {data?.cardExpiration}</div>
      <div></div>
    </div>
  );
};

export default BillingMethod;
