const tokenize = (input: string, maxLength: number): string[] => {
  const tokens: string[] = [];
  for (let i = 0; i < input.length; i += maxLength) {
    tokens.push(input.slice(i, i + maxLength));
  }
  return tokens;
};

export default tokenize;
