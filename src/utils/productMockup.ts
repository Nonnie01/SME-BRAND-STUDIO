import {
  BusinessType,
  ColorSwatch,
  TypographyRecommendation,
} from '../types';
import { loadCanvasImage } from './canvasExport';

export type MockupPackagingStyle =
  | 'beverage-bottles'
  | 'culinary-jar'
  | 'skincare-vessel'
  | 'boutique-packaging'
  | 'presentation-box';

export type MockupLabelFinish =
  | 'cream-cotton'
  | 'crisp-ivory'
  | 'brand-tint'
  | 'midnight-luxe';

export interface ProductMockupInput {
  brandName: string;
  tagline?: string;
  productName: string;
  productDescription?: string;
  category?: string;
  businessType?: BusinessType;
  price?: string;
  palette: ColorSwatch[];
  brandTone?: string;
  typographyRecommendation?: TypographyRecommendation | null;
  brandPromise?: string;
  packagingStyle?: MockupPackagingStyle;
  labelFinish?: MockupLabelFinish;
  productImageUrl?: string | null;
}

export interface MockupLabelPalette {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  labelBackground: string;
  labelBorder: string;
  brandTextColor: string;
  subtitleTextColor: string;
  mutedTextColor: string;
  backdropTop: string;
  backdropBottom: string;
}

export interface MockupTypographySpec {
  displayFontFamily: string;
  bodyFontFamily: string;
  isSerifDisplay: boolean;
  isCondensedDisplay: boolean;
}

export interface BottleLiquidPalette {
  deep: string;
  mid: string;
  bright: string;
  rim: string;
}

export interface BrandedMockupSpec {
  style: MockupPackagingStyle;
  labelFinish: MockupLabelFinish;
  brandName: string;
  tagline: string;
  productTitle: string;
  detailLine: string;
  volumeBadge: string;
  colors: MockupLabelPalette;
  typography: MockupTypographySpec;
  liquidPalette: BottleLiquidPalette;
  signature: string;
}

function cleanText(value: string | null | undefined): string {
  return (value || '').trim().replace(/\s+/g, ' ');
}

function parseHexRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = (hex || '').trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function relativeLuminance(hex: string): number {
  const rgb = parseHexRgb(hex);
  if (!rgb) return 0.5;
  const toLinear = (channel: number) => {
    const srgb = channel / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b);
}

