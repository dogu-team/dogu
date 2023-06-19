export const convertExtensionToLanguage = (fileName: string): string => {
  const extension = fileName.split('.').pop() || '';

  switch (extension) {
    case 'js':
      return 'javascript';
    case 'ts':
      return 'typescript';
    default:
      return extension;
  }
};
