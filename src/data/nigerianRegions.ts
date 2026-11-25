export interface NigerianState {
  name: string;
  isTerritory?: boolean; // FCT is a Federal Capital Territory, not a state
}

export interface GeopoliticalZone {
  id: string;
  name: string;
  shortName: string;
  description: string;
  states: NigerianState[];
}

export const NIGERIAN_GEOPOLITICAL_ZONES: GeopoliticalZone[] = [
  {
    id: 'north-central',
    name: 'North Central',
    shortName: 'NC',
    description: 'Middle Belt agro-commercial & administrative hub',
    states: [
      { name: 'Benue' },
      { name: 'Kogi' },
      { name: 'Kwara' },
      { name: 'Nasarawa' },
      { name: 'Niger' },
      { name: 'Plateau' },
      { name: 'Federal Capital Territory (Abuja)', isTerritory: true },
    ],
  },
  {
    id: 'north-east',
    name: 'North East',
    shortName: 'NE',
    description: 'Agricultural produce, livestock & border trade',
    states: [
      { name: 'Adamawa' },
      { name: 'Bauchi' },
      { name: 'Borno' },
      { name: 'Gombe' },
      { name: 'Taraba' },
      { name: 'Yobe' },
    ],
  },
  {
    id: 'north-west',
    name: 'North West',
    shortName: 'NW',
    description: 'Major historic textile, grain & retail commerce centers',
    states: [
      { name: 'Jigawa' },
      { name: 'Kaduna' },
      { name: 'Kano' },
      { name: 'Katsina' },
      { name: 'Kebbi' },
      { name: 'Sokoto' },
      { name: 'Zamfara' },
    ],
  },
  {
    id: 'south-east',
    name: 'South East',
    shortName: 'SE',
    description: 'Manufacturing, footwear, tailoring & industrial retail trade',
    states: [
      { name: 'Abia' },
      { name: 'Anambra' },
      { name: 'Ebonyi' },
      { name: 'Enugu' },
      { name: 'Imo' },
    ],
  },
  {
    id: 'south-south',
    name: 'South South',
    shortName: 'SS',
    description: 'Coastal oil economy, hospitality & Niger Delta commerce',
    states: [
      { name: 'Akwa Ibom' },
      { name: 'Bayelsa' },
      { name: 'Cross River' },
      { name: 'Delta' },
      { name: 'Edo' },
      { name: 'Rivers' },
    ],
  },
  {
    id: 'south-west',
    name: 'South West',
    shortName: 'SW',
    description: 'Tech, creative industries, fashion capitals & FMCG ports',
    states: [
      { name: 'Ekiti' },
      { name: 'Lagos' },
      { name: 'Ogun' },
      { name: 'Ondo' },
      { name: 'Osun' },
      { name: 'Oyo' },
    ],
  },
];

// Flat list of all 37 entries (36 states + 1 federal territory)
export const ALL_NIGERIAN_STATES_AND_TERRITORIES: NigerianState[] =
  NIGERIAN_GEOPOLITICAL_ZONES.flatMap((zone) => zone.states);

export const ALL_REGION_NAMES: string[] = ALL_NIGERIAN_STATES_AND_TERRITORIES.map((s) => s.name);

// Fast lookup maps
export const STATE_TO_ZONE_MAP: Record<string, string> = {};
NIGERIAN_GEOPOLITICAL_ZONES.forEach((zone) => {
  zone.states.forEach((s) => {
    STATE_TO_ZONE_MAP[s.name] = zone.name;
  });
});

export const POPULAR_COMMERCIAL_HUBS = [
  'Lagos',
  'Federal Capital Territory (Abuja)',
  'Rivers',
  'Kano',
  'Anambra',
  'Oyo',
];

export function matchesNigerianRegionQuery(state: NigerianState, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (state.name.toLowerCase().includes(q)) return true;
  if (state.isTerritory && ('fct'.includes(q) || 'abuja'.includes(q) || 'fct abuja'.includes(q))) {
    return true;
  }
  return false;
}

export function normalizeSelectedRegions(regions: string[] | undefined): string[] {
  if (!Array.isArray(regions)) return [];
  const validSet = new Set(ALL_REGION_NAMES);
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of regions) {
    if (typeof item !== 'string') continue;
    const trimmed = item.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    if (validSet.has(trimmed)) {
      seen.add(trimmed);
      result.push(trimmed);
    }
  }
  return result;
}

export function formatRegionSummary(selected: string[]): string {
  if (!selected || selected.length === 0) {
    return 'No region selected (Default: Nationwide Delivery)';
  }
  if (selected.length === ALL_REGION_NAMES.length) {
    return 'Nationwide Coverage (All 36 States + FCT)';
  }

  // Check if all states of certain zones are selected
  const fullySelectedZones: string[] = [];
  NIGERIAN_GEOPOLITICAL_ZONES.forEach((zone) => {
    const allZoneStates = zone.states.map((s) => s.name);
    const hasAll = allZoneStates.every((st) => selected.includes(st));
    if (hasAll) {
      fullySelectedZones.push(zone.name);
    }
  });

  if (fullySelectedZones.length === NIGERIAN_GEOPOLITICAL_ZONES.length) {
    return 'Nationwide Coverage (All 36 States + FCT)';
  }

  if (selected.length <= 3) {
    return selected.join(', ');
  }

  const firstTwo = selected.slice(0, 2).join(', ');
  return `${firstTwo} & ${selected.length - 2} other ${selected.length - 2 === 1 ? 'region' : 'regions'}`;
}