function contrastRatio(hexA: string, hexB: string): number {
  const l1 = relativeLuminance(hexA);
  const l2 = relativeLuminance(hexB);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function mixHex(hexA: string, hexB: string, ratioB: number): string {
  const rgbA = parseHexRgb(hexA) || { r: 13, g: 92, b: 58 };
  const rgbB = parseHexRgb(hexB) || { r: 255, g: 255, b: 255 };
  const t = Math.max(0, Math.min(1, ratioB));
  const r = Math.round(rgbA.r * (1 - t) + rgbB.r * t);
  const g = Math.round(rgbA.g * (1 - t) + rgbB.g * t);
  const b = Math.round(rgbA.b * (1 - t) + rgbB.b * t);
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

function findPaletteColor(
  palette: ColorSwatch[],
  roleMatchers: string[],
  fallbackIndex: number,
  fallbackHex: string
): string {
  for (const matcher of roleMatchers) {
    const found = palette.find((swatch) =>
      (swatch.role || '').toLowerCase().includes(matcher)
    );
    if (found?.hex && parseHexRgb(found.hex)) {
      return found.hex;
    }
  }
  const byIdx = palette[fallbackIndex];
  if (byIdx?.hex && parseHexRgb(byIdx.hex)) {
    return byIdx.hex;
  }
  return fallbackHex;
}

/**
 * Automatically selects the most faithful packaging template for the product category
 * and description so Beverage products render as twin bottles, Skincare as jars, etc.
 */
export function resolvePackagingStyle(params: {
  category?: string;
  productName?: string;
  productDescription?: string;
  businessType?: BusinessType;
}): MockupPackagingStyle {
  const cat = (params.category || '').toLowerCase();
  const titleAndDesc = `${params.productName || ''} ${params.productDescription || ''}`.toLowerCase();
  const corpus = `${cat} ${titleAndDesc}`;

  if (
    /\b(beauty|skincare|skin care|cosmetic|haircare|hair care)\b/.test(cat) ||
    /\b(shea|body butter|skincare|face cream|body cream|balm|lotion|serum|black soap|haircare|hair elixir|cosmetic|moisturiz)\b/.test(
      titleAndDesc
    )
  ) {
    return 'skincare-vessel';
  }

  if (
    /\b(zobo|kunu|kunun|juice|drink|beverage|smoothie|wine|syrup|tigernut|tiger nut)\b/.test(
      corpus
    ) ||
    (/\b(hibiscus|tea|elixir|bottle)\b/.test(corpus) &&
      !/\b(beauty|skincare|fashion|electronics)\b/.test(cat))
  ) {
    return 'beverage-bottles';
  }

  if (
    /\b(sauce|paste|jollof|spice|seasoning|honey|jam|pepper|stew|jar|condiment|pantry)\b/.test(
      corpus
    )
  ) {
    return 'culinary-jar';
  }

  if (
    /\b(fashion|ankara|adire|kimono|dress|clothing|apparel|bag|tote|leather|handbag|shoe|footwear|woven|craft|handmade|jewel)\b/.test(
      corpus
    )
  ) {
    return 'boutique-packaging';
  }

  return 'presentation-box';
}

export function resolveMockupLabelPalette(
  palette: ColorSwatch[],
  labelFinish: MockupLabelFinish = 'cream-cotton'
): MockupLabelPalette {
  const primaryColor = findPaletteColor(palette, ['primary'], 0, '#0D5C3A');
  const secondaryColor = findPaletteColor(palette, ['secondary', 'supporting'], 1, '#7C1D3A');
  const accentColor = findPaletteColor(palette, ['accent', 'highlight'], 2, '#D97706');

  let labelBackground = '#FBF7EE';
  let labelBorder = primaryColor;
  let brandTextColor = primaryColor;
  let subtitleTextColor = '#292524';
  let mutedTextColor = '#57534E';

  if (labelFinish === 'crisp-ivory') {
    labelBackground = '#FFFFFF';
    labelBorder = primaryColor;
    brandTextColor = contrastRatio(primaryColor, '#FFFFFF') >= 4.2 ? primaryColor : '#111827';
  } else if (labelFinish === 'brand-tint') {
    labelBackground = primaryColor;
    const darkBg = relativeLuminance(primaryColor) < 0.35;
    labelBorder = accentColor;
    brandTextColor = darkBg ? '#FFFFFF' : '#111827';
    subtitleTextColor = darkBg ? '#F5F5F4' : '#1C1917';
    mutedTextColor = darkBg ? mixHex(accentColor, '#FFFFFF', 0.45) : '#44403C';
  } else if (labelFinish === 'midnight-luxe') {
    labelBackground = '#171513';
    labelBorder = mixHex(accentColor, '#FDE68A', 0.35);
    brandTextColor = '#FDF8EE';
    subtitleTextColor = mixHex(accentColor, '#FFFFFF', 0.3);
    mutedTextColor = '#D6D3D1';
  } else {
    // cream-cotton default: warm paper stock with rich brand primary typography
    labelBackground = '#FBF6EC';
    labelBorder = accentColor;
    brandTextColor =
      contrastRatio(primaryColor, labelBackground) >= 4.2
        ? primaryColor
        : contrastRatio(secondaryColor, labelBackground) >= 4.2
        ? secondaryColor
        : '#1C1917';
  }

  const backdropTop = mixHex(primaryColor, '#F5F1E8', 0.86);
  const backdropBottom = mixHex(secondaryColor, '#E7DFD1', 0.82);

  return {
    primaryColor,
    secondaryColor,
    accentColor,
    labelBackground,
    labelBorder,
    brandTextColor,
    subtitleTextColor,
    mutedTextColor,
    backdropTop,
    backdropBottom,
  };
}

export function resolveMockupTypography(params: {
  typographyRecommendation?: TypographyRecommendation | null;
  brandTone?: string;
  packagingStyle: MockupPackagingStyle;
}): MockupTypographySpec {
  const fontHint = `${params.typographyRecommendation?.headerFont || ''} ${params.typographyRecommendation?.styleNote || ''} ${params.brandTone || ''}`.toLowerCase();

  const isCondensedDisplay = /\b(oswald|barlow|antonio|bebas|condensed|urban|bold|street)\b/.test(
    fontHint
  );
  const isSerifDisplay =
    !isCondensedDisplay &&
    (/\b(playfair|cormorant|fraunces|bodoni|cinzel|serif|regal|luxury|heritage|editorial|artisan)\b/.test(
      fontHint
    ) ||
      params.packagingStyle === 'beverage-bottles' ||
      params.packagingStyle === 'skincare-vessel');

  const displayFontFamily = isSerifDisplay
    ? 'Georgia, "Playfair Display", "Times New Roman", serif'
    : isCondensedDisplay
    ? '"Arial Narrow", "Plus Jakarta Sans", sans-serif'
    : '"Plus Jakarta Sans", "DM Sans", "Segoe UI", sans-serif';

  const bodyFontFamily = '"Plus Jakarta Sans", "DM Sans", "Segoe UI", sans-serif';

  return {
    displayFontFamily,
    bodyFontFamily,
    isSerifDisplay,
    isCondensedDisplay,
  };
}

export function resolveBottleLiquidPalette(
  productName: string,
  productDescription = ''
): BottleLiquidPalette {
  const text = `${productName} ${productDescription}`.toLowerCase();

  if (/\b(kunun aya|tigernut|tiger nut|coconut|milk|horchata)\b/.test(text)) {
    return {
      deep: '#9C825C',
      mid: '#D8C29D',
      bright: '#EFE1C6',
      rim: '#F8EFE0',
    };
  }
  if (/\b(pineapple|mango|citrus|orange|ginger)\b/.test(text) && !/\b(zobo|hibiscus)\b/.test(text)) {
    return {
      deep: '#92400E',
      mid: '#D97706',
      bright: '#FBBF24',
      rim: '#FEF3C7',
    };
  }
  if (/\b(green|matcha|moringa|mint|herb)\b/.test(text) && !/\b(zobo|hibiscus)\b/.test(text)) {
    return {
      deep: '#14532D',
      mid: '#15803D',
      bright: '#4ADE80',
      rim: '#DCFCE7',
    };
  }
  // Authentic deep ruby-crimson spiced hibiscus Zobo
  return {
    deep: '#3D0414',
    mid: '#7E092B',
    bright: '#B91C47',
    rim: '#F43F5E',
  };
}

function extractVolumeOrMeasure(priceOrDesc: string): string {
  const match = priceOrDesc.match(/\b(\d+\s*(?:ml|cl|l|g|kg|oz))\b/i);
  return match ? match[1].replace(/\s+/g, '') : '';
}

export function buildMockupSpec(input: ProductMockupInput): BrandedMockupSpec {
  const brandName = cleanText(input.brandName) || 'YOUR BRAND';
  const tagline = cleanText(input.tagline);
  const productTitle = cleanText(input.productName) || 'Signature Product';
  const detailLine =
    tagline ||
    cleanText(input.brandPromise) ||
    cleanText(input.category) ||
    'Crafted with Care';
  const style =
    input.packagingStyle ||
    resolvePackagingStyle({
      category: input.category,
      productName: input.productName,
      productDescription: input.productDescription,
      businessType: input.businessType,
    });
  const labelFinish: MockupLabelFinish = input.labelFinish || 'cream-cotton';
  const colors = resolveMockupLabelPalette(input.palette || [], labelFinish);
  const typography = resolveMockupTypography({
    typographyRecommendation: input.typographyRecommendation,
    brandTone: input.brandTone,
    packagingStyle: style,
  });
  const liquidPalette = resolveBottleLiquidPalette(
    input.productName,
    input.productDescription
  );
  const volumeBadge = extractVolumeOrMeasure(
    `${input.price || ''} ${input.productDescription || ''}`
  );

  const signature = [
    brandName,
    tagline,
    productTitle,
    style,
    labelFinish,
    colors.primaryColor,
    colors.accentColor,
    colors.secondaryColor,
    typography.displayFontFamily,
  ].join('||');

  return {
    style,
    labelFinish,
    brandName,
    tagline,
    productTitle,
    detailLine,
    volumeBadge,
    colors,
    typography,
    liquidPalette,
    signature,
  };
}

function wrapTextToLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = cleanText(text).split(' ').filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = words[0];
  for (let i = 1; i < words.length; i++) {
    const next = `${current} ${words[i]}`;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
    } else {
      lines.push(current);
      current = words[i];
      if (lines.length >= maxLines) break;
    }
  }
  if (lines.length < maxLines) {
    lines.push(current);
  }
  return lines.slice(0, maxLines);
}

