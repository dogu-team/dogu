import useSWR from 'swr';

import { swrAuthFetcher } from '../../api';

interface Props {}

const BillingPaymentMethod: React.FC<Props> = () => {
  const { data } = useSWR('/billing/payment-method', swrAuthFetcher, { revalidateOnFocus: false });

  return (
    <div>
      <div>
        Card number: {data?.cardNumber} {`(Visa)`}
      </div>
      <div>Expiry: {data?.cardExpiration}</div>
    </div>
  );
};

export default BillingPaymentMethod;
