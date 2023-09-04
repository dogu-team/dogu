import React from 'react';
import Badge from './Badge';

const SelfHostedCommunityBadge = () => {
  return (
    <Badge
      label={'Self-Hosted Community'}
      overlayText={
        'Available in the self-hosted community, self-hosted professional'
      }
      backgroundColor={'#3bc376'}
    ></Badge>
  );
};

export default SelfHostedCommunityBadge;
