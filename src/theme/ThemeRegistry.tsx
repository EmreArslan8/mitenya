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
export const withPalette = (styles: (palette: Palette) => React.CSSProperties) => () => styles(usePalette());

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  const [palette, setPalette] = useState(defaultPalette);


  const theme = useMemo(() => createTheme(getDesignTokens(palette)), [palette]);

  useEffect(() => {
    document.body.style.background = palette.bg.main;
  }, [palette]);

  return (
    <ThemeContext.Provider value={{ palette, setPalette }}>
      <CssBaseline />
      <NextAppDirEmotionCacheProvider options={{ key: 'mui' }}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </NextAppDirEmotionCacheProvider>
    </ThemeContext.Provider>
  );
}
