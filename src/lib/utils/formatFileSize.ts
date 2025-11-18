const formatFileSize = (sizeInBytes: number) => {
  const KB = 1024;
  const MB = KB * 1024;

  if (sizeInBytes < KB) {
    return `${sizeInBytes} B`;
  } else if (sizeInBytes < MB) {
    return `${(sizeInBytes / KB).toFixed(2)} KB`;
  } else {
    return `${(sizeInBytes / MB).toFixed(2)} MB`;
  }
};

export default formatFileSize;
