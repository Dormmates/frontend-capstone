export const getFileId = (url: string) => {
  const match = url.match(/files\/([a-z0-9-]+)\//i);
  const fileId = match ? match[1] : null;

  return fileId;
};
