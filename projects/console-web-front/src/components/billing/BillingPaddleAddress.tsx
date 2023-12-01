import { shallow } from 'zustand/shallow';
import iso3311a2 from 'iso-3166-1-alpha-2';
import styled from 'styled-components';
import { EditOutlined } from '@ant-design/icons';
import { useEffect } from 'react';
import { Button, Form, Input, Modal, Select, Space } from 'antd';

import { updatePaddleAddress } from '../../api/billing';
import useModal from '../../hooks/useModal';
import useRequest from '../../hooks/useRequest';
import useLicenseStore from '../../stores/license';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { flexRowBaseStyle } from '../../styles/box';

type BillingPaddleAddressForm = {
  first: string | undefined;
  second: string | undefined;
  city: string | undefined;
  zip: string | undefined;
  state: string | undefined;
  country: string;
};

const BillingPaddleAddressEditor: React.FC<{
  open: boolean;
  close: () => void;
}> = ({ open, close }) => {
  const [license, updateLicense] = useLicenseStore((state) => [state.license, state.updateLicense], shallow);
  const [loading, requestUpdate] = useRequest(updatePaddleAddress);
  const [form] = Form.useForm<BillingPaddleAddressForm>();

  const handleClose = () => {
    form.resetFields();
    close();
  };

  const handleUpdateAddress = async (values: BillingPaddleAddressForm) => {
    if (!license) {
      return;
    }

    try {
      const rv = await requestUpdate({
        organizationId: license.organizationId,
        firstLine: values.first,
        secondLine: values.second,
        city: values.city,
        postalCode: values.zip,
        region: values.state,
        countryCode: values.country,
      });
      if (rv.body) {
        updateLicense({
          ...license,
          billingOrganization: {
            ...license.billingOrganization,
            billingMethodPaddle: {
              ...license.billingOrganization.billingMethodPaddle,
              address: rv.body,
            },
          },
        });
        sendSuccessNotification(`Successfully updated address`);
        close();
      } else {
        throw new Error('Failed to update address');
      }
    } catch (e) {
      sendErrorNotification(`Failed to update address`);
    }
  };

  if (!license?.billingOrganization.billingMethodPaddle.address) {
    return null;
  }

  const address = license.billingOrganization.billingMethodPaddle.address;
  const { firstLine, secondLine, city, postalCode, region, countryCode } = address;

  return (
    <Modal
      centered
      onCancel={handleClose}
      destroyOnClose
      open={open}
      title="Change billing address"
      okButtonProps={{
        htmlType: 'submit',
        form: 'paddle-address',
      }}
      confirmLoading={loading}
      okText={'Save'}
      cancelText={'Cancel'}
    >
      <Form form={form} id="paddle-address" layout="vertical" onFinish={handleUpdateAddress}>
        <StyledSpace style={{ width: '100%' }}>
          <Form.Item label="First Address" name="first" initialValue={firstLine}>
            <Input placeholder="Office, floor, etc" />
          </Form.Item>
          <Form.Item label="Second Address" name="second" initialValue={secondLine}>
            <Input placeholder="Office, floor, etc" />
          </Form.Item>
        </StyledSpace>
        <StyledSpace style={{ width: '100%' }}>
          <Form.Item label="City" name="city" initialValue={city}>
            <Input placeholder="Los Angeles" />
          </Form.Item>
          <Form.Item label="State, county, or region" name="state" initialValue={region}>
            <Input placeholder="California" />
          </Form.Item>
        </StyledSpace>
        <StyledSpace style={{ width: '100%' }}>
          <Form.Item
            label="Country"
            name="country"
            initialValue={countryCode}
            required
            rules={[{ required: true, message: 'Please select country' }]}
          >
            <Select
              placeholder="Country"
              options={Object.keys(iso3311a2.getData()).map((code) => {
                return {
                  label: iso3311a2.getCountry(code),
                  value: code,
                };
              })}
            />
          </Form.Item>
          <Form.Item
            label="Zip/Postal code"
            name="zip"
            initialValue={postalCode}
            required
            rules={[{ required: true, message: 'Please enter zip/postal code' }]}
          >
            <Input required placeholder="Zip/Postal code" />
          </Form.Item>
        </StyledSpace>
      </Form>
    </Modal>
  );
};

const BillingPaddleAddress: React.FC = () => {
  const license = useLicenseStore((state) => state.license);
  const [isOpen, openModal, closeModal] = useModal();

  if (!license?.billingOrganization.billingMethodPaddle.address) {
    return null;
  }

  const address = license.billingOrganization.billingMethodPaddle.address;
  const { firstLine, secondLine, city, postalCode, region, countryCode } = address;

  const displayAddress = [
    firstLine,
    secondLine,
    city,
    region,
    postalCode,
    countryCode ? iso3311a2.getCountry(countryCode) : undefined,
  ]
    .filter((value) => !!value)
    .join(', ');

  return (
    <>
      <div>
        <TitleWrapper>
          <Title>Address</Title>
          <Button onClick={() => openModal()} icon={<EditOutlined />} type="link" />
        </TitleWrapper>
        <Content>
          <p>{displayAddress}</p>
        </Content>
      </div>

      <BillingPaddleAddressEditor open={isOpen} close={closeModal} />
    </>
  );
};

export default BillingPaddleAddress;

const StyledSpace = styled(Space)`
  & > * {
    flex: 1;
  }
`;

const TitleWrapper = styled.div`
  ${flexRowBaseStyle}
`;

const Title = styled.p`
  font-size: 1rem;
  font-weight: 500;
`;

const Content = styled.div`
  width: 250px;
`;
