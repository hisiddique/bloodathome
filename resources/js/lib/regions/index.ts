export * from './types';
export * from './uk';
export * from './india';

import { RegionConfig } from './types';
import { ukRegion } from './uk';
import { indiaRegion } from './india';

export const regions: Record<string, RegionConfig> = {
  GB: ukRegion,
  IN: indiaRegion,
};

export const getRegion = (code: string): RegionConfig => {
  return regions[code] || ukRegion; // Default to UK
};
