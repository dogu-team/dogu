import React from 'react';
import Badge from './Badge';

const EnterpriseBadge = () => {
  return (
    <Badge
      label={'Enterprise Support'}
      overlayText={'Available in the enterprise, cloud'}
      backgroundColor={'#efaf39'}
    ></Badge>
  );
};

export default EnterpriseBadge;
