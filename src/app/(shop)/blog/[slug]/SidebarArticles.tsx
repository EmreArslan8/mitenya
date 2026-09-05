'use client';

import { useMemo, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import styles from './styles';

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
      <Stack sx={styles.sidebarBlock}>
        <Typography component="h2" sx={styles.sidebarTitlePlain}>
          Yazılarda ara
        </Typography>
        <Box
          component="input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ara"
          aria-label="Blog yazılarında ara"
          sx={styles.sidebarSearch}
        />
      </Stack>

      <Stack sx={styles.sidebarBlock}>
        <Typography component="h2" sx={styles.sidebarTitle}>
          {query.trim() ? 'Sonuçlar' : 'Öne çıkan yazılar'}
        </Typography>

        {filtered.length === 0 ? (
          <Typography sx={styles.sidebarEmpty}>Eşleşen yazı bulunamadı.</Typography>
        ) : (
          filtered.map((item) => (
            <Box key={item.slug} component="a" href={`/blog/${item.slug}`} sx={styles.sidebarItem}>
              <Typography component="h3" sx={styles.sidebarItemTitle}>
                {item.title}
              </Typography>
              {item.date && (
                <Typography component="span" sx={styles.sidebarItemDate}>
                  {item.date}
                </Typography>
              )}
            </Box>
          ))
        )}
      </Stack>
    </>
  );
};

export default SidebarArticles;
