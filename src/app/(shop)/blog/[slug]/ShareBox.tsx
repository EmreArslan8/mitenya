'use client';

import { useState } from 'react';

const buttonStyle: React.CSSProperties = {
  width: 'auto',
  background: '#FFFFFF',
  border: '1px solid #E5E5EA',
  borderRadius: 999,
  padding: '7px 11px',
  fontSize: 12,
  fontWeight: 600,
  color: '#1C1C1E',
  cursor: 'pointer',
  fontFamily: 'inherit',
  lineHeight: 1.2,
  whiteSpace: 'nowrap',
};

const ShareBox = ({ title }: { title: string }) => {
  const [copied, setCopied] = useState(false);

  const currentUrl = () => (typeof window === 'undefined' ? '' : window.location.href);

  const openShare = (build: (url: string, title: string) => string) => {
    const url = currentUrl();
    if (!url) return;
    window.open(build(url, title), '_blank', 'noopener,noreferrer');
  };

  const copyLink = async () => {
    const url = currentUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      <button
        type="button"
        style={buttonStyle}
        onClick={() =>
          openShare((url, text) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`)
        }
      >
        WhatsApp&apos;ta paylaş
      </button>
      <button
        type="button"
        style={buttonStyle}
        onClick={() =>
          openShare(
            (url, text) =>
              `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
          )
        }
      >
        X&apos;te paylaş
      </button>
      <button type="button" style={buttonStyle} onClick={copyLink}>
        {copied ? 'Bağlantı kopyalandı' : 'Bağlantıyı kopyala'}
      </button>
    </div>
  );
};

export default ShareBox;
