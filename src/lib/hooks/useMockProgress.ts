import { useState, useEffect } from 'react';

const useMockProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 99) clearInterval(timer);
        const delta = oldProgress < 90 ? Math.random() * 0.5 + 0.25 : Math.random() * 0.1 + 0.05;
        return Math.min(oldProgress + delta, 99);
      });
    }, 50);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return { progress, setProgress };
};

export default useMockProgress;
