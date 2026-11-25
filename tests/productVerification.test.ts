import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { SAMPLE_PRODUCTS } from '../src/data/sampleProducts';
import { resolveImagePart } from '../server/imageResolver';
import {
  buildProductVerifyKey,
  normalizeCategoryForComparison,
  resolveConfirmedRecognitionVerification,
  reconcileProductVerificationState,
} from '../src/utils/productVerification';
import {
  ProductImageVerificationResult,
  ProductRecognitionResult,
  RecognizedProductContext,
} from '../src/types';

function getZoboSampleFixture() {
  const zobo = SAMPLE_PRODUCTS.find((item) => item.id === 'drinks-zobo');
  assert.ok(zobo, 'Expected drinks-zobo sample in SAMPLE_PRODUCTS');
  assert.ok(zobo.imageUrl, 'Expected zobo sample imageUrl');
  assert.ok(zobo.recognition, 'Expected zobo sample recognition');
  return zobo;
}

test('Unchanged verified Zobo sample reuses confirmed recognition without triggering a duplicate API verification', async () => {
  const zobo = getZoboSampleFixture();
  const recognition = zobo.recognition!;

  const resolvedAsset = await resolveImagePart(zobo.imageUrl!);
  assert.ok(resolvedAsset, 'Zobo sample asset /samples/zobo-drink.jpg must resolve');
  assert.equal(resolvedAsset.inlineData.mimeType, 'image/jpeg');
  assert.ok(resolvedAsset.inlineData.data.length > 1000);

  const recognizedContext: RecognizedProductContext = {
    imageUrl: zobo.imageUrl!,
    productName: zobo.productName,
    productDescription: zobo.description,
    category: zobo.category,
    recognitionProductIdentified: recognition.productIdentified,
  };

  // First render inside SocialFlyerStudio -> reuses confirmed recognition locally (0 API calls)
  const firstDecision = reconcileProductVerificationState({
    needsProductVerification: true,
    imageUrl: zobo.imageUrl,
    productName: zobo.productName,
    productDescription: zobo.description,
    category: zobo.category,
    currentVerification: null,
    currentVerifiedKey: '',
    lastAttemptedKey: '',
    isVerifying: false,
    productRecognition: recognition,
    recognitionConfirmed: true,
    recognizedContext,
  });

  assert.equal(firstDecision.action, 'reuse-confirmed');
  assert.equal(firstDecision.verification.matches, true);
  assert.equal(firstDecision.verification.confidence, 95);
  assert.equal(firstDecision.verification.detectedProduct, recognition.productIdentified);
  assert.equal(firstDecision.verification.detectedCategory, recognition.productCategory);

  // Subsequent re-renders with current verification applied -> noop (never double-calls API)
  const secondDecision = reconcileProductVerificationState({
    needsProductVerification: true,
    imageUrl: zobo.imageUrl,
    productName: zobo.productName,
    productDescription: zobo.description,
    category: zobo.category,
    currentVerification: firstDecision.verification,
    currentVerifiedKey: firstDecision.verifiedKey,
    lastAttemptedKey: firstDecision.verifiedKey,
    isVerifying: false,
    productRecognition: recognition,
    recognitionConfirmed: true,
    recognizedContext,
  });

  assert.equal(secondDecision.action, 'noop');
});

test('Unchanged confirmed user-uploaded product photo also reuses recognition safely', () => {
  const uploadedDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAA==';
  const recognition: ProductRecognitionResult = {
    productIdentified: 'Handwoven Raffia & Leather Crossbody Bag',
    productCategory: 'Arts, crafts and handmade products',
    productSubcategory: 'Handbags & Totes',
    industry: 'Leathergoods & Crafts',
    visualDescription:
      'Structured woven natural raffia crossbody purse with tan vegetable-tanned leather flap and brass buckle.',
    likelyTargetAudience: 'Nigerian professionals and boutique fashion shoppers',
    identificationConfidence: {
      level: 'High',
      percentage: 91,
      explanation: 'Clear woven raffia texture and leather strap structure.',
    },
    confirmedCharacteristics: ['Woven raffia body', 'Tan leather flap', 'Brass buckle'],
    visualEstimates: ['Medium crossbody bag'],
  };

  const recognizedContext: RecognizedProductContext = {
    imageUrl: uploadedDataUrl,
    productName: recognition.productIdentified,
    productDescription: `${recognition.visualDescription} Designed for ${recognition.likelyTargetAudience}.`,
    category: recognition.productCategory,
    recognitionProductIdentified: recognition.productIdentified,
  };

  const decision = reconcileProductVerificationState({
    needsProductVerification: true,
    imageUrl: uploadedDataUrl,
    productName: recognizedContext.productName,
    productDescription: recognizedContext.productDescription,
    category: recognizedContext.category,
    currentVerification: null,
    currentVerifiedKey: '',
    lastAttemptedKey: '',
    isVerifying: false,
    productRecognition: recognition,
    recognitionConfirmed: true,
    recognizedContext,
  });

  assert.equal(decision.action, 'reuse-confirmed');
  assert.equal(decision.verification.matches, true);
  assert.equal(decision.verification.confidence, 91);
});

