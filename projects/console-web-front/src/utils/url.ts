export const getRepositoyUrl = (gitUrl: string) => {
  const matches = gitUrl.match(/\/([^/]+\/[^/]+)$/);
  if (matches) {
    return matches[matches.length - 1];
  }

  return gitUrl;
};

export const LANDING_TEMRS_OF_USE_URL = 'https://dogutech.io/notices/terms';
export const LANDING_PRIVACY_POLICY_URL = 'https://dogutech.io/notices/privacy';
