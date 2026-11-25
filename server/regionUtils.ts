import {
  ALL_REGION_NAMES,
  formatRegionSummary,
  normalizeSelectedRegions,
} from '../src/data/nigerianRegions';

const VALID_REGION_SET = new Set(ALL_REGION_NAMES);
const DEFAULT_NATIONWIDE_LABEL = 'Nationwide (Nigeria)';

export interface ResolvedTargetRegions {
  regions: string[];
  regionsText: string;
  summaryText: string;
}

export function resolveTargetRegions(
  selectedRegions: unknown,
  targetLocation?: unknown
): ResolvedTargetRegions {
  const rawList = Array.isArray(selectedRegions)
    ? selectedRegions.filter((item): item is string => typeof item === 'string')
    : [];

  const normalized = normalizeSelectedRegions(rawList);
  if (normalized.length > 0) {
    return {
      regions: normalized,
      regionsText: normalized.join(', '),
      summaryText: formatRegionSummary(normalized),
    };
  }

  // If custom valid or non-empty targetLocation string is supplied without matching region array
  const cleanLocation =
    typeof targetLocation === 'string' ? targetLocation.trim() : '';

  if (cleanLocation && !cleanLocation.toLowerCase().startsWith('no region selected')) {
    if (VALID_REGION_SET.has(cleanLocation)) {
      return {
        regions: [cleanLocation],
        regionsText: cleanLocation,
        summaryText: cleanLocation,
      };
    }
    return {
      regions: [],
      regionsText: cleanLocation,
      summaryText: cleanLocation,
    };
  }

  return {
    regions: [],
    regionsText: DEFAULT_NATIONWIDE_LABEL,
    summaryText: DEFAULT_NATIONWIDE_LABEL,
  };
}
