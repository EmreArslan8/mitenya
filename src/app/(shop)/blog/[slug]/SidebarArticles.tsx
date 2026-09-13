'use client';

import { useMemo, useState } from 'react';

export interface SidebarArticle {
  slug: string;
  title: string;
  date: string | null;
}

const SidebarArticles = ({ items }: { items: SidebarArticle[] }) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR');
    if (!q) return items.slice(0, 5);
    return items
      .filter((item) => item.title.toLocaleLowerCase('tr-TR').includes(q))
      .slice(0, 6);
  }, [items, query]);

  return (
    <>
      <section className="flex flex-col gap-2.5 pb-6">
        <h2 className="text-[15px] font-bold text-gray-800">
          Yazılarda ara
        </h2>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ara"
          aria-label="Blog yazılarında ara"
          className="w-full border-0 bg-[#F2F2F7] px-3 py-2.5 text-[13px] text-gray-800 outline-none placeholder:text-[#AEAEB2] focus:bg-[#EBEBF0]"
        />
      </section>

      <section className="flex flex-col gap-2.5 pb-6">
        <h2 className="border-b border-gray-100 pb-2.5 text-[15px] font-bold text-gray-800">
          {query.trim() ? 'Sonuçlar' : 'Öne çıkan yazılar'}
        </h2>

        {filtered.length === 0 ? (
          <p className="py-3 text-[12.5px] text-[#AEAEB2]">Eşleşen yazı bulunamadı.</p>
        ) : (
          filtered.map((item) => (
            <a key={item.slug} href={`/blog/${item.slug}`} className="group block border-b border-gray-100 py-3 no-underline last:border-0">
              <h3 className="line-clamp-2 text-[13px] font-normal leading-normal text-[#3A3A3C] transition-colors group-hover:text-accentRed">
                {item.title}
              </h3>
              {item.date && (
                <span className="mt-1.5 block text-[11.5px] text-[#AEAEB2]">
                  {item.date}
                </span>
              )}
            </a>
          ))
        )}
      </section>
    </>
  );
};

export default SidebarArticles;
