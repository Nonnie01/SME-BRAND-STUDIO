import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { SAMPLE_PRODUCTS } from '../src/data/sampleProducts';
import {
  buildMockupSpec,
  resolveBottleLiquidPalette,
  resolveMockupLabelPalette,
  resolveMockupTypography,
  resolvePackagingStyle,
} from '../src/utils/productMockup';
import { ColorSwatch } from '../src/types';

function getZoboSample() {
  const zobo = SAMPLE_PRODUCTS.find((item) => item.id === 'drinks-zobo');
  assert.ok(zobo, 'Expected drinks-zobo sample to exist in SAMPLE_PRODUCTS');
  return zobo;
}

const SAMPLE_BRAND_PALETTE: ColorSwatch[] = [
  {
    name: 'Zobo Ruby',
    hex: '#7E092B',
    role: 'Primary brand colour',
    psychologicalReason: 'Bold hibiscus richness and celebration',
    marketingReason: 'Stands out across bottle shelves and feeds',
  },
  {
    name: 'Lagos Palm Green',
    hex: '#0D5C3A',
    role: 'Secondary supporting colour',
    psychologicalReason: 'Freshness and natural botanical heritage',
    marketingReason: 'Balances richness with organic trust',
  },
  {
    name: 'Sunlit Amber',
    hex: '#D97706',
    role: 'Accent colour',
    psychologicalReason: 'Warm spiced vitality',
    marketingReason: 'Draws the eye to seals and CTAs',
  },
];

test('Artisanal Spiced Zobo sample creates separate bottle label mockup spec displaying "SIP & SMILE"', () => {
  const zobo = getZoboSample();
  assert.equal(zobo.imageUrl, '/samples/zobo-drink.jpg');

  const spec = buildMockupSpec({
    brandName: 'SIP & SMILE',
    tagline: 'Pure Zobo. Pure Joy.',
    productName: zobo.productName,
    productDescription: zobo.description,
    category: zobo.category,
    businessType: 'product',
    price: zobo.priceRange,
    palette: SAMPLE_BRAND_PALETTE,
    brandTone: 'Vibrant, Refreshing & Artisanal Heritage',
    typographyRecommendation: {
      headerFont: 'Playfair Display',
      bodyFont: 'Plus Jakarta Sans',
      styleNote: 'Warm editorial serif headlines paired with clean modern sans-serif',
    },
    brandPromise: 'Chilled small-batch hibiscus brewed with real pineapples and spices.',
  });

  assert.equal(spec.style, 'beverage-bottles');
  assert.equal(spec.brandName, 'SIP & SMILE');
  assert.equal(spec.productTitle, zobo.productName);
  assert.equal(spec.tagline, 'Pure Zobo. Pure Joy.');
  assert.equal(spec.volumeBadge.toLowerCase(), '500ml');

  // Authentic deep ruby hibiscus liquid palette
  assert.equal(spec.liquidPalette.deep, '#3D0414');
  assert.equal(spec.liquidPalette.mid, '#7E092B');
  assert.equal(spec.liquidPalette.bright, '#B91C47');

  // Label adopts generated brand colours and serif display typography
  assert.equal(spec.colors.primaryColor, '#7E092B');
  assert.equal(spec.colors.secondaryColor, '#0D5C3A');
  assert.equal(spec.colors.accentColor, '#D97706');
  assert.equal(spec.typography.isSerifDisplay, true);
  assert.match(spec.typography.displayFontFamily, /Playfair Display|Georgia/i);
});

test('Active brand name updates dynamically change the mockup spec and signature for any brand switch', () => {
  const zobo = getZoboSample();

  const firstBrandSpec = buildMockupSpec({
    brandName: 'ZOBO HAVEN',
    tagline: 'Crisp Hibiscus Refreshment',
    productName: zobo.productName,
    productDescription: zobo.description,
    category: zobo.category,
    businessType: 'product',
    price: zobo.priceRange,
    palette: SAMPLE_BRAND_PALETTE,
  });

  const switchedBrandSpec = buildMockupSpec({
    brandName: 'SIP & SMILE',
    tagline: 'Pure Zobo. Pure Joy.',
    productName: zobo.productName,
    productDescription: zobo.description,
    category: zobo.category,
    businessType: 'product',
    price: zobo.priceRange,
    palette: SAMPLE_BRAND_PALETTE,
  });

  assert.equal(firstBrandSpec.brandName, 'ZOBO HAVEN');
  assert.equal(switchedBrandSpec.brandName, 'SIP & SMILE');
  assert.notEqual(firstBrandSpec.signature, switchedBrandSpec.signature);
});

test('Dynamic packaging styles and liquid palettes work across non-Zobo Nigerian SME products', () => {
  // Culinary sauce / jollof condiment -> culinary-jar
  assert.equal(
    resolvePackagingStyle({
      category: 'Food and beverages',
      productName: 'Smoky Party Jollof Sauce',
      productDescription: 'Ready-to-cook artisan pepper & tomato base in 350g jar',
    }),
    'culinary-jar'
  );

  // Beauty & skincare -> skincare-vessel
  assert.equal(
    resolvePackagingStyle({
      category: 'Beauty and skincare',
      productName: 'Whipped Northern Shea Body Butter',
      productDescription: 'Nourishing organic shea butter enriched with hibiscus oil',
    }),
    'skincare-vessel'
  );

  // Fashion & handmade crafts -> boutique-packaging (frames verified photo + box instead of warping onto fabric)
  assert.equal(
    resolvePackagingStyle({
      category: 'Fashion and clothing',
      productName: 'Adire & Ankara Luxury Kimono',
      productDescription: 'Hand-dyed contemporary silk kimono jacket',
    }),
    'boutique-packaging'
  );

  // Electronics / general goods -> presentation-box
  assert.equal(
    resolvePackagingStyle({
      category: 'Electronics and power',
      productName: 'Solar Hybrid Home Inverter 2kVA',
      productDescription: 'Pure sine-wave backup power kit',
    }),
    'presentation-box'
  );

  // Beverage variants pick authentic liquid hues
  const kununAya = resolveBottleLiquidPalette(
    'Chilled Tiger Nut Milk (Kunun Aya)',
    'Creamy blended tigernuts, dates and coconut'
  );
  assert.equal(kununAya.mid, '#D8C29D');

  const pineappleJuice = resolveBottleLiquidPalette(
    'Fresh Cold-Pressed Pineapple Ginger Juice',
    '100% ripe pineapple pressed with fiery root ginger'
  );
  assert.equal(pineappleJuice.mid, '#D97706');
});

