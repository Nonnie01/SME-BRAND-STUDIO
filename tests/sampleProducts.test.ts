import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { SAMPLE_PRODUCTS, NIGERIAN_BEVERAGE_SAMPLES } from '../src/data/sampleProducts';
import { ALL_REGION_NAMES } from '../src/data/nigerianRegions';

test('SAMPLE_PRODUCTS preserves the 5-sample layout with Food unchanged and Zobo labelled Beverages & Local Drinks', () => {
  assert.equal(SAMPLE_PRODUCTS.length, 5);

  const food = SAMPLE_PRODUCTS.find((s) => s.id === 'food-jollof');
  assert.ok(food, 'food-jollof sample must remain present');
  assert.equal(food.category, 'Food and beverages');
  assert.equal(food.categoryLabel, 'Food and beverages');
  assert.equal(food.cardCategoryLabel, undefined);

  const zobo = SAMPLE_PRODUCTS.find((s) => s.id === 'drinks-zobo');
  assert.ok(zobo, 'drinks-zobo sample must remain present');
  assert.equal(zobo.productName, 'Artisanal Spiced Zobo (Hibiscus & Ginger Elixir)');
  assert.equal(zobo.category, 'Food and beverages');
  assert.equal(zobo.categoryLabel, 'Beverages & Local Drinks');
  assert.equal(zobo.cardCategoryLabel, 'Beverages & Local Drinks');
  assert.ok(zobo.subcategory?.includes('Zobo'), 'Zobo must carry beverage subcategory');
  assert.equal(zobo.recognition?.productCategory, 'Food and beverages');
  assert.ok(
    zobo.recognition?.productSubcategory.includes('Beverages & Local Drinks'),
    'Zobo recognition must carry beverage subcategory'
  );
});

test('NIGERIAN_BEVERAGE_SAMPLES provides all 5 Nigerian beverage options under Food and beverages with valid regions', () => {
  assert.equal(NIGERIAN_BEVERAGE_SAMPLES.length, 5);
  const validRegions = new Set(ALL_REGION_NAMES);

  const ids = NIGERIAN_BEVERAGE_SAMPLES.map((s) => s.id);
  assert.deepEqual(ids, [
    'drinks-zobo',
    'drinks-kunun-aya',
    'drinks-pineapple-juice',
    'drinks-mixed-fruit',
    'drinks-kunu',
  ]);

  const expectedTerms = ['Zobo', 'Kunun Aya', 'Pineapple', 'Mixed Fruit', 'Kunu'];
  NIGERIAN_BEVERAGE_SAMPLES.forEach((bev, idx) => {
    assert.equal(bev.category, 'Food and beverages');
    assert.equal(bev.categoryLabel, 'Beverages & Local Drinks');
    assert.ok(
      bev.subcategory?.includes(expectedTerms[idx]),
      `Expected beverage ${bev.id} subcategory to mention ${expectedTerms[idx]}`
    );
    assert.ok(bev.description.length > 40, `Expected rich description for ${bev.id}`);
    assert.ok(bev.targetAudience.length > 15, `Expected targetAudience for ${bev.id}`);
    assert.ok(Array.isArray(bev.selectedRegions) && bev.selectedRegions.length > 0);
    for (const region of bev.selectedRegions) {
      assert.ok(validRegions.has(region), `Invalid region ${region} in ${bev.id}`);
    }
  });
});

test('ProductForm keeps 5-card grid and App preserves user-entered brand name while wiring targetAudience', () => {
  const root = process.cwd();
  const productFormSrc = fs.readFileSync(
    path.join(root, 'src/components/ProductForm.tsx'),
    'utf8'
  );
  const appSrc = fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf8');

  // 5-card layout preserved and uses cardCategoryLabel when specified
  assert.match(productFormSrc, /grid-cols-2 sm:grid-cols-5 gap-2/);
  assert.match(
    productFormSrc,
    /const displayLabel = sample\.cardCategoryLabel \|\| sample\.categoryLabel\.split\(' '\)\[0\]/
  );
  assert.match(productFormSrc, /id="beverage-sample-variant"/);

  // App preserves custom brand name if user typed one, and forwards productTargetAudience
  assert.match(appSrc, /knownSampleBrandNames\.has\(trimmed\.toLowerCase\(\)\)/);
  assert.match(appSrc, /setProductTargetAudience\(/);
  assert.match(appSrc, /targetAudience: productTargetAudience \|\| 'Nigerian buyers and diaspora market'/);
});
