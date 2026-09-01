'use client';

import { ShopContext } from '@/contexts/ShopContext';
import searchUrlFromOptions from '@/lib/shop/searchHelpers';
import formatPrice from '@/lib/utils/formatPrice';
import { Box, CircularProgress, IconButton, Stack, TextField, Typography } from '@mui/material';
import { ArrowLeft, History, Search, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormEvent, useContext, useEffect, useRef, useState } from 'react';
import useStyles from './styles';

interface SuggestedProduct {
  id: string;
  name: string;
  brand?: string;
  url: string;
  imgSrc?: string;
  price?: { currentPrice: number; originalPrice: number; currency: string };
}

interface MobileSearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;
const SUGGESTION_LIMIT = 6;

const MobileSearchOverlay = ({ open, onClose }: MobileSearchOverlayProps) => {
  const styles = useStyles();
  const router = useRouter();
  const { searchHistory, addSearchQuery, removeSearchQuery, clearAllHistory } =
    useContext(ShopContext);

  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<SuggestedProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim();
  const hasQuery = trimmed.length >= MIN_QUERY_LENGTH;

  // Acilista alan temizlenir, klavye gelsin diye odak verilir.
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setProducts([]);
    setTotalCount(0);
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(focusTimer);
  }, [open]);

  // Overlay acikken arkadaki sayfa kaymasin.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  // Yazarken canli oneri: her tusta degil, duraklamada istek atiliyor.
  useEffect(() => {
    if (!open || !hasQuery) {
      setProducts([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/shop/search?query=${encodeURIComponent(trimmed)}&limit=${SUGGESTION_LIMIT}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error('search failed');
        const data = await response.json();
        setProducts(data.products ?? []);
        setTotalCount(data.totalCount ?? 0);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setProducts([]);
          setTotalCount(0);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [open, hasQuery, trimmed]);

  const goToResults = (value: string) => {
    const term = value.trim();
    if (!term) return;
    addSearchQuery(term);
    onClose();
    router.push(searchUrlFromOptions({ query: term }, true));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    goToResults(query);
  };

  const openProduct = (url: string) => {
    if (trimmed) addSearchQuery(trimmed);
    onClose();
    router.push(url);
  };

  if (!open) return null;

  return (
    <Box sx={styles.overlay} role="dialog" aria-modal="true" aria-label="Arama">
      <Stack component="form" onSubmit={handleSubmit} sx={styles.topBar} autoComplete="off">
        <IconButton onClick={onClose} aria-label="Kapat">
          <ArrowLeft size={22} strokeWidth={1.5} />
        </IconButton>
        <TextField
          inputRef={inputRef}
          fullWidth
          size="small"
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ürün, marka veya ihtiyaç ara"
          sx={styles.input}
          InputProps={{
            startAdornment: <Search size={18} strokeWidth={1.5} style={{ marginRight: 8 }} />,
            endAdornment: query ? (
              <IconButton size="small" onClick={() => setQuery('')} aria-label="Temizle">
                <X size={16} strokeWidth={1.8} />
              </IconButton>
            ) : null,
          }}
        />
      </Stack>

      <Box sx={styles.body}>
        {!hasQuery && searchHistory.length > 0 && (
          <Stack sx={styles.section}>
            <Stack sx={styles.sectionHead}>
              <Typography sx={styles.sectionTitle}>Son aramalar</Typography>
              <Typography sx={styles.clearAll} onClick={clearAllHistory}>
                Temizle
              </Typography>
            </Stack>
            {searchHistory
              .slice(-8)
              .reverse()
              .map((item) => (
                <Stack key={item} sx={styles.historyRow}>
                  <Stack sx={styles.historyLabel} onClick={() => goToResults(item)}>
                    <History size={16} strokeWidth={1.5} />
                    <Typography sx={styles.historyText}>{item}</Typography>
                  </Stack>
                  <IconButton
                    size="small"
                    onClick={() => removeSearchQuery(item)}
                    aria-label="Kaldır"
                  >
                    <X size={15} strokeWidth={1.8} />
                  </IconButton>
                </Stack>
              ))}
          </Stack>
        )}

        {!hasQuery && searchHistory.length === 0 && (
          <Typography sx={styles.emptyHint}>
            Ürün, marka ya da cilt ihtiyacını yazmaya başla — sonuçlar anında listelenir.
          </Typography>
        )}

        {hasQuery && loading && products.length === 0 && (
          <Stack sx={styles.loadingBox}>
            <CircularProgress size={22} color="inherit" />
          </Stack>
        )}

        {hasQuery && !loading && products.length === 0 && (
          <Typography sx={styles.emptyHint}>
            “{trimmed}” için sonuç bulunamadı. Farklı bir kelime deneyebilirsin.
          </Typography>
        )}

        {hasQuery && products.length > 0 && (
          <Stack sx={styles.section}>
            {products.map((product) => (
              <Stack
                key={product.id}
                sx={styles.productRow}
                onClick={() => openProduct(product.url)}
              >
                <Box sx={styles.productImage}>
                  {product.imgSrc && (
                    <Image
                      src={product.imgSrc}
                      alt={product.name}
                      fill
                      sizes="64px"
                      style={{ objectFit: 'contain' }}
                    />
                  )}
                </Box>
                <Stack sx={styles.productText}>
                  {product.brand && (
                    <Typography sx={styles.productBrand}>{product.brand}</Typography>
                  )}
                  <Typography sx={styles.productName}>{product.name}</Typography>
                  {product.price && (
                    <Typography sx={styles.productPrice}>
                      {formatPrice(product.price.currentPrice, product.price.currency)}
                    </Typography>
                  )}
                </Stack>
              </Stack>
            ))}

            <Stack sx={styles.allResults} onClick={() => goToResults(trimmed)}>
              <Typography sx={styles.allResultsText}>
                Tüm sonuçları gör{totalCount ? ` (${totalCount})` : ''}
              </Typography>
              <Search size={16} strokeWidth={1.8} />
            </Stack>
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default MobileSearchOverlay;