test('Security guardrails refuse unverified boolean flags, low confidence, ambiguous scans, bad URLs, and mismatched metadata', () => {
  const zobo = getZoboSampleFixture();
  const recognition = zobo.recognition!;
  const validContext: RecognizedProductContext = {
    imageUrl: zobo.imageUrl!,
    productName: zobo.productName,
    productDescription: zobo.description,
    category: zobo.category,
    recognitionProductIdentified: recognition.productIdentified,
  };

  // 1. Bare client-side boolean without recognizedContext provenance -> rejected
  assert.equal(
    resolveConfirmedRecognitionVerification({
      imageUrl: zobo.imageUrl,
      productName: zobo.productName,
      productDescription: zobo.description,
      category: zobo.category,
      productRecognition: recognition,
      recognitionConfirmed: true,
      recognizedContext: null,
    }),
    null
  );

  // 2. recognitionConfirmed === false -> rejected
  assert.equal(
    resolveConfirmedRecognitionVerification({
      imageUrl: zobo.imageUrl,
      productName: zobo.productName,
      productDescription: zobo.description,
      category: zobo.category,
      productRecognition: recognition,
      recognitionConfirmed: false,
      recognizedContext: validContext,
    }),
    null
  );

  // 3. Low / Medium confidence -> rejected
  assert.equal(
    resolveConfirmedRecognitionVerification({
      imageUrl: zobo.imageUrl,
      productName: zobo.productName,
      productDescription: zobo.description,
      category: zobo.category,
      productRecognition: {
        ...recognition,
        identificationConfidence: {
          level: 'Medium',
          percentage: 72,
          explanation: 'Partially obscured label',
        },
      },
      recognitionConfirmed: true,
      recognizedContext: validContext,
    }),
    null
  );

  // 4. Ambiguous or multiple objects -> rejected
  assert.equal(
    resolveConfirmedRecognitionVerification({
      imageUrl: zobo.imageUrl,
      productName: zobo.productName,
      productDescription: zobo.description,
      category: zobo.category,
      productRecognition: {
        ...recognition,
        clarificationRequired: {
          isAmbiguousOrMultiple: true,
          detectedItems: ['Zobo', 'Kunu'],
          clarificationMessage: 'Multiple bottles visible',
        },
      },
      recognitionConfirmed: true,
      recognizedContext: validContext,
    }),
    null
  );

  // 5. Unsafe or non-image URL -> rejected
  assert.equal(
    resolveConfirmedRecognitionVerification({
      imageUrl: 'javascript:alert(1)',
      productName: zobo.productName,
      productDescription: zobo.description,
      category: zobo.category,
      productRecognition: recognition,
      recognitionConfirmed: true,
      recognizedContext: { ...validContext, imageUrl: 'javascript:alert(1)' },
    }),
    null
  );

  // 6. Spoofed context matching unrelated product details -> rejected by detail alignment check
  assert.equal(
    resolveConfirmedRecognitionVerification({
      imageUrl: zobo.imageUrl,
      productName: 'Bluetooth Wireless Earbuds Pro',
      productDescription: 'Active noise cancelling charging case with USB-C cable',
      category: 'Electronics and gadgets',
      productRecognition: recognition,
      recognitionConfirmed: true,
      recognizedContext: {
        imageUrl: zobo.imageUrl!,
        productName: 'Bluetooth Wireless Earbuds Pro',
        productDescription: 'Active noise cancelling charging case with USB-C cable',
        category: 'Electronics and gadgets',
        recognitionProductIdentified: recognition.productIdentified,
      },
    }),
    null
  );
});