/**
 * Generates an unwarped, print-ready packaging label texture canvas displaying the active
 * brand name, colours, typography, product title, and brand positioning tagline.
 */
function createLabelTextureCanvas(spec: BrandedMockupSpec, width = 560, height = 460): HTMLCanvasElement {
  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = width;
  labelCanvas.height = height;
  const ctx = labelCanvas.getContext('2d');
  if (!ctx) return labelCanvas;

  const { colors, typography } = spec;

  // Base paper stock
  ctx.fillStyle = colors.labelBackground;
  ctx.fillRect(0, 0, width, height);

  // Subtle natural cotton-paper grain texture
  ctx.save();
  for (let i = 0; i < 650; i++) {
    const px = ((i * 197) % width);
    const py = ((i * 313) % height);
    ctx.fillStyle =
      i % 2 === 0 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(120, 98, 72, 0.035)';
    ctx.fillRect(px, py, 2, 1);
  }
  ctx.restore();

  // Top & bottom thin accent bands
  ctx.fillStyle = colors.primaryColor;
  ctx.fillRect(0, 0, width, 16);
  ctx.fillStyle = colors.accentColor;
  ctx.fillRect(0, 16, width, 5);
  ctx.fillRect(0, height - 21, width, 5);
  ctx.fillStyle = colors.primaryColor;
  ctx.fillRect(0, height - 16, width, 16);

  // Double hairline border
  ctx.strokeStyle = colors.labelBorder;
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 34, width - 40, height - 68);
  ctx.strokeStyle = `${colors.primaryColor}55`;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(28, 42, width - 56, height - 84);

  const centerX = width / 2;
  const maxTextW = width - 92;

  // Top positioning micro-header
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = colors.mutedTextColor;
  ctx.font = `700 16px ${typography.bodyFontFamily}`;
  ctx.fillText('SIGNATURE EDITION', centerX, 74);

  // Small botanical / diamond crest above brand name
  ctx.fillStyle = colors.accentColor;
  ctx.beginPath();
  ctx.moveTo(centerX, 95);
  ctx.lineTo(centerX + 9, 104);
  ctx.lineTo(centerX, 113);
  ctx.lineTo(centerX - 9, 104);
  ctx.closePath();
  ctx.fill();

  // Brand Name (Hero Wordmark, e.g. "SIP & SMILE") - auto-fit 1 or 2 lines
  const upperBrand = spec.brandName.toUpperCase();
  let brandFontSize = 62;
  let brandLines: string[] = [upperBrand];

  while (brandFontSize >= 30) {
    ctx.font = `900 ${brandFontSize}px ${typography.displayFontFamily}`;
    if (ctx.measureText(upperBrand).width <= maxTextW) {
      brandLines = [upperBrand];
      break;
    }
    const candidateLines = wrapTextToLines(ctx, upperBrand, maxTextW, 2);
    const fitsAll = candidateLines.every((l) => ctx.measureText(l).width <= maxTextW);
    if (candidateLines.length <= 2 && fitsAll && candidateLines.join(' ').length >= upperBrand.length - 1) {
      brandLines = candidateLines;
      break;
    }
    brandFontSize -= 3;
  }

  ctx.fillStyle = colors.brandTextColor;
  ctx.font = `900 ${brandFontSize}px ${typography.displayFontFamily}`;
  const lineHeight = brandFontSize * 1.08;
  const brandBlockCenterY = 178;
  const startBrandY = brandBlockCenterY - ((brandLines.length - 1) * lineHeight) / 2;
  brandLines.forEach((line, idx) => {
    ctx.fillText(line, centerX, startBrandY + idx * lineHeight);
  });

  // Accent rule below brand name
  const ruleY = startBrandY + (brandLines.length - 1) * lineHeight + brandFontSize * 0.65 + 10;
  ctx.strokeStyle = colors.accentColor;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(centerX - 86, ruleY);
  ctx.lineTo(centerX + 86, ruleY);
  ctx.stroke();

  // Product Title on the label
  ctx.fillStyle = colors.subtitleTextColor;
  ctx.font = `700 22px ${typography.bodyFontFamily}`;
  const productLines = wrapTextToLines(ctx, spec.productTitle, maxTextW, 2);
  let cursorY = ruleY + 34;
  productLines.forEach((line) => {
    ctx.fillText(line, centerX, cursorY);
    cursorY += 28;
  });

  // Positioning Tagline in italic below product title
  if (spec.detailLine) {
    ctx.fillStyle = colors.mutedTextColor;
    ctx.font = `italic 500 17px ${typography.displayFontFamily}`;
    const tagLines = wrapTextToLines(ctx, `"${spec.detailLine}"`, maxTextW - 12, 2);
    cursorY += 6;
    tagLines.slice(0, 1).forEach((line) => {
      ctx.fillText(line, centerX, Math.min(height - 76, cursorY));
    });
  }

  // Bottom measure / origin seal if present
  if (spec.volumeBadge) {
    ctx.fillStyle = colors.primaryColor;
    ctx.font = `800 15px ${typography.bodyFontFamily}`;
    ctx.fillText(`SMALL BATCH · ${spec.volumeBadge.toUpperCase()}`, centerX, height - 48);
  }
  ctx.restore();

  return labelCanvas;
}

