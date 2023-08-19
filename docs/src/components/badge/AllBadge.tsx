import React from 'react';
import Badge from './Badge';

const AllBadge = () => {
  return (
    <Badge
      label={'ALL Support'}
      overlayText={
        'Available in the cloud, self-hosted community, self-hosted professional, self-hosted enterprise'
      }
      fontColor={'white'}
      backgroundColor={'#ffc655'}
    />
  );
};

export default AllBadge;
