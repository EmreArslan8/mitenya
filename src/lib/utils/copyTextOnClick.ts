const copyTextOnClick = async (text?: string) => {
  await navigator.clipboard.writeText(text ?? '');
};

export default copyTextOnClick;
