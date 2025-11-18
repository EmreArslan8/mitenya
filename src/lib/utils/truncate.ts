const truncateFilename = (filename: string, length: number) => {
  if (filename.length <= length) {
    return filename;
  }

  const frontChars = length / 2 - 2;
  const backChars = length / 2 - 1;

  return `${filename.slice(0, frontChars)}...${filename.slice(-backChars)}`;
};

export default truncateFilename;
