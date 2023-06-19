export const checkExpiredInvitation = (invitationDate: Date) => {
  // 7 days
  if (Date.now() - invitationDate.getTime() > 1000 * 60 * 60 * 24 * 7) {
    return true;
  }

  return false;
};