test('Changed image invalidates previous verification and requires a fresh check', () => {
  const zobo = getZoboSampleFixture();
  const recognition = zobo.recognition!;
  const recognizedContext: RecognizedProductContext = {
    imageUrl: zobo.imageUrl!,
    productName: zobo.productName,
    productDescription: zobo.description,
    category: zobo.category,
    recognitionProductIdentified: recognition.productIdentified,
  };

  const initialDecision = reconcileProductVerificationState({
    needsProductVerification: true,
    imageUrl: zobo.imageUrl,
    productName: zobo.productName,
    productDescription: zobo.description,
    category: zobo.category,
    currentVerification: null,
    currentVerifiedKey: '',
    lastAttemptedKey: '',
    isVerifying: false,
    productRecognition: recognition,
    recognitionConfirmed: true,
    recognizedContext,
  });
  assert.equal(initialDecision.action, 'reuse-confirmed');

  // User replaces photo with a different image while previous verification is still in state
  const replacementImage = '/samples/shea-butter.jpg';
  const changedImageDecision = reconcileProductVerificationState({
    needsProductVerification: true,
    imageUrl: replacementImage,
    productName: zobo.productName,
    productDescription: zobo.description,
    category: zobo.category,
    currentVerification: initialDecision.verification,
    currentVerifiedKey: initialDecision.verifiedKey,
    lastAttemptedKey: initialDecision.verifiedKey,
    isVerifying: false,
    productRecognition: recognition,
    recognitionConfirmed: true,
    recognizedContext,
  });

  assert.equal(changedImageDecision.action, 'invalidate-and-verify');
  assert.notEqual(changedImageDecision.verifyKey, initialDecision.verifiedKey);
});

test('Changed product name or description invalidates verification and fixes stale key bug', () => {
  const zobo = getZoboSampleFixture();
  const recognition = zobo.recognition!;
  const recognizedContext: RecognizedProductContext = {
    imageUrl: zobo.imageUrl!,
    productName: zobo.productName,
    productDescription: zobo.description,
    category: zobo.category,
    recognitionProductIdentified: recognition.productIdentified,
  };

  const originalKey = buildProductVerifyKey({
    imageUrl: zobo.imageUrl,
    productName: zobo.productName,
    productDescription: zobo.description,
    category: zobo.category,
  });

  const existingVerification: ProductImageVerificationResult = {
    matches: true,
    confidence: 95,
    detectedProduct: recognition.productIdentified,
    detectedCategory: recognition.productCategory,
    mismatchReason: '',
    suggestedAction: '',
  };

  // 1. Product description materially changes (e.g. Zobo -> Leather Tote Bag)
  const descChangedDecision = reconcileProductVerificationState({
    needsProductVerification: true,
    imageUrl: zobo.imageUrl,
    productName: zobo.productName,
    productDescription: 'Handcrafted Italian leather briefcase with brass locks and laptop compartment.',
    category: zobo.category,
    currentVerification: existingVerification,
    currentVerifiedKey: originalKey,
    lastAttemptedKey: originalKey,
    isVerifying: false,
    productRecognition: recognition,
    recognitionConfirmed: true,
    recognizedContext,
  });

  assert.equal(descChangedDecision.action, 'invalidate-and-verify');
  assert.notEqual(descChangedDecision.verifyKey, originalKey);

  // 2. Product name materially changes
  const nameChangedDecision = reconcileProductVerificationState({
    needsProductVerification: true,
    imageUrl: zobo.imageUrl,
    productName: 'Fresh Tiger Nut Milk (Kunun Aya)',
    productDescription: zobo.description,
    category: zobo.category,
    currentVerification: existingVerification,
    currentVerifiedKey: originalKey,
    lastAttemptedKey: originalKey,
    isVerifying: false,
    productRecognition: recognition,
    recognitionConfirmed: true,
    recognizedContext,
  });

  assert.equal(nameChangedDecision.action, 'invalidate-and-verify');
  assert.notEqual(nameChangedDecision.verifyKey, originalKey);

  // 3. Category alias normalization preserves key for equivalent legacy labels
  assert.equal(normalizeCategoryForComparison('drinks'), 'food and beverages');
  assert.equal(normalizeCategoryForComparison('Beverages & Local Drinks'), 'food and beverages');
});

