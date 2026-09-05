'use client';

import { useEffect, useRef, useState } from 'react';
import type { TocItem } from './article';

// MUI kullanılmıyor: bu bileşen client bundle'a giriyor, hydration maliyetini düşük tutuyoruz.
const ArticleNav = ({ items }: { items: TocItem[] }) => {
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? '');
  const ticking = useRef(false);

  useEffect(() => {
    const update = () => {
      ticking.current = false;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0);
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    if (!items.length) return;

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (visible) {
          setActiveId(visible.target.id);
          return;
        }

        // Hiçbiri görünmüyorsa viewport'un üstünde kalan son başlık aktiftir.
        const passed = headings.filter((el) => el.getBoundingClientRect().top < 120);
        if (passed.length) setActiveId(passed[passed.length - 1].id);
      },
      { rootMargin: '-100px 0px -70% 0px', threshold: 0 }
    );

    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  const remaining = Math.max(0, items.findIndex((item) => item.id === activeId));

  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          zIndex: 1300,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: '#C1121F',
            transition: 'width 80ms linear',
          }}
        />
      </div>

      {items.length > 0 && (
        <nav aria-label="İçindekiler">
          <p
            style={{
              margin: '0 0 12px',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#8E8E93',
            }}
          >
            Bu rehberde
          </p>

          <ol style={{ listStyle: 'none', margin: 0, padding: 0, borderLeft: '2px solid #E5E5EA' }}>
            {items.map((item) => {
              const active = item.id === activeId;
              return (
                <li key={item.id} style={{ marginLeft: -2 }}>
                  <a
                    href={`#${item.id}`}
                    aria-current={active ? 'true' : undefined}
                    style={{
                      display: 'block',
                      padding: '6px 0 6px 13px',
                      borderLeft: `2px solid ${active ? '#C1121F' : 'transparent'}`,
                      fontSize: 13,
                      lineHeight: 1.45,
                      fontWeight: active ? 600 : 400,
                      color: active ? '#1C1C1E' : '#6E6E73',
                      textDecoration: 'none',
                      transition: 'color 0.15s ease',
                    }}
                  >
                    {item.text}
                  </a>
                </li>
              );
            })}
          </ol>

          <p
            style={{
              margin: '14px 0 0',
              fontSize: 12,
              color: '#8E8E93',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {remaining + 1} / {items.length} bölüm
          </p>
        </nav>
      )}
    </>
  );
};

export default ArticleNav;
