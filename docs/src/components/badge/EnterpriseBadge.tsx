import React from 'react';
import Badge from './Badge';

const EnterpriseBadge = () => {
  return (
    <Badge
      label={'Enterprise Support'}
      overlayText={
        'Available in the cloud, self-hosted professinal, self-hosted enterprise'
      }
      backgroundColor={'#efaf39'}
    ></Badge>
  );
};

export default EnterpriseBadge;
