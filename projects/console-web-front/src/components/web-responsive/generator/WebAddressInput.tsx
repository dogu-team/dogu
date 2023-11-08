import React, { useState, ChangeEvent, KeyboardEvent } from 'react';
import { Input } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';

const WebAddressInput: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [addresses, setAddresses] = useState<string[]>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && inputValue.trim()) {
      setAddresses([...addresses, inputValue.trim()]);
      setInputValue('');
      e.preventDefault();
    }
  };

  const handleRemoveAddress = (indexToRemove: number) => {
    setAddresses(addresses.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div>
      <Input
        placeholder="Enter website addresses"
        value={inputValue}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        style={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap' }}
        prefix={
          <div style={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap' }}>
            {addresses.map((address, index) => (
              <span
                key={index}
                style={{ color: 'red', border: '1px solid red', padding: '5px', margin: '2px', position: 'relative' }}
              >
                {address}
                <CloseCircleOutlined
                  style={{ color: 'black', position: 'absolute', top: '-5px', right: '-5px', cursor: 'pointer' }}
                  onClick={() => handleRemoveAddress(index)}
                />
              </span>
            ))}
          </div>
        }
      />
    </div>
  );
};

export default WebAddressInput;
