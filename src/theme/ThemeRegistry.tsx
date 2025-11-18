'use client';

import { NextAppDirEmotionCacheProvider } from '@/theme/EmotionCache';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Palette, defaultPalette } from './palette';
import { getDesignTokens } from './theme';

interface ThemeContextState {
  palette: Palette;
  setPalette: Dispatch<SetStateAction<Palette>>;
}

const ThemeContext = createContext({} as ThemeContextState);

export const usePalette = () => useContext(ThemeContext).palette;
export const withPalette = <T extends Record<string, any>>(
  styles: (palette: Palette) => T
) => () => styles(usePalette());

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  const [palette, setPalette] = useState(defaultPalette);
  const theme = useMemo(() => createTheme(getDesignTokens(palette)), [palette]);

  useEffect(() => {
    // ✅ DOM manipülasyonu yalnızca client’ta olur, SSR farkını tetiklemez
    document.body.style.background = palette.bg.main;
  }, [palette]);

  return (
    <NextAppDirEmotionCacheProvider options={{ key: 'mui', prepend: true }}>
      <ThemeContext.Provider value={{ palette, setPalette }}>
        <ThemeProvider theme={theme}>
          {/* ✅ Emotion Cache içinde CssBaseline çağırıyoruz */}
          <CssBaseline />
          {children}
        </ThemeProvider>
      </ThemeContext.Provider>
    </NextAppDirEmotionCacheProvider>
  );
}
