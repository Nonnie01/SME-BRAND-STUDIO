import {
  ProductImageVerificationResult,
  ProductRecognitionResult,
  RecognizedProductContext,
} from '../types';

const CATEGORY_ALIASES: Record<string, string> = {
  fashion: 'fashion and clothing',
  'fashion and clothing': 'fashion and clothing',
  skincare: 'beauty and skincare',
  'beauty and skincare': 'beauty and skincare',
  food: 'food and beverages',
  drinks: 'food and beverages',
  beverages: 'food and beverages',
  'beverages & local drinks': 'food and beverages',
  'food and beverages': 'food and beverages',
  handmade: 'arts, crafts and handmade products',
  'arts, crafts and handmade products': 'arts, crafts and handmade products',
  'haircare and cosmetics': 'haircare and cosmetics',
  'footwear and accessories': 'footwear and accessories',
  'electronics and gadgets': 'electronics and gadgets',
  'home and household products': 'home and household products',
  'agriculture and agricultural products': 'agriculture and agricultural products',
  'health and wellness': 'health and wellness',
  other: 'other products',
  'other products': 'other products',
};

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'from',
  'this',
  'that',
  'your',
  'into',
  'pure',
  'best',
  'fresh',
  'natural',
  'organic',
  'nigerian',
  'nigeria',
  'naija',
  'original',
  'artisan',
  'artisanal',
  'product',
  'products',
  'item',
  'items',
  'quality',
  'premium',
  'crafted',
  'handcrafted',
  'made',
  'pack',
  'size',
  'local',
  'designed',
  'buyers',
  'market',
  'estimated',
  'visible',
  'clear',
  'good',
  'high',
  'grade',
  'style',
  'rich',
  'smooth',
  'zero',
  'artificial',
  'all',
  'new',
  'two',
  'one',
]);

export function normalizeVerificationText(value: string | null | undefined): string {
  return (value || '').trim().replace(/\s+/g, ' ');
}

export function normalizeCategoryForComparison(rawCategory: string | null | undefined): string {
  const normalized = normalizeVerificationText(rawCategory).toLowerCase();
  return CATEGORY_ALIASES[normalized] || normalized;
}

export function buildProductVerifyKey(params: {
  imageUrl?: string | null;
  productName?: string | null;
  productDescription?: string | null;
  category?: string | null;
}): string {
  return [
    normalizeVerificationText(params.imageUrl),
    normalizeVerificationText(params.productName),
    normalizeVerificationText(params.productDescription),
    normalizeCategoryForComparison(params.category),
  ].join('||');
}

export function isValidRecognizedImageSource(imageUrl: string | null | undefined): boolean {
  const trimmed = normalizeVerificationText(imageUrl);
  if (!trimmed) return false;
  return (
    trimmed.startsWith('/') ||
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  );
}

export function extractSignificantTokens(text: string | null | undefined): string[] {
  const normalized = normalizeVerificationText(text).toLowerCase();
  if (!normalized) return [];

  const tokens = normalized
    .split(/[^a-z0-9]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3 && !STOP_WORDS.has(t) && !/^\d+(ml|g|kg|l)?$/.test(t));

  return Array.from(new Set(tokens));
}

function tokensMatch(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length >= 4 && b.length >= 4) {
    if (a.includes(b) || b.includes(a)) return true;
  }
  const stemA = a.length > 4 && a.endsWith('s') ? a.slice(0, -1) : a;
  const stemB = b.length > 4 && b.endsWith('s') ? b.slice(0, -1) : b;
  return stemA === stemB;
}

