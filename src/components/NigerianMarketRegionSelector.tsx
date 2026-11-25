import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Search,
  CheckSquare,
  Square,
  X,
  ChevronDown,
  ChevronUp,
  Globe,
  Building2,
  CheckCircle2,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  NIGERIAN_GEOPOLITICAL_ZONES,
  ALL_REGION_NAMES,
  ALL_NIGERIAN_STATES_AND_TERRITORIES,
  POPULAR_COMMERCIAL_HUBS,
  GeopoliticalZone,
  formatRegionSummary,
  matchesNigerianRegionQuery,
} from '../data/nigerianRegions';

interface NigerianMarketRegionSelectorProps {
  selectedRegions: string[];
  onChange: (regions: string[]) => void;
  onSummaryChange?: (summary: string) => void;
  label?: string;
}

export const NigerianMarketRegionSelector: React.FC<NigerianMarketRegionSelectorProps> = ({
  selectedRegions,
  onChange,
  onSummaryChange,
  label = 'Target Market Location (All 36 States + FCT)',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedZones, setExpandedZones] = useState<Record<string, boolean>>({
    'north-central': true,
    'north-east': false,
    'north-west': false,
    'south-east': false,
    'south-south': false,
    'south-west': true,
  });

  const uniqueSelectedRegions = useMemo(
    () => Array.from(new Set(selectedRegions.filter((r) => typeof r === 'string' && r.trim().length > 0))),
    [selectedRegions]
  );

  const isAllSelected = uniqueSelectedRegions.length === ALL_REGION_NAMES.length;

  // Toggle single state / territory
  const handleToggleState = (name: string) => {
    let next: string[];
    if (uniqueSelectedRegions.includes(name)) {
      next = uniqueSelectedRegions.filter((r) => r !== name);
    } else {
      next = [...uniqueSelectedRegions, name];
    }
    onChange(next);
    if (onSummaryChange) onSummaryChange(formatRegionSummary(next));
  };

  // Remove single state chip
  const handleRemoveState = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    const next = uniqueSelectedRegions.filter((r) => r !== name);
    onChange(next);
    if (onSummaryChange) onSummaryChange(formatRegionSummary(next));
  };

  // Select All States & FCT
  const handleSelectAll = () => {
    if (isAllSelected) {
      onChange([]);
      if (onSummaryChange) onSummaryChange('No region selected');
    } else {
      onChange([...ALL_REGION_NAMES]);
      if (onSummaryChange) onSummaryChange('Nationwide Coverage (All 36 States + FCT)');
    }
  };

  // Select Entire Geopolitical Zone
  const handleToggleZone = (zone: GeopoliticalZone) => {
    const zoneStateNames = zone.states.map((s) => s.name);
    const hasAll = zoneStateNames.every((name) => uniqueSelectedRegions.includes(name));

    let next: string[];
    if (hasAll) {
      // Deselect entire zone
      next = uniqueSelectedRegions.filter((name) => !zoneStateNames.includes(name));
    } else {
      // Add all missing states from this zone
      const set = new Set([...uniqueSelectedRegions, ...zoneStateNames]);
      next = Array.from(set);
    }
    onChange(next);
    if (onSummaryChange) onSummaryChange(formatRegionSummary(next));
  };

  // Apply Quick Preset: Top Commercial Hubs
  const handleSelectTopHubs = () => {
    onChange([...POPULAR_COMMERCIAL_HUBS]);
    if (onSummaryChange) onSummaryChange(formatRegionSummary(POPULAR_COMMERCIAL_HUBS));
  };

  // Toggle accordion expand
  const toggleZoneExpand = (zoneId: string) => {
    setExpandedZones((prev) => ({
      ...prev,
      [zoneId]: !prev[zoneId],
    }));
  };

  // Expand all zones
  const handleExpandAll = (expand: boolean) => {
    const next: Record<string, boolean> = {};
    NIGERIAN_GEOPOLITICAL_ZONES.forEach((z) => {
      next[z.id] = expand;
    });
    setExpandedZones(next);
  };

  // Filtered zones based on search query
  const filteredZones = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return NIGERIAN_GEOPOLITICAL_ZONES;

    return NIGERIAN_GEOPOLITICAL_ZONES.map((zone) => {
      const matchingStates = zone.states.filter((st) =>
        matchesNigerianRegionQuery(st, q)
      );
      const zoneMatches = zone.name.toLowerCase().includes(q);

      return {
        ...zone,
        states: zoneMatches ? zone.states : matchingStates,
        hasMatches: zoneMatches || matchingStates.length > 0,
      };
    }).filter((z) => (z as any).hasMatches);
  }, [searchQuery]);

  const totalStatesCount = ALL_NIGERIAN_STATES_AND_TERRITORIES.length; // 37 (36 states + 1 FCT)

  return (
    <div className="space-y-2">
      {/* Label and Summary Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <label className="block text-xs font-bold text-stone-700 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{label}</span>
          <span className="text-rose-500">*</span>
        </label>
        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 self-start sm:self-auto">
          {uniqueSelectedRegions.length === totalStatesCount
            ? '🇳🇬 Nationwide Coverage (36 States + FCT)'
            : `${uniqueSelectedRegions.length} of ${totalStatesCount} Regions Selected`}
        </span>
      </div>

      {/* Main Trigger Box */}
      <div className="border border-stone-300 rounded-xl bg-white shadow-2xs overflow-hidden transition-all focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-600">
        {/* Selected States Chips Display & Toggle Button */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 sm:p-3 cursor-pointer hover:bg-stone-50/70 transition-colors flex items-start justify-between gap-2"
        >
          <div className="flex-1 min-w-0">
            {uniqueSelectedRegions.length === 0 ? (
              <p className="text-xs sm:text-sm text-stone-400 italic py-0.5">
                Click to select Nigerian states, geopolitical zones, or nationwide coverage...
              </p>
            ) : isAllSelected ? (
              <div className="flex items-center gap-2 py-0.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-800 text-white font-bold text-xs shadow-xs">
                  <Globe className="w-3.5 h-3.5 text-emerald-300" />
                  Nationwide Coverage: All 36 States + Federal Capital Territory (Abuja)
                </span>
                <span className="text-[11px] text-stone-500 hidden sm:inline">
                  (Ready for Pan-Nigerian dispatch & campaigns)
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {uniqueSelectedRegions.map((region) => {
                  const isFct = region.includes('Federal Capital Territory');
                  return (
                    <span
                      key={region}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-2xs transition-all ${
                        isFct
                          ? 'bg-amber-100 text-amber-950 border border-amber-300 font-bold'
                          : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      }`}
                    >
                      {isFct ? (
                        <Building2 className="w-3 h-3 text-amber-700 shrink-0" />
                      ) : (
                        <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                      )}
                      <span className="truncate max-w-[150px]">{region}</span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveState(e, region)}
                        className="hover:text-rose-600 rounded p-0.5 ml-0.5 cursor-pointer text-stone-400 hover:bg-stone-200/50"
                        title={`Remove ${region}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 pt-1 text-stone-500">
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded hidden sm:inline">
              {isOpen ? 'Close' : 'Choose States'}
            </span>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {/* Collapsible Selector Panel */}
        {isOpen && (
          <div className="border-t border-stone-200 bg-stone-50/80 p-3 sm:p-4 space-y-3.5 animate-in fade-in duration-150">
            {/* Quick Action Presets */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Select All / Deselect All */}
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs ${
                    isAllSelected
                      ? 'bg-rose-700 text-white hover:bg-rose-800'
                      : 'bg-emerald-800 text-white hover:bg-emerald-900'
                  }`}
                >
                  {isAllSelected ? (
                    <>
                      <X className="w-3.5 h-3.5" />
                      <span>Deselect All</span>
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Select All States (Nationwide)</span>
                    </>
                  )}
                </button>

                {/* Top Commercial Hubs Preset */}
                <button
                  type="button"
                  onClick={handleSelectTopHubs}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-stone-800 border border-stone-300 hover:bg-stone-100 hover:border-emerald-400 transition-all cursor-pointer shadow-2xs"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Top 6 Hubs (Lagos, Abuja, Rivers, Kano, etc.)</span>
                </button>

                {/* Clear Button */}
                {uniqueSelectedRegions.length > 0 && !isAllSelected && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange([]);
                      if (onSummaryChange) onSummaryChange('No region selected');
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear ({uniqueSelectedRegions.length})</span>
                  </button>
                )}
              </div>

              {/* Expand / Collapse All Accordions */}
              <div className="flex items-center gap-1 text-[11px] text-stone-500">
                <button
                  type="button"
                  onClick={() => handleExpandAll(true)}
                  className="hover:text-emerald-800 underline cursor-pointer"
                >
                  Expand all zones
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => handleExpandAll(false)}
                  className="hover:text-emerald-800 underline cursor-pointer"
                >
                  Collapse
                </button>
              </div>
            </div>

            {/* State Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any state (e.g. Lagos, Kano, Enugu, Abuja, Rivers)..."
                className="w-full pl-9 pr-9 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600 placeholder:text-stone-400 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Geopolitical Zones Accordion List */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredZones.map((zone) => {
                const zoneStates = zone.states;
                const selectedInZone = zoneStates.filter((s) =>
                  uniqueSelectedRegions.includes(s.name)
                ).length;
                const isEntireZoneSelected =
                  zoneStates.length > 0 && selectedInZone === zoneStates.length;
                const isPartiallySelected =
                  selectedInZone > 0 && selectedInZone < zoneStates.length;
                const isExpanded = searchQuery ? true : !!expandedZones[zone.id];

                return (
                  <div
                    key={zone.id}
                    className="border border-stone-200/90 rounded-xl bg-white overflow-hidden shadow-2xs"
                  >
                    {/* Zone Header Bar */}
                    <div className="p-2.5 sm:p-3 bg-stone-100/70 border-b border-stone-200/60 flex items-center justify-between gap-2">
                      <div
                        onClick={() => toggleZoneExpand(zone.id)}
                        className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                      >
                        <span className="w-6 h-6 rounded-md bg-emerald-800 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0">
                          {zone.shortName}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                              {zone.name}
                            </h5>
                            <span className="text-[10px] text-stone-500 hidden sm:inline">
                              ({zoneStates.length} items)
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-500 line-clamp-1">
                            {zone.description}
                          </p>
                        </div>
                      </div>

                      {/* Zone Select All Toggle & Accordion Chevron */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleZone(zone)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            isEntireZoneSelected
                              ? 'bg-emerald-800 text-white'
                              : isPartiallySelected
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-white text-stone-700 border border-stone-300 hover:border-emerald-400 hover:bg-stone-50'
                          }`}
                        >
                          {isEntireZoneSelected ? (
                            <CheckSquare className="w-3.5 h-3.5" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-stone-400" />
                          )}
                          <span>
                            {isEntireZoneSelected
                              ? 'Zone Selected'
                              : `Select Zone (${selectedInZone}/${zoneStates.length})`}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleZoneExpand(zone.id)}
                          className="p-1 text-stone-400 hover:text-stone-700 rounded cursor-pointer"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Zone States Grid */}
                    {isExpanded && (
                      <div className="p-2.5 sm:p-3 grid grid-cols-2 sm:grid-cols-3 gap-2 bg-white">
                        {zoneStates.map((state) => {
                          const isSelected = uniqueSelectedRegions.includes(state.name);
                          const isTerritory = state.isTerritory;

                          return (
                            <button
                              key={state.name}
                              type="button"
                              onClick={() => handleToggleState(state.name)}
                              className={`p-2 rounded-lg border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                                isSelected
                                  ? isTerritory
                                    ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold ring-1 ring-amber-400/30'
                                    : 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-500/30'
                                  : 'bg-stone-50/70 border-stone-200 text-stone-700 hover:border-emerald-300 hover:bg-white'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {isSelected ? (
                                  <CheckSquare
                                    className={`w-3.5 h-3.5 shrink-0 ${
                                      isTerritory ? 'text-amber-700' : 'text-emerald-700'
                                    }`}
                                  />
                                ) : (
                                  <Square className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                )}
                                <div className="min-w-0">
                                  <span className="truncate block">{state.name}</span>
                                  {isTerritory ? (
                                    <span className="inline-block text-[9px] uppercase tracking-wider font-extrabold text-amber-800 bg-amber-200/70 px-1 rounded">
                                      Federal Territory
                                    </span>
                                  ) : (
                                    <span className="text-[9px] text-stone-400 block">State</span>
                                  )}
                                </div>
                              </div>

                              {isSelected && (
                                <CheckCircle2
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    isTerritory ? 'text-amber-600' : 'text-emerald-600'
                                  }`}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Done Bar */}
            <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
              <span className="text-xs text-stone-500 font-medium">
                {uniqueSelectedRegions.length} of {totalStatesCount} regions active for marketing strategy
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 shadow-xs cursor-pointer transition-colors"
              >
                Apply Selection
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-[11px] text-stone-500 leading-normal">
        Selected states directly inform logistics (interstate waybills / dispatch riders), pricing thresholds in Naira, local consumer psychology, and regional Pidgin/English advertising angles.
      </p>
    </div>
  );
};
