const copyTextOnClick = async (text?: string) => {
  if (!text || typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    return false;
  }

  await navigator.clipboard.writeText(text);
  return true;
};

export default copyTextOnClick;