function hasAnyTokenOverlap(candidateTokens: string[], corpusTokens: string[]): boolean {
  for (const candidate of candidateTokens) {
    for (const target of corpusTokens) {
      if (tokensMatch(candidate, target)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Verifies that a ProductRecognitionResult genuinely aligns with the product's
 * category, name, and description before it can be reused without another AI call.
 */
export function doesRecognitionMatchProductDetails(
  recognition: ProductRecognitionResult,
  productName: string | null | undefined,
  productDescription: string | null | undefined,
  category: string | null | undefined
): boolean {
  const normalizedCategory = normalizeCategoryForComparison(category);
  const recognizedCategory = normalizeCategoryForComparison(recognition.productCategory);

  if (!recognizedCategory) return false;
  if (
    normalizedCategory &&
    normalizedCategory !== 'other products' &&
    normalizedCategory !== recognizedCategory
  ) {
    return false;
  }

  const corpusTokens = extractSignificantTokens(
    [
      recognition.productIdentified,
      recognition.productCategory,
      recognition.productSubcategory,
      recognition.visualDescription,
      ...(Array.isArray(recognition.confirmedCharacteristics)
        ? recognition.confirmedCharacteristics
        : []),
    ]
      .filter(Boolean)
      .join(' ')
  );

  if (corpusTokens.length === 0) return false;

  const nameTokens = extractSignificantTokens(productName);
  if (nameTokens.length === 0 || !hasAnyTokenOverlap(nameTokens, corpusTokens)) {
    return false;
  }

  const descTokens = extractSignificantTokens(productDescription);
  if (descTokens.length >= 2 && !hasAnyTokenOverlap(descTokens, corpusTokens)) {
    return false;
  }

  return true;
}

/**
 * Validates whether an already-confirmed recognition state can safely serve as the
 * initial product verification for the current flyer without triggering a duplicate
 * /api/verify-product-image call.
 *
 * Security guardrail: Never trusts a bare `recognitionConfirmed` boolean alone.
 * Requires a structurally valid High-confidence recognition result, exact image &
 * detail provenance matching `recognizedContext`, and detail/category alignment.
 */
export function resolveConfirmedRecognitionVerification(params: {
  imageUrl: string | null | undefined;
  productName: string | null | undefined;
  productDescription: string | null | undefined;
  category: string | null | undefined;
  productRecognition?: ProductRecognitionResult | null;
  recognitionConfirmed?: boolean;
  recognizedContext?: RecognizedProductContext | null;
}): ProductImageVerificationResult | null {
  const {
    imageUrl,
    productName,
    productDescription,
    category,
    productRecognition,
    recognitionConfirmed,
    recognizedContext,
  } = params;

  if (recognitionConfirmed !== true || !productRecognition || !recognizedContext) {
    return null;
  }

  if (!isValidRecognizedImageSource(imageUrl)) {
    return null;
  }

  const confidence = productRecognition.identificationConfidence;
  if (
    !productRecognition.productIdentified ||
    !productRecognition.productCategory ||
    !productRecognition.visualDescription ||
    !confidence ||
    confidence.level !== 'High' ||
    typeof confidence.percentage !== 'number' ||
    confidence.percentage < 75
  ) {
    return null;
  }

  if (productRecognition.clarificationRequired?.isAmbiguousOrMultiple === true) {
    return null;
  }

  // Provenance check: recognition must belong to the exact current image and details
  if (
    !normalizeVerificationText(recognizedContext.imageUrl) ||
    normalizeVerificationText(recognizedContext.imageUrl) !== normalizeVerificationText(imageUrl) ||
    normalizeVerificationText(recognizedContext.recognitionProductIdentified) !==
      normalizeVerificationText(productRecognition.productIdentified) ||
    normalizeVerificationText(recognizedContext.productName) !==
      normalizeVerificationText(productName) ||
    normalizeVerificationText(recognizedContext.productDescription) !==
      normalizeVerificationText(productDescription) ||
    normalizeCategoryForComparison(recognizedContext.category) !==
      normalizeCategoryForComparison(category)
  ) {
    return null;
  }

  if (
    !doesRecognitionMatchProductDetails(
      productRecognition,
      productName,
      productDescription,
      category
    )
  ) {
    return null;
  }

  return {
    matches: true,
    confidence: Math.min(99, Math.max(75, Math.round(confidence.percentage))),
    detectedProduct: productRecognition.productIdentified,
    detectedCategory: productRecognition.productCategory,
    mismatchReason: '',
    suggestedAction: '',
  };
}

export interface VerificationSyncInput {
  needsProductVerification: boolean;
  imageUrl: string | null | undefined;
  productName: string | null | undefined;
  productDescription: string | null | undefined;
  category: string | null | undefined;
  currentVerification: ProductImageVerificationResult | null;
  currentVerifiedKey: string;
  lastAttemptedKey: string;
  isVerifying: boolean;
  productRecognition?: ProductRecognitionResult | null;
  recognitionConfirmed?: boolean;
  recognizedContext?: RecognizedProductContext | null;
}

export type VerificationSyncDecision =
  | { action: 'clear' }
  | { action: 'noop' }
  | {
      action: 'reuse-confirmed';
      verification: ProductImageVerificationResult;
      verifiedKey: string;
    }
  | {
      action: 'invalidate-and-verify';
      verifyKey: string;
    };

/**
 * Pure state-transition decision for SocialFlyerStudio verification synchronization.
 * Ensures:
 * - Already-confirmed unchanged products reuse prior recognition without duplicate API calls.
 * - Any image, name, description, or category change invalidates stale verification and triggers a fresh check.
 * - Failed/in-flight checks do not cause infinite retry loops or fall back to stale results.
 */
export function reconcileProductVerificationState(
  input: VerificationSyncInput
): VerificationSyncDecision {
  const {
    needsProductVerification,
    imageUrl,
    productName,
    productDescription,
    category,
    currentVerification,
    currentVerifiedKey,
    lastAttemptedKey,
    isVerifying,
    productRecognition,
    recognitionConfirmed,
    recognizedContext,
  } = input;

  if (!needsProductVerification || !normalizeVerificationText(imageUrl)) {
    if (currentVerification !== null || currentVerifiedKey !== '' || lastAttemptedKey !== '') {
      return { action: 'clear' };
    }
    return { action: 'noop' };
  }

  const targetKey = buildProductVerifyKey({
    imageUrl,
    productName,
    productDescription,
    category,
  });

  if (currentVerification && currentVerifiedKey === targetKey) {
    return { action: 'noop' };
  }

  if (isVerifying || lastAttemptedKey === targetKey) {
    return { action: 'noop' };
  }

  const confirmedMatch = resolveConfirmedRecognitionVerification({
    imageUrl,
    productName,
    productDescription,
    category,
    productRecognition,
    recognitionConfirmed,
    recognizedContext,
  });

  if (confirmedMatch) {
    return {
      action: 'reuse-confirmed',
      verification: confirmedMatch,
      verifiedKey: targetKey,
    };
  }

  return {
    action: 'invalidate-and-verify',
    verifyKey: targetKey,
  };
}