test('Label finishes maintain legible typography contrast across light, brand-tinted, and midnight stocks', () => {
  const brightYellowPalette: ColorSwatch[] = [
    {
      name: 'Bright Mango',
      hex: '#FEF08A',
      role: 'Primary brand colour',
      psychologicalReason: 'Cheerful energy',
      marketingReason: 'Bright visual pop',
    },
    {
      name: 'Deep Forest',
      hex: '#064E3B',
      role: 'Secondary supporting colour',
      psychologicalReason: 'Grounded contrast',
      marketingReason: 'Legible anchor',
    },
    {
      name: 'Warm Gold',
      hex: '#B45309',
      role: 'Accent colour',
      psychologicalReason: 'Craft highlight',
      marketingReason: 'Border detail',
    },
  ];

  // Very bright yellow primary on cream stock automatically falls back to dark ink for legibility
  const creamFinish = resolveMockupLabelPalette(brightYellowPalette, 'cream-cotton');
  assert.notEqual(creamFinish.brandTextColor, '#FEF08A');

  const brandTintDarkPrimary = resolveMockupLabelPalette(SAMPLE_BRAND_PALETTE, 'brand-tint');
  assert.equal(brandTintDarkPrimary.labelBackground, '#7E092B');
  assert.equal(brandTintDarkPrimary.brandTextColor, '#FFFFFF');

  const onyxLuxe = resolveMockupLabelPalette(SAMPLE_BRAND_PALETTE, 'midnight-luxe');
  assert.equal(onyxLuxe.labelBackground, '#171513');
  assert.equal(onyxLuxe.brandTextColor, '#FDF8EE');

  // Bold/condensed typography detection
  const condensed = resolveMockupTypography({
    typographyRecommendation: {
      headerFont: 'Oswald',
      bodyFont: 'Plus Jakarta Sans',
      styleNote: 'Strong urban streetwear display',
    },
    brandTone: 'Bold & Energetic',
    packagingStyle: 'presentation-box',
  });
  assert.equal(condensed.isCondensedDisplay, true);
  assert.equal(condensed.isSerifDisplay, false);
});

test('SocialFlyerStudio, App.tsx, and server.ts preserve original sample photo, verification gates, and zero paid Gemini dependency', () => {
  const root = process.cwd();
  const mockupUtilSrc = fs.readFileSync(path.join(root, 'src/utils/productMockup.ts'), 'utf8');
  const flyerSrc = fs.readFileSync(path.join(root, 'src/components/SocialFlyerStudio.tsx'), 'utf8');
  const appSrc = fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf8');
  const serverSrc = fs.readFileSync(path.join(root, 'server.ts'), 'utf8');

  // 1. Exact option label requested by user + separate mockup workflow
  assert.match(flyerSrc, /Create Branded Product Mockup/);
  assert.match(flyerSrc, /renderBrandedProductMockup/);
  assert.match(flyerSrc, /Use Original Photo/);
  assert.match(flyerSrc, /Use Branded Mockup in Flyer/);
  assert.match(flyerSrc, /Download Mockup PNG/);

  // 2. Active brand mockup feeds both flyer live preview and PNG canvas export
  assert.match(
    flyerSrc,
    /const activeProductPhoto =\s*useBrandedMockup && brandedMockupUrl/
  );
  assert.match(flyerSrc, /primarySrc = activeProductPhoto/);
  assert.match(flyerSrc, /src=\{activeProductPhoto\}/);

  // 3. Original sample photograph is NEVER overwritten or mutated inside mockup creation
  assert.doesNotMatch(flyerSrc, /handleCreateBrandedMockup[\s\S]*onUpdateProductImage/);
  assert.doesNotMatch(mockupUtilSrc, /onUpdateProductImage/);

  // 4. Verification guardrail remains enforced before mockup rendering
  assert.match(flyerSrc, /imageUrl && isProductVerifiedMatch/);
  assert.match(
    flyerSrc,
    /handleCreateBrandedMockup[\s\S]*isVerificationCurrent \? verification : null[\s\S]*!checkResult \|\| !checkResult\.matches/
  );

  // 5. App.tsx lifts & resets branded mockup state cleanly and supplies brand styling props
  assert.match(appSrc, /brandedMockupUrl/);
  assert.match(appSrc, /useBrandedMockup/);
  assert.match(appSrc, /typographyRecommendation=\{result\.brandIdentity\.typographyRecommendation\}/);
  assert.match(appSrc, /onMockupStateChange=\{handleMockupStateChange\}/);

  // 6. Zero new paid Gemini image dependency or server mockup endpoint introduced
  assert.doesNotMatch(mockupUtilSrc, /gemini|@google\/genai|\/api\//i);
  assert.doesNotMatch(serverSrc, /mockup/i);
});
