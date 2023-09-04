import React from 'react';
import Badge from './Badge';

const AllBadge = () => {
  return (
    <Badge
      label={'ALL Support'}
      overlayText={
        'Available in the cloud free, cloud professional, self-hosted community, self-hosted professional'
      }
      fontColor={'white'}
      backgroundColor={'#ffc655'}
    />
  );
};

export default AllBadge;