/**
 * Projects a flat label texture horizontally onto a curved cylindrical surface with
 * arc foreshortening, vertical curvature sag, studio specular highlights, and edge wrap shading.
 */
function drawCylindricalWrappedLabel(
  ctx: CanvasRenderingContext2D,
  labelCanvas: HTMLCanvasElement,
  params: {
    centerX: number;
    topY: number;
    cylinderRadius: number;
    labelHeight: number;
    arcSpanRad?: number;
    curvatureSag?: number;
  }
) {
  const {
    centerX,
    topY,
    cylinderRadius,
    labelHeight,
    arcSpanRad = 1.18,
    curvatureSag = 11,
  } = params;

  const srcW = labelCanvas.width;
  const srcH = labelCanvas.height;
  const slices = 110;
  const thetaMin = -arcSpanRad;
  const thetaMax = arcSpanRad;

  ctx.save();
  // Soft drop shadow behind label perimeter so it sits physically on the vessel
  ctx.shadowColor = 'rgba(0, 0, 0, 0.34)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;

  for (let i = 0; i < slices; i++) {
    const t0 = i / slices;
    const t1 = (i + 1) / slices;
    const theta0 = thetaMin + (thetaMax - thetaMin) * t0;
    const theta1 = thetaMin + (thetaMax - thetaMin) * t1;
    const thetaMid = (theta0 + theta1) / 2;

    const x0 = centerX + cylinderRadius * Math.sin(theta0);
    const x1 = centerX + cylinderRadius * Math.sin(theta1);
    const sliceDrawW = Math.max(1.2, x1 - x0 + 0.45);

    const sag = curvatureSag * Math.cos(thetaMid);
    const drawY = topY + sag;

    const srcX = Math.floor(t0 * srcW);
    const srcSliceW = Math.max(1, Math.ceil((t1 - t0) * srcW));

    ctx.drawImage(
      labelCanvas,
      srcX,
      0,
      srcSliceW,
      srcH,
      x0,
      drawY,
      sliceDrawW,
      labelHeight
    );
  }
  ctx.restore();

  // Cylindrical specular sheen & curved edge shading overlay matching exact curved bounds
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const theta = thetaMin + (thetaMax - thetaMin) * t;
    const x = centerX + cylinderRadius * Math.sin(theta);
    const y = topY + curvatureSag * Math.cos(theta);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  for (let i = 40; i >= 0; i--) {
    const t = i / 40;
    const theta = thetaMin + (thetaMax - thetaMin) * t;
    const x = centerX + cylinderRadius * Math.sin(theta);
    const y = topY + labelHeight + curvatureSag * Math.cos(theta);
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.clip();

  const leftEdgeX = centerX + cylinderRadius * Math.sin(thetaMin);
  const rightEdgeX = centerX + cylinderRadius * Math.sin(thetaMax);
  const cylGrad = ctx.createLinearGradient(leftEdgeX, 0, rightEdgeX, 0);
  cylGrad.addColorStop(0, 'rgba(15, 10, 8, 0.34)');
  cylGrad.addColorStop(0.18, 'rgba(255, 255, 255, 0.14)');
  cylGrad.addColorStop(0.32, 'rgba(255, 255, 255, 0.22)');
  cylGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.02)');
  cylGrad.addColorStop(0.84, 'rgba(20, 12, 10, 0.14)');
  cylGrad.addColorStop(1, 'rgba(12, 8, 6, 0.42)');
  ctx.fillStyle = cylGrad;
  ctx.fillRect(leftEdgeX - 2, topY - 4, rightEdgeX - leftEdgeX + 4, labelHeight + curvatureSag + 12);

  // Subtle paper rim outline along curved top & bottom
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

function drawStudioBackdrop(ctx: CanvasRenderingContext2D, spec: BrandedMockupSpec, size = 1080) {
  const { colors } = spec;
  const bg = ctx.createLinearGradient(0, 0, size, size * 0.72);
  bg.addColorStop(0, colors.backdropTop);
  bg.addColorStop(0.55, mixHex(colors.backdropTop, '#FFFFFF', 0.35));
  bg.addColorStop(1, colors.backdropBottom);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // Soft left sunlit window glow
  const sunGlow = ctx.createRadialGradient(size * 0.16, size * 0.18, 40, size * 0.16, size * 0.18, size * 0.72);
  sunGlow.addColorStop(0, 'rgba(255, 252, 244, 0.78)');
  sunGlow.addColorStop(1, 'rgba(255, 252, 244, 0)');
  ctx.fillStyle = sunGlow;
  ctx.fillRect(0, 0, size, size);

  // Artisan studio tabletop plane
  const tableY = size * 0.73;
  const tableGrad = ctx.createLinearGradient(0, tableY, 0, size);
  tableGrad.addColorStop(0, '#D7BA93');
  tableGrad.addColorStop(0.28, '#C8A679');
  tableGrad.addColorStop(1, '#9E784B');
  ctx.fillStyle = tableGrad;
  ctx.fillRect(0, tableY, size, size - tableY);

  // Subtle horizon line & tabletop wood grain accents
  ctx.fillStyle = 'rgba(72, 46, 22, 0.22)';
  ctx.fillRect(0, tableY, size, 3);
  ctx.save();
  ctx.strokeStyle = 'rgba(92, 58, 28, 0.12)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const gy = tableY + 26 + i * 32;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.bezierCurveTo(size * 0.35, gy - 6, size * 0.65, gy + 7, size, gy - 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawArtisanGlassBottle(
  ctx: CanvasRenderingContext2D,
  labelCanvas: HTMLCanvasElement,
  spec: BrandedMockupSpec,
  cfg: {
    cx: number;
    baseY: number;
    scale: number;
  }
) {
  const { cx, baseY, scale } = cfg;
  const bodyW = 248 * scale;
  const bodyH = 448 * scale;
  const radius = bodyW / 2;
  const shoulderH = 92 * scale;
  const neckW = 68 * scale;
  const neckH = 112 * scale;
  const corkW = 76 * scale;
  const corkH = 54 * scale;

  const bodyBottomY = baseY;
  const bodyTopY = bodyBottomY - bodyH;
  const shoulderTopY = bodyTopY - shoulderH;
  const neckTopY = shoulderTopY - neckH;

  // Tabletop elliptical contact shadow
  ctx.save();
  const shadowGrad = ctx.createRadialGradient(cx + 16 * scale, baseY + 10 * scale, 10, cx + 16 * scale, baseY + 10 * scale, bodyW * 0.85);
  shadowGrad.addColorStop(0, 'rgba(32, 18, 10, 0.45)');
  shadowGrad.addColorStop(0.6, 'rgba(32, 18, 10, 0.16)');
  shadowGrad.addColorStop(1, 'rgba(32, 18, 10, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(cx + 16 * scale, baseY + 8 * scale, bodyW * 0.78, 26 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Define bottle glass silhouette path helper
  const traceBottlePath = () => {
    ctx.beginPath();
    ctx.moveTo(cx - neckW / 2, neckTopY);
    ctx.lineTo(cx + neckW / 2, neckTopY);
    ctx.lineTo(cx + neckW / 2, shoulderTopY);
    // Right shoulder curve
    ctx.bezierCurveTo(
      cx + neckW / 2,
      shoulderTopY + shoulderH * 0.45,
      cx + radius,
      bodyTopY - shoulderH * 0.35,
      cx + radius,
      bodyTopY + 26 * scale
    );
    ctx.lineTo(cx + radius, bodyBottomY - 24 * scale);
    ctx.quadraticCurveTo(cx + radius, bodyBottomY, cx + radius - 26 * scale, bodyBottomY);
    ctx.lineTo(cx - radius + 26 * scale, bodyBottomY);
    ctx.quadraticCurveTo(cx - radius, bodyBottomY, cx - radius, bodyBottomY - 24 * scale);
    ctx.lineTo(cx - radius, bodyTopY + 26 * scale);
    // Left shoulder curve
    ctx.bezierCurveTo(
      cx - radius,
      bodyTopY - shoulderH * 0.35,
      cx - neckW / 2,
      shoulderTopY + shoulderH * 0.45,
      cx - neckW / 2,
      shoulderTopY
    );
    ctx.closePath();
  };

  // 1. Glass base fill + translucent liquid
  ctx.save();
  traceBottlePath();
  ctx.clip();

  const glassGrad = ctx.createLinearGradient(cx - radius, 0, cx + radius, 0);
  glassGrad.addColorStop(0, 'rgba(235, 240, 242, 0.72)');
  glassGrad.addColorStop(0.25, 'rgba(255, 255, 255, 0.45)');
  glassGrad.addColorStop(0.75, 'rgba(220, 228, 232, 0.38)');
  glassGrad.addColorStop(1, 'rgba(180, 192, 200, 0.65)');
  ctx.fillStyle = glassGrad;
  ctx.fillRect(cx - radius - 4, neckTopY - 4, bodyW + 8, bodyBottomY - neckTopY + 8);

  // Liquid fill inside bottle (up to top shoulder level)
  const liquidTopY = bodyTopY - 22 * scale;
  const liq = spec.liquidPalette;
  const liqGrad = ctx.createLinearGradient(cx - radius, liquidTopY, cx + radius, bodyBottomY);
  liqGrad.addColorStop(0, liq.deep);
  liqGrad.addColorStop(0.32, liq.mid);
  liqGrad.addColorStop(0.68, liq.deep);
  liqGrad.addColorStop(1, '#26020D');
  ctx.fillStyle = liqGrad;
  ctx.fillRect(cx - radius, liquidTopY, bodyW, bodyBottomY - liquidTopY - 12 * scale);

  // Inner luminous liquid backlight glow
  const glowGrad = ctx.createRadialGradient(
    cx - 18 * scale,
    bodyTopY + bodyH * 0.38,
    10 * scale,
    cx,
    bodyTopY + bodyH * 0.45,
    bodyW * 0.56
  );
  glowGrad.addColorStop(0, liq.bright);
  glowGrad.addColorStop(0.55, `${liq.mid}88`);
  glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(cx - radius, liquidTopY, bodyW, bodyH);

  // Curved liquid meniscus at fill level
  ctx.fillStyle = liq.rim;
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.ellipse(cx, liquidTopY + 4 * scale, radius - 14 * scale, 10 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Heavy glass base refraction highlight
  const baseGlass = ctx.createLinearGradient(0, bodyBottomY - 24 * scale, 0, bodyBottomY);
  baseGlass.addColorStop(0, `${liq.bright}66`);
  baseGlass.addColorStop(0.55, 'rgba(255,255,255,0.45)');
  baseGlass.addColorStop(1, 'rgba(180,190,200,0.75)');
  ctx.fillStyle = baseGlass;
  ctx.fillRect(cx - radius, bodyBottomY - 20 * scale, bodyW, 24 * scale);

  // Specular vertical highlights on glass body
  const leftSpec = ctx.createLinearGradient(cx - radius + 16 * scale, 0, cx - radius + 54 * scale, 0);
  leftSpec.addColorStop(0, 'rgba(255,255,255,0)');
  leftSpec.addColorStop(0.45, 'rgba(255,255,255,0.48)');
  leftSpec.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = leftSpec;
  ctx.fillRect(cx - radius + 14 * scale, shoulderTopY, 44 * scale, bodyBottomY - shoulderTopY);

  const rightSpec = ctx.createLinearGradient(cx + radius - 32 * scale, 0, cx + radius - 8 * scale, 0);
  rightSpec.addColorStop(0, 'rgba(255,255,255,0)');
  rightSpec.addColorStop(0.5, 'rgba(255,255,255,0.28)');
  rightSpec.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = rightSpec;
  ctx.fillRect(cx + radius - 34 * scale, shoulderTopY, 28 * scale, bodyBottomY - shoulderTopY);

  // Subtle chilled condensation droplets above & below label
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  for (let d = 0; d < 28; d++) {
    const dx = cx - radius * 0.72 + ((d * 67) % (bodyW * 0.72));
    const dy = liquidTopY + 12 * scale + ((d * 83) % (bodyH * 0.75));
    const dr = (1.6 + (d % 3) * 0.9) * scale;
    ctx.beginPath();
    ctx.arc(dx, dy, dr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Crisp outer glass rim contour
  ctx.save();
  traceBottlePath();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
  ctx.lineWidth = 2.5 * scale;
  ctx.stroke();
  ctx.restore();

  // 2. Wooden Cork Stopper + Glass Lip + Jute Twine Collar
  const corkTopY = neckTopY - corkH * 0.78;
  ctx.save();
  // Cork lower plug inside neck
  ctx.fillStyle = '#9C734B';
  ctx.beginPath();
  ctx.roundRect(cx - neckW * 0.38, neckTopY - 8 * scale, neckW * 0.76, 36 * scale, 6 * scale);
  ctx.fill();

  // Wooden cap head
  const capGrad = ctx.createLinearGradient(cx - corkW / 2, 0, cx + corkW / 2, 0);
  capGrad.addColorStop(0, '#A88259');
  capGrad.addColorStop(0.35, '#DFBC94');
  capGrad.addColorStop(0.75, '#C49A6C');
  capGrad.addColorStop(1, '#8C6239');
  ctx.fillStyle = capGrad;
  ctx.beginPath();
  ctx.roundRect(cx - corkW / 2, corkTopY, corkW, corkH * 0.68, 10 * scale);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90, 56, 26, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Glass bottle mouth lip
  ctx.fillStyle = 'rgba(245, 248, 250, 0.85)';
  ctx.beginPath();
  ctx.roundRect(cx - (neckW + 10 * scale) / 2, neckTopY - 4 * scale, neckW + 10 * scale, 14 * scale, 7 * scale);
  ctx.fill();

  // Wrapped natural jute twine collar around neck
  ctx.strokeStyle = '#C9A875';
  ctx.lineWidth = 4.2 * scale;
  for (let t = 0; t < 4; t++) {
    const ty = neckTopY + (22 + t * 5.2) * scale;
    ctx.beginPath();
    ctx.moveTo(cx - neckW / 2 - 2, ty);
    ctx.quadraticCurveTo(cx, ty + 3 * scale, cx + neckW / 2 + 2, ty);
    ctx.stroke();
  }
  ctx.restore();

  // 3. Cylindrical-Warped Custom Brand Label attached around bottle body
  const labelH = bodyH * 0.47;
  const labelTopY = bodyTopY + bodyH * 0.24;
  drawCylindricalWrappedLabel(ctx, labelCanvas, {
    centerX: cx,
    topY: labelTopY,
    cylinderRadius: radius * 0.96,
    labelHeight: labelH,
    arcSpanRad: 1.15,
    curvatureSag: 10 * scale,
  });
}

function drawCulinaryJarScene(
  ctx: CanvasRenderingContext2D,
  labelCanvas: HTMLCanvasElement,
  spec: BrandedMockupSpec
) {
  const cx = 540;
  const baseY = 825;
  const jarW = 410;
  const radius = jarW / 2;
  const jarH = 420;
  const jarTopY = baseY - jarH;

  // Shadow
  ctx.save();
  const shadowGrad = ctx.createRadialGradient(cx + 12, baseY + 12, 20, cx + 12, baseY + 12, 270);
  shadowGrad.addColorStop(0, 'rgba(30, 18, 10, 0.42)');
  shadowGrad.addColorStop(1, 'rgba(30, 18, 10, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(cx + 12, baseY + 10, 235, 32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Jar body
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cx - radius, jarTopY, jarW, jarH, 48);
  ctx.clip();

  const contentGrad = ctx.createLinearGradient(cx - radius, jarTopY, cx + radius, baseY);
  contentGrad.addColorStop(0, mixHex(spec.colors.primaryColor, '#7C2D12', 0.65));
  contentGrad.addColorStop(0.5, mixHex(spec.colors.secondaryColor, '#991B1B', 0.6));
  contentGrad.addColorStop(1, '#450A0A');
  ctx.fillStyle = contentGrad;
  ctx.fillRect(cx - radius, jarTopY, jarW, jarH);

  // Specular highlights
  const specL = ctx.createLinearGradient(cx - radius + 24, 0, cx - radius + 82, 0);
  specL.addColorStop(0, 'rgba(255,255,255,0)');
  specL.addColorStop(0.5, 'rgba(255,255,255,0.34)');
  specL.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = specL;
  ctx.fillRect(cx - radius + 20, jarTopY, 64, jarH);
  ctx.restore();

  // Brushed gold/brand metallic jar lid
  const lidGrad = ctx.createLinearGradient(cx - 175, 0, cx + 175, 0);
  lidGrad.addColorStop(0, '#785A28');
  lidGrad.addColorStop(0.35, '#F5D08A');
  lidGrad.addColorStop(0.7, '#C69749');
  lidGrad.addColorStop(1, '#684B1E');
  ctx.fillStyle = lidGrad;
  ctx.beginPath();
  ctx.roundRect(cx - 172, jarTopY - 78, 344, 92, 18);
  ctx.fill();

  drawCylindricalWrappedLabel(ctx, labelCanvas, {
    centerX: cx,
    topY: jarTopY + 76,
    cylinderRadius: radius * 0.96,
    labelHeight: 265,
    arcSpanRad: 1.12,
    curvatureSag: 14,
  });
}

function drawSkincareVesselScene(
  ctx: CanvasRenderingContext2D,
  labelCanvas: HTMLCanvasElement,
  spec: BrandedMockupSpec
) {
  // Travertine stone plinth
  const plinthY = 760;
  ctx.fillStyle = '#E6DDD0';
  ctx.beginPath();
  ctx.roundRect(210, plinthY, 660, 110, 14);
  ctx.fill();
  ctx.fillStyle = '#D3C7B6';
  ctx.fillRect(210, plinthY + 86, 660, 24);

  // Tall amber cosmetic dropper bottle (left)
  const dCx = 365;
  const dBaseY = plinthY + 12;
  const dW = 160;
  const dH = 310;
  const dGrad = ctx.createLinearGradient(dCx - dW / 2, 0, dCx + dW / 2, 0);
  dGrad.addColorStop(0, '#451A03');
  dGrad.addColorStop(0.35, '#B45309');
  dGrad.addColorStop(0.75, '#78350F');
  dGrad.addColorStop(1, '#290F02');
  ctx.fillStyle = dGrad;
  ctx.beginPath();
  ctx.roundRect(dCx - dW / 2, dBaseY - dH, dW, dH, 28);
  ctx.fill();

  // Dropper cap
  ctx.fillStyle = '#1C1917';
  ctx.beginPath();
  ctx.roundRect(dCx - 30, dBaseY - dH - 96, 60, 68, 28);
  ctx.fill();
  ctx.fillStyle = '#E7D5B8';
  ctx.beginPath();
  ctx.roundRect(dCx - 42, dBaseY - dH - 34, 84, 38, 8);
  ctx.fill();

  drawCylindricalWrappedLabel(ctx, labelCanvas, {
    centerX: dCx,
    topY: dBaseY - 235,
    cylinderRadius: (dW / 2) * 0.96,
    labelHeight: 165,
    arcSpanRad: 1.12,
    curvatureSag: 8,
  });

  // Wide cosmetic cream jar (right/foreground)
  const jCx = 665;
  const jBaseY = plinthY + 28;
  const jW = 310;
  const jH = 225;
  const jarGrad = ctx.createLinearGradient(jCx - jW / 2, 0, jCx + jW / 2, 0);
  jarGrad.addColorStop(0, '#F0EAE0');
  jarGrad.addColorStop(0.32, '#FFFFFF');
  jarGrad.addColorStop(0.78, '#E6DDD0');
  jarGrad.addColorStop(1, '#C5B8A5');
  ctx.fillStyle = jarGrad;
  ctx.beginPath();
  ctx.roundRect(jCx - jW / 2, jBaseY - jH, jW, jH, 26);
  ctx.fill();

  const capGrad = ctx.createLinearGradient(jCx - jW / 2, 0, jCx + jW / 2, 0);
  capGrad.addColorStop(0, spec.colors.primaryColor);
  capGrad.addColorStop(0.4, mixHex(spec.colors.primaryColor, '#FFFFFF', 0.25));
  capGrad.addColorStop(1, '#111827');
  ctx.fillStyle = capGrad;
  ctx.beginPath();
  ctx.roundRect(jCx - jW / 2 - 4, jBaseY - jH - 64, jW + 8, 74, 14);
  ctx.fill();

  drawCylindricalWrappedLabel(ctx, labelCanvas, {
    centerX: jCx,
    topY: jBaseY - jH + 30,
    cylinderRadius: (jW / 2) * 0.95,
    labelHeight: 162,
    arcSpanRad: 1.08,
    curvatureSag: 10,
  });
}

function drawBoutiqueOrBoxScene(
  ctx: CanvasRenderingContext2D,
  labelCanvas: HTMLCanvasElement,
  spec: BrandedMockupSpec,
  productImageElement?: HTMLImageElement | null
) {
  // Branded rigid studio box (left)
  const boxX = 110;
  const boxY = 230;
  const boxW = 470;
  const boxH = 590;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.28)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 16;

  // Box body
  const boxGrad = ctx.createLinearGradient(boxX, boxY, boxX + boxW, boxY + boxH);
  boxGrad.addColorStop(0, spec.colors.primaryColor);
  boxGrad.addColorStop(1, mixHex(spec.colors.primaryColor, '#090D16', 0.45));
  ctx.fillStyle = boxGrad;
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, 24);
  ctx.fill();
  ctx.restore();

  // Lid bevel
  ctx.fillStyle = mixHex(spec.colors.primaryColor, '#FFFFFF', 0.14);
  ctx.beginPath();
  ctx.roundRect(boxX - 8, boxY, boxW + 16, 86, [24, 24, 10, 10]);
  ctx.fill();

  // Accent ribbon band
  ctx.fillStyle = spec.colors.accentColor;
  ctx.fillRect(boxX + 46, boxY, 26, boxH);

  // Label mounted onto the packaging front face cleanly
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.28)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 6;
  ctx.drawImage(labelCanvas, boxX + 94, boxY + 170, 340, 280);
  ctx.restore();

  // Right card: Cleanly framed Verified Product Photo (or branded swing hang-tag)
  const cardX = 625;
  const cardY = 265;
  const cardW = 355;
  const cardH = 520;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.24)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 24);
  ctx.fill();
  ctx.restore();

  if (productImageElement && productImageElement.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardX + 18, cardY + 18, cardW - 36, cardH - 110, 16);
    ctx.clip();
    const iw = productImageElement.naturalWidth;
    const ih = productImageElement.naturalHeight;
    const targetW = cardW - 36;
    const targetH = cardH - 110;
    const scale = Math.max(targetW / iw, targetH / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    ctx.drawImage(
      productImageElement,
      cardX + 18 + (targetW - dw) / 2,
      cardY + 18 + (targetH - dh) / 2,
      dw,
      dh
    );
    ctx.restore();

    ctx.fillStyle = '#1C1917';
    ctx.textAlign = 'center';
    ctx.font = `800 20px ${spec.typography.displayFontFamily}`;
    ctx.fillText(spec.brandName.toUpperCase(), cardX + cardW / 2, cardY + cardH - 52);
    ctx.fillStyle = '#57534E';
    ctx.font = `600 14px ${spec.typography.bodyFontFamily}`;
    ctx.fillText('VERIFIED PRODUCT IN BRANDED PACKAGING', cardX + cardW / 2, cardY + cardH - 26);
  } else {
    // Minimal hang-tag fallback
    ctx.drawImage(labelCanvas, cardX + 26, cardY + 95, cardW - 52, 260);
  }
}

