'use client';
import { createContext, useState, useEffect } from 'react';

interface SearchHistoryContextType {
  searchHistory: string[];
  addQuery: (query: string) => void;
  removeQuery: (query: string) => void;
  clearHistory: () => void;
}

export const SearchHistoryContext = createContext<SearchHistoryContextType>({} as SearchHistoryContextType);

export function SearchHistoryProvider({ children }: { children: React.ReactNode }) {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('searchHistory') ?? '[]');
    setSearchHistory(saved.slice(-10));
  }, []);

  const addQuery = (query: string) => {
    setSearchHistory(prev => {
      if (prev.includes(query)) return prev;
      const updated = [...prev, query].slice(-10);
      localStorage.setItem('searchHistory', JSON.stringify(updated));
      return updated;
    });
  };

  const removeQuery = (query: string) => {
    setSearchHistory(prev => {
      const updated = prev.filter(q => q !== query);
      localStorage.setItem('searchHistory', JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  return (
    <SearchHistoryContext.Provider value={{ searchHistory, addQuery, removeQuery, clearHistory }}>
      {children}
    </SearchHistoryContext.Provider>
  );
}
