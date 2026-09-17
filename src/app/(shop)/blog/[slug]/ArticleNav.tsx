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

  // Ana bölümler her zaman görünür; alt başlıklar yalnızca içinde bulunulan
  // bölümün altında açılır. 12 h2 + 17 h3'ü düz listelemek kenar çubuğunu
  // ekrandan taşırıyordu.
  const sections = items.filter((item) => item.level === 2);

  const activeSectionId = (() => {
    const index = items.findIndex((item) => item.id === activeId);
    for (let i = index; i >= 0; i -= 1) {
      if (items[i].level === 2) return items[i].id;
    }
    return sections[0]?.id ?? '';
  })();

  const subsectionsOf = (sectionId: string) => {
    const start = items.findIndex((item) => item.id === sectionId);
    const result: TocItem[] = [];
    for (let i = start + 1; i < items.length && items[i].level === 3; i += 1) {
      result.push(items[i]);
    }
    return result;
  };

  const activeSectionIndex = Math.max(
    0,
    sections.findIndex((section) => section.id === activeSectionId),
  );

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
            {sections.map((section) => {
              const inSection = section.id === activeSectionId;
              const active = section.id === activeId;
              const subsections = inSection ? subsectionsOf(section.id) : [];

              return (
                <li key={section.id} style={{ marginLeft: -2 }}>
                  <a
                    href={`#${section.id}`}
                    aria-current={active ? 'true' : undefined}
                    style={{
                      display: 'block',
                      padding: '6px 0 6px 13px',
                      borderLeft: `2px solid ${inSection ? '#C1121F' : 'transparent'}`,
                      fontSize: 13,
                      lineHeight: 1.45,
                      fontWeight: inSection ? 600 : 400,
                      color: inSection ? '#1C1C1E' : '#6E6E73',
                      textDecoration: 'none',
                      transition: 'color 0.15s ease',
                    }}
                  >
                    {section.text}
                  </a>

                  {subsections.length > 0 && (
                    <ol style={{ listStyle: 'none', margin: '2px 0 6px', padding: 0 }}>
                      {subsections.map((sub) => {
                        const subActive = sub.id === activeId;
                        return (
                          <li key={sub.id}>
                            <a
                              href={`#${sub.id}`}
                              aria-current={subActive ? 'true' : undefined}
                              style={{
                                display: 'block',
                                padding: '4px 0 4px 26px',
                                fontSize: 12.5,
                                lineHeight: 1.4,
                                fontWeight: subActive ? 600 : 400,
                                color: subActive ? '#1C1C1E' : '#8E8E93',
                                textDecoration: 'none',
                                transition: 'color 0.15s ease',
                              }}
                            >
                              {sub.text}
                            </a>
                          </li>
                        );
                      })}
                    </ol>
                  )}
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
            {activeSectionIndex + 1} / {sections.length} bölüm
          </p>
        </nav>
      )}
    </>
  );
};

export default ArticleNav;
