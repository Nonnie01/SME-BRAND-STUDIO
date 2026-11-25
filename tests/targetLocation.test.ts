import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  ALL_NIGERIAN_STATES_AND_TERRITORIES,
  ALL_REGION_NAMES,
  NIGERIAN_GEOPOLITICAL_ZONES,
  formatRegionSummary,
  matchesNigerianRegionQuery,
  normalizeSelectedRegions,
} from '../src/data/nigerianRegions';
import { resolveTargetRegions } from '../server/regionUtils';
import { SAMPLE_PRODUCTS } from '../src/data/sampleProducts';
import { SAMPLE_SERVICE_BUSINESSES } from '../src/data/sampleServices';
import { SAMPLE_HYBRID_BUSINESSES } from '../src/data/sampleHybridBusinesses';
import { SAMPLE_EXISTING_BRANDS } from '../src/data/sampleExistingBrands';

const EXPECTED_36_STATES_PLUS_FCT = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'Federal Capital Territory (Abuja)',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
];

const KEY_TARGET_LOCATIONS = [
  'Lagos',
  'Rivers',
  'Abia',
  'Kano',
  'Enugu',
  'Federal Capital Territory (Abuja)',
];

test('Nigerian region catalog contains all 36 states plus FCT Abuja with zero duplicates', () => {
  assert.equal(NIGERIAN_GEOPOLITICAL_ZONES.length, 6);
  assert.equal(ALL_NIGERIAN_STATES_AND_TERRITORIES.length, 37);
  assert.equal(ALL_REGION_NAMES.length, 37);

  const uniqueNames = new Set(ALL_REGION_NAMES);
  assert.equal(uniqueNames.size, 37, 'ALL_REGION_NAMES must not contain duplicates');

  for (const expected of EXPECTED_36_STATES_PLUS_FCT) {
    assert.ok(uniqueNames.has(expected), `Missing Nigerian region: ${expected}`);
  }

  for (const requiredState of KEY_TARGET_LOCATIONS) {
    assert.ok(uniqueNames.has(requiredState), `Key verification region missing: ${requiredState}`);
  }
});

test('matchesNigerianRegionQuery supports searching key states and FCT Abuja aliases', () => {
  const fctEntry = ALL_NIGERIAN_STATES_AND_TERRITORIES.find(
    (s) => s.name === 'Federal Capital Territory (Abuja)'
  );
  assert.ok(fctEntry);
  assert.equal(fctEntry.isTerritory, true);

  assert.equal(matchesNigerianRegionQuery(fctEntry, 'fct'), true);
  assert.equal(matchesNigerianRegionQuery(fctEntry, 'FCT'), true);
  assert.equal(matchesNigerianRegionQuery(fctEntry, 'Abuja'), true);

  for (const stateName of KEY_TARGET_LOCATIONS) {
    const entry = ALL_NIGERIAN_STATES_AND_TERRITORIES.find((s) => s.name === stateName);
    assert.ok(entry, `Missing entry for ${stateName}`);
    assert.equal(
      matchesNigerianRegionQuery(entry, stateName.toLowerCase()),
      true,
      `Search must match ${stateName}`
    );
  }
});

test('normalizeSelectedRegions deduplicates and preserves all key Nigerian states without forcing Lagos', () => {
  const nonLagosSelection = [
    'Rivers',
    'Abia',
    'Kano',
    'Enugu',
    'Federal Capital Territory (Abuja)',
    'Rivers', // duplicate
    'UnknownState', // invalid
  ];

  const normalized = normalizeSelectedRegions(nonLagosSelection);
  assert.deepEqual(normalized, [
    'Rivers',
    'Abia',
    'Kano',
    'Enugu',
    'Federal Capital Territory (Abuja)',
  ]);
  assert.equal(normalized.includes('Lagos'), false);

  const allNormalized = normalizeSelectedRegions([...ALL_REGION_NAMES, 'Lagos', 'Kano']);
  assert.equal(allNormalized.length, 37);
});

test('resolveTargetRegions respects selected non-Lagos states and never silently reverts to Lagos', () => {
  for (const state of KEY_TARGET_LOCATIONS) {
    // Even if a stale targetLocation ('Lagos') was passed alongside selectedRegions, selectedRegions wins
    const resolved = resolveTargetRegions([state], 'Lagos');
    assert.deepEqual(resolved.regions, [state]);
    assert.equal(resolved.regionsText, state);
    if (state !== 'Lagos') {
      assert.equal(resolved.regionsText.includes('Lagos'), false);
    }
  }

  // Multi-state non-Lagos selection
  const multi = resolveTargetRegions(
    ['Rivers', 'Abia', 'Kano', 'Enugu', 'Federal Capital Territory (Abuja)'],
    'Lagos, Federal Capital Territory (Abuja) & Rivers'
  );
  assert.deepEqual(multi.regions, [
    'Rivers',
    'Abia',
    'Kano',
    'Enugu',
    'Federal Capital Territory (Abuja)',
  ]);
  assert.equal(
    multi.regionsText,
    'Rivers, Abia, Kano, Enugu, Federal Capital Territory (Abuja)'
  );
  assert.equal(multi.regionsText.includes('Lagos'), false);

  // Empty selection with no custom targetLocation uses neutral Nationwide default, NOT Lagos
  const emptyResolved = resolveTargetRegions([], undefined);
  assert.deepEqual(emptyResolved.regions, []);
  assert.equal(emptyResolved.regionsText, 'Nationwide (Nigeria)');
  assert.equal(emptyResolved.regionsText.includes('Lagos'), false);

  // "No region selected" UI summary should not leak into AI prompt as a region name
  const clearedResolved = resolveTargetRegions([], 'No region selected (Default: Nationwide Delivery)');
  assert.equal(clearedResolved.regionsText, 'Nationwide (Nigeria)');
});

