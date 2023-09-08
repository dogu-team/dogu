export const getRepositoyUrl = (gitUrl: string) => {
  const matches = gitUrl.match(/\/([^/]+\/[^/]+)$/);
  if (matches) {
    return matches[matches.length - 1];
  }

  return gitUrl;
};
