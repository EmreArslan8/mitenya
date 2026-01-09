import React from 'react';

export const splitTitle = (
  title: string,
  breakAfter: number = 2
): React.ReactNode => {
  if (!title) return null;

  const words = title.trim().split(/\s+/);

  if (words.length <= breakAfter) {
    return title;
  }

  return (
    <>
      {words.slice(0, breakAfter).join(' ')}
      <br />
      {words.slice(breakAfter).join(' ')}
    </>
  );
};
