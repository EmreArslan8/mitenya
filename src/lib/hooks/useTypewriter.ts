import { useEffect, useState } from 'react';

interface UseTypewriterOptions {
  texts: string[];
  enabled?: boolean;
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseAfterType?: number;
  pauseAfterDelete?: number;
}

const useTypewriter = ({
  texts,
  enabled = true,
  typeSpeed = 45,
  deleteSpeed = 25,
  pauseAfterType = 1800,
  pauseAfterDelete = 400,
}: UseTypewriterOptions): string => {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    if (!texts.length || !enabled) {
      setDisplayed('');
      return;
    }

    let tid: ReturnType<typeof setTimeout>;

    const type = (target: string, text: string, idx: number) => {
      if (text.length < target.length) {
        const next = target.slice(0, text.length + 1);
        setDisplayed(next);
        tid = setTimeout(() => type(target, next, idx), typeSpeed);
      } else {
        tid = setTimeout(() => erase(text, idx), pauseAfterType);
      }
    };

    const erase = (text: string, idx: number) => {
      if (text.length > 0) {
        const next = text.slice(0, -1);
        setDisplayed(next);
        tid = setTimeout(() => erase(next, idx), deleteSpeed);
      } else {
        const nextIdx = (idx + 1) % texts.length;
        tid = setTimeout(() => type(texts[nextIdx], '', nextIdx), pauseAfterDelete);
      }
    };

    tid = setTimeout(() => type(texts[0], '', 0), typeSpeed);
    return () => clearTimeout(tid);
  }, [enabled]);

  return displayed;
};

export default useTypewriter;