test('Failed verification stays blocked without infinite retry loops and resets cleanly when inputs clear or change', () => {
  const imageUrl = 'data:image/png;base64,iVBORw0KGgo=';
  const productName = 'Organic Black Soap Cleanser';
  const productDescription = 'Traditional African black soap infused with honey and camwood.';
  const category = 'Beauty and skincare';

  const targetKey = buildProductVerifyKey({
    imageUrl,
    productName,
    productDescription,
    category,
  });

  // 1. Network / API error after attempting targetKey: verification is null, lastAttemptedKey === targetKey
  // Must NOT loop forever or fall back to confirmed recognition
  const afterFailureDecision = reconcileProductVerificationState({
    needsProductVerification: true,
    imageUrl,
    productName,
    productDescription,
    category,
    currentVerification: null,
    currentVerifiedKey: '',
    lastAttemptedKey: targetKey,
    isVerifying: false,
    productRecognition: null,
    recognitionConfirmed: false,
    recognizedContext: null,
  });
  assert.equal(afterFailureDecision.action, 'noop');

  // 2. While in-flight verification is running -> noop
  const inFlightDecision = reconcileProductVerificationState({
    needsProductVerification: true,
    imageUrl,
    productName,
    productDescription,
    category,
    currentVerification: null,
    currentVerifiedKey: '',
    lastAttemptedKey: targetKey,
    isVerifying: true,
    productRecognition: null,
    recognitionConfirmed: false,
    recognizedContext: null,
  });
  assert.equal(inFlightDecision.action, 'noop');

  // 3. Mismatch response stored for targetKey -> noop until inputs change
  const mismatchVerification: ProductImageVerificationResult = {
    matches: false,
    confidence: 88,
    detectedProduct: 'Leather sandals',
    detectedCategory: 'Footwear and accessories',
    mismatchReason: 'Image shows leather sandals rather than black soap.',
    suggestedAction: 'Upload the black soap product photo.',
  };
  const mismatchSteadyDecision = reconcileProductVerificationState({
    needsProductVerification: true,
    imageUrl,
    productName,
    productDescription,
    category,
    currentVerification: mismatchVerification,
    currentVerifiedKey: targetKey,
    lastAttemptedKey: targetKey,
    isVerifying: false,
  });
  assert.equal(mismatchSteadyDecision.action, 'noop');

  // 4. After failure/mismatch, updating product description triggers a fresh verification check
  const retryOnEditDecision = reconcileProductVerificationState({
    needsProductVerification: true,
    imageUrl,
    productName: 'Handcrafted Kano Leather Sandals',
    productDescription: 'Vegetable-tanned brown leather palm sandals.',
    category: 'Footwear and accessories',
    currentVerification: null,
    currentVerifiedKey: '',
    lastAttemptedKey: targetKey,
    isVerifying: false,
  });
  assert.equal(retryOnEditDecision.action, 'invalidate-and-verify');

  // 5. Clearing photo or switching out of product verification clears verification state
  const clearOnServiceMode = reconcileProductVerificationState({
    needsProductVerification: false,
    imageUrl,
    productName,
    productDescription,
    category,
    currentVerification: mismatchVerification,
    currentVerifiedKey: targetKey,
    lastAttemptedKey: targetKey,
    isVerifying: false,
  });
  assert.equal(clearOnServiceMode.action, 'clear');
});

test('App.tsx and SocialFlyerStudio.tsx wire confirmed recognition safely while keeping server protections intact', () => {
  const root = process.cwd();
  const appSrc = fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf8');
  const flyerSrc = fs.readFileSync(path.join(root, 'src/components/SocialFlyerStudio.tsx'), 'utf8');
  const serverSrc = fs.readFileSync(path.join(root, 'server.ts'), 'utf8');

  // App tracks provenance and passes it into SocialFlyerStudio
  assert.match(appSrc, /recognizedContext/);
  assert.match(appSrc, /productRecognition=\{productRecognition\}/);
  assert.match(appSrc, /recognitionConfirmed=\{recognitionConfirmed\}/);
  assert.match(appSrc, /recognizedContext=\{recognizedContext\}/);
  assert.match(appSrc, /if\s*\(newUrl\s*!==\s*currentImage\)/);

  // SocialFlyerStudio syncs verification using reconcileProductVerificationState & full dependency array
  assert.match(flyerSrc, /reconcileProductVerificationState/);
  assert.match(flyerSrc, /buildProductVerifyKey/);
  assert.match(flyerSrc, /productName,\s*\n\s*productDescription,\s*\n\s*category,/);

  // Server verification route keeps auth & text usage-limit enforcement untouched
  assert.match(serverSrc, /app\.post\('\/api\/verify-product-image',\s*\.\.\.requireAiTextAccess/);
  assert.match(serverSrc, /app\.post\('\/api\/recognize-product',\s*\.\.\.requireAiTextAccess/);
});