test('formatRegionSummary accurately summarizes single, multi-state, and nationwide selections', () => {
  assert.equal(formatRegionSummary(['Rivers']), 'Rivers');
  assert.equal(formatRegionSummary(['Abia', 'Enugu']), 'Abia, Enugu');
  assert.equal(
    formatRegionSummary(['Kano', 'Rivers', 'Federal Capital Territory (Abuja)']),
    'Kano, Rivers, Federal Capital Territory (Abuja)'
  );
  assert.equal(
    formatRegionSummary(ALL_REGION_NAMES),
    'Nationwide Coverage (All 36 States + FCT)'
  );
});

test('All sample presets have valid, deduplicated selectedRegions matching ALL_REGION_NAMES', () => {
  const validSet = new Set(ALL_REGION_NAMES);

  for (const p of SAMPLE_PRODUCTS) {
    assert.ok(Array.isArray(p.selectedRegions) && p.selectedRegions.length > 0, `Product sample ${p.id} missing selectedRegions`);
    assert.equal(new Set(p.selectedRegions).size, p.selectedRegions.length, `Duplicate regions in ${p.id}`);
    for (const r of p.selectedRegions) {
      assert.ok(validSet.has(r), `Invalid region "${r}" in product sample ${p.id}`);
    }
  }

  for (const s of SAMPLE_SERVICE_BUSINESSES) {
    assert.ok(Array.isArray(s.selectedRegions) && s.selectedRegions.length > 0, `Service sample ${s.id} missing selectedRegions`);
    for (const r of s.selectedRegions) {
      assert.ok(validSet.has(r), `Invalid region "${r}" in service sample ${s.id}`);
    }
  }

  for (const h of SAMPLE_HYBRID_BUSINESSES) {
    assert.ok(Array.isArray(h.selectedRegions) && h.selectedRegions.length > 0, `Hybrid sample ${h.id} missing selectedRegions`);
    for (const r of h.selectedRegions) {
      assert.ok(validSet.has(r), `Invalid region "${h.id}": ${r}`);
    }
  }

  for (const e of SAMPLE_EXISTING_BRANDS) {
    assert.ok(Array.isArray(e.selectedRegions) && e.selectedRegions.length > 0, `Existing brand sample ${e.id} missing selectedRegions`);
    for (const r of e.selectedRegions) {
      assert.ok(validSet.has(r), `Invalid region "${r}" in existing sample ${e.id}`);
    }
  }
});

test('App workflows, CustomerDashboard edit modal, and server endpoints wire selectedRegions properly', () => {
  const appSource = fs.readFileSync(path.resolve(process.cwd(), 'src/App.tsx'), 'utf8');
  const dashboardSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/CustomerDashboard.tsx'),
    'utf8'
  );
  const existingFormSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/ExistingBrandForm.tsx'),
    'utf8'
  );
  const productFormSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/ProductForm.tsx'),
    'utf8'
  );
  const serverSource = fs.readFileSync(path.resolve(process.cwd(), 'server.ts'), 'utf8');

  // ProductForm in App.tsx must receive selectedRegions & onSelectedRegionsChange
  const productFormTagMatch = appSource.match(/<ProductForm[\s\S]*?\/>/);
  assert.ok(productFormTagMatch, 'ProductForm JSX usage not found in App.tsx');
  assert.ok(
    productFormTagMatch[0].includes('selectedRegions={selectedRegions}'),
    'App.tsx must pass selectedRegions to ProductForm'
  );
  assert.ok(
    productFormTagMatch[0].includes('onSelectedRegionsChange={setSelectedRegions}'),
    'App.tsx must pass onSelectedRegionsChange to ProductForm'
  );

  // ExistingBrandForm in App.tsx must receive selectedRegions & onSelectedRegionsChange
  const existingFormTagMatch = appSource.match(/<ExistingBrandForm[\s\S]*?\/>/);
  assert.ok(existingFormTagMatch, 'ExistingBrandForm JSX usage not found in App.tsx');
  assert.ok(
    existingFormTagMatch[0].includes('selectedRegions={selectedRegions}'),
    'App.tsx must pass selectedRegions to ExistingBrandForm'
  );
  assert.ok(
    existingFormTagMatch[0].includes('onSelectedRegionsChange={setSelectedRegions}'),
    'App.tsx must pass onSelectedRegionsChange to ExistingBrandForm'
  );

  // Forms use NigerianMarketRegionSelector
  assert.ok(productFormSource.includes('<NigerianMarketRegionSelector'));
  assert.ok(existingFormSource.includes('<NigerianMarketRegionSelector'));
  assert.ok(dashboardSource.includes('<NigerianMarketRegionSelector'));

  // No stale forced Lagos string in handleApplyApprovedChanges
  assert.equal(appSource.includes("location: 'Lagos, Abuja & Major Cities'"), false);
  assert.equal(appSource.includes("'#LagosVendor'"), false);

  // Reopen & dashboard update sync selectedRegions
  assert.ok(appSource.includes('setSelectedRegions(restoredRegions)'));
  assert.ok(appSource.includes('if (updates.selectedRegions !== undefined)'));

  // Server endpoints use resolveTargetRegions cleanly and do not default to 'Lagos, Abuja & Nationwide'
  assert.equal(serverSource.includes("targetLocation = 'Lagos, Abuja & Nationwide'"), false);
  assert.ok(serverSource.includes("import { resolveTargetRegions } from './server/regionUtils'"));
  assert.ok(serverSource.includes('resolveTargetRegions(selectedRegions, targetLocation)'));
});