/**
 * Renders a 1080x1080 separate Branded Product Packaging Mockup PNG data URL
 * displaying the active brand name directly on realistic studio packaging.
 */
export async function renderBrandedProductMockup(
  input: ProductMockupInput
): Promise<{ dataUrl: string; spec: BrandedMockupSpec }> {
  const spec = buildMockupSpec(input);
  const size = 1080;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not initialize 2D canvas context for product mockup.');
  }

  const labelCanvas = createLabelTextureCanvas(spec);
  drawStudioBackdrop(ctx, spec, size);

  if (spec.style === 'beverage-bottles') {
    // Twin chilled bottles matching artisanal beverage presentation
    drawArtisanGlassBottle(ctx, labelCanvas, spec, {
      cx: 675,
      baseY: 855,
      scale: 0.94,
    });
    drawArtisanGlassBottle(ctx, labelCanvas, spec, {
      cx: 385,
      baseY: 878,
      scale: 1.0,
    });
  } else if (spec.style === 'culinary-jar') {
    drawCulinaryJarScene(ctx, labelCanvas, spec);
  } else if (spec.style === 'skincare-vessel') {
    drawSkincareVesselScene(ctx, labelCanvas, spec);
  } else {
    const productImg = input.productImageUrl
      ? await loadCanvasImage(input.productImageUrl)
      : null;
    drawBoutiqueOrBoxScene(ctx, labelCanvas, spec, productImg);
  }

  return {
    dataUrl: canvas.toDataURL('image/png'),
    spec,
  };
}
