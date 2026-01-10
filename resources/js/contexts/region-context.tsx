import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RegionConfig, ukRegion } from '@/lib/regions';

interface RegionContextType {
  region: RegionConfig;
  setRegion: (region: RegionConfig) => void;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

interface RegionProviderProps {
  children: ReactNode;
  defaultRegion?: RegionConfig;
}

export function RegionProvider({ children, defaultRegion = ukRegion }: RegionProviderProps) {
  const [region, setRegion] = useState<RegionConfig>(defaultRegion);

  return (
    <RegionContext.Provider value={{ region, setRegion }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion(): RegionContextType {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
}
