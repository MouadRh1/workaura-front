'use client';
import { createContext, useContext, useState, useCallback, useRef } from 'react';

const LoadingContext = createContext(null);

export function LoadingProvider({ children }) {
  const [pending, setPending] = useState(new Set());
  const registered = useRef(new Set());

  const register = useCallback((key) => {
    if (registered.current.has(key)) return;
    registered.current.add(key);
    setPending(prev => new Set([...prev, key]));
  }, []);

  const markDone = useCallback((key) => {
    setPending(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  // isLoading = true seulement si des clés sont enregistrées ET pas encore résolues
  const isLoading = pending.size > 0;

  return (
    <LoadingContext.Provider value={{ register, markDone, isLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}