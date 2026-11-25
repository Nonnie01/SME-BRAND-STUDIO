import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  BusinessType,
  ColorSwatch,
  FlyerAspectRatio,
  HybridFlyerMode,
  PhotoEnhancementPreset,
  ProductImageVerificationResult,
  ProductRecognitionResult,
  RecognizedProductContext,
  TypographyRecommendation,
} from '../types';
import {
  generateAndDownloadFlyer,
  loadCanvasImage,
  triggerDataUrlDownload,
} from '../utils/canvasExport';
import { GeneratedPromoImage } from '../utils/brandExport';
import { postJsonApi, getFriendlyErrorMessage } from '../utils/apiClient';
import {
  buildProductVerifyKey,
  reconcileProductVerificationState,
} from '../utils/productVerification';
import {
  buildMockupSpec,
  MockupLabelFinish,
  MockupPackagingStyle,
  renderBrandedProductMockup,
  resolvePackagingStyle,
} from '../utils/productMockup';
import {
  Download,
  Sparkles,
  Image as ImageIcon,
  Sliders,
  Check,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Upload,
  Wand2,
  Loader2,
  Camera,
  Layers,
  CheckCircle2,
  Phone,
  Maximize2,
  Package,
} from 'lucide-react';

interface SocialFlyerStudioProps {
  businessType: BusinessType;
  brandName: string;
  tagline: string;
  productName: string;
  productDescription: string;
  category: string;
  price: string;
  serviceName?: string;
  serviceDescription?: string;
  serviceCategory?: string;
  servicePrice?: string;
  serviceDeliveryMethod?: string;
  businessLocation?: string;
  palette: ColorSwatch[];
  imageUrl: string | null;
  serviceImageUrl?: string | null;
  selectedBadge: string;
  productRecognition?: ProductRecognitionResult | null;
  recognitionConfirmed?: boolean;
  recognizedContext?: RecognizedProductContext | null;
  brandTone?: string;
  typographyRecommendation?: TypographyRecommendation | null;
  brandPromise?: string;
  initialMockupUrl?: string | null;
  initialUseBrandedMockup?: boolean;
  onMockupStateChange?: (state: { mockupUrl: string | null; active: boolean }) => void;
  onUpdateProductImage?: (newUrl: string | null) => void;
  onUpdateProductDetails?: (updates: { productName?: string; productDescription?: string }) => void;
  onUpdateServiceImage?: (newUrl: string | null) => void;
  onFlyerGenerated?: (image: GeneratedPromoImage) => void;
  savedPromoImages?: GeneratedPromoImage[];
}

const ENHANCEMENT_PRESETS: { id: PhotoEnhancementPreset; label: string; hint: string }[] = [
  { id: 'background-remove', label: 'Remove Background (White Studio)', hint: 'Clean isolated e-commerce cutout' },
  { id: 'studio-clean', label: 'Studio Neutral Backdrop', hint: 'Balanced commercial softbox background' },
  { id: 'lighting-clarity', label: 'Lighting & Clarity Boost', hint: 'Sharper texture & balanced colour' },
  { id: 'lifestyle-nigeria', label: 'Nigerian Tabletop Staging', hint: 'Warm timber / travertine surface' },
];

const PACKAGING_STYLE_OPTIONS: { id: MockupPackagingStyle; label: string }[] = [
  { id: 'beverage-bottles', label: 'Twin Glass Bottles' },
  { id: 'culinary-jar', label: 'Culinary Pantry Jar' },
  { id: 'skincare-vessel', label: 'Cosmetic Jar & Dropper' },
  { id: 'boutique-packaging', label: 'Boutique Box & Photo' },
  { id: 'presentation-box', label: 'Retail Studio Box' },
];

const LABEL_FINISH_OPTIONS: { id: MockupLabelFinish; label: string }[] = [
  { id: 'cream-cotton', label: 'Cream Cotton' },
  { id: 'crisp-ivory', label: 'Crisp White' },
  { id: 'brand-tint', label: 'Brand Tinted' },
  { id: 'midnight-luxe', label: 'Onyx Luxe' },
];

const ASPECT_FORMATS: { id: FlyerAspectRatio; label: string; dim: string }[] = [
  { id: '1:1', label: 'Instagram / WhatsApp Feed', dim: '1080 × 1080' },
  { id: '9:16', label: 'WhatsApp Status / IG Story', dim: '1080 × 1920' },
  { id: '16:9', label: 'Facebook / Web Landscape', dim: '1280 × 720' },
];

export const SocialFlyerStudio: React.FC<SocialFlyerStudioProps> = ({
  businessType,
  brandName,
  tagline,
  productName,
  productDescription,
  category,
  price,
  serviceName = '',
  serviceDescription = '',
  serviceCategory = '',
  servicePrice = '',
  serviceDeliveryMethod = 'hybrid',
  businessLocation = '',
  palette,
  imageUrl,
  serviceImageUrl = null,
  selectedBadge,
  productRecognition = null,
  recognitionConfirmed = false,
  recognizedContext = null,
  brandTone = '',
  typographyRecommendation = null,
  brandPromise = '',
  initialMockupUrl = null,
  initialUseBrandedMockup = false,
  onMockupStateChange,
  onUpdateProductImage,
  onUpdateProductDetails,
  onUpdateServiceImage,
  onFlyerGenerated,
  savedPromoImages = [],
}) => {
  // Hybrid campaign mode selector
  const [hybridMode, setHybridMode] = useState<HybridFlyerMode>('combined');

  // Flyer text controls (strictly user-provided — never invent price, contact, or claims)
  const [headline, setHeadline] = useState(brandName);
  const [subline, setSubline] = useState(tagline);
  const [offerTitle, setOfferTitle] = useState(
    businessType === 'service' ? serviceName || brandName : productName || brandName
  );
  const [secondaryOfferLabel, setSecondaryOfferLabel] = useState(
    businessType === 'hybrid' ? serviceName : ''
  );
  const [displayPrice, setDisplayPrice] = useState(price || '');
  const [contactInfo, setContactInfo] = useState(businessLocation || '');
  const [badgeText, setBadgeText] = useState(selectedBadge || '');
  const [ctaText, setCtaText] = useState(
    businessType === 'service' ? 'Book Consultation / Service' : 'Order via WhatsApp'
  );
  const [aspectRatio, setAspectRatio] = useState<FlyerAspectRatio>('1:1');
  const [selectedColorHex, setSelectedColorHex] = useState(palette[0]?.hex || '#0D5C3A');
  const [accentColorHex, setAccentColorHex] = useState(palette[1]?.hex || '#D97706');

  // Product photo verification state
  const [verification, setVerification] = useState<ProductImageVerificationResult | null>(null);
  const [verifiedKey, setVerifiedKey] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Inline mismatch quick-fix fields
  const [fixProductName, setFixProductName] = useState(productName);
  const [fixProductDesc, setFixProductDesc] = useState(productDescription);

  // AI Photo Enhancement ("Enhance Product Photo") state
  const [enhancePreset, setEnhancePreset] = useState<PhotoEnhancementPreset>('studio-clean');
  const [enhancedPhotoUrl, setEnhancedPhotoUrl] = useState<string | null>(null);
  const [useEnhancedPhoto, setUseEnhancedPhoto] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);

  // Separate Branded Product Packaging Mockup state (never modifies/overwrites original imageUrl)
  const [mockupPackagingStyle, setMockupPackagingStyle] = useState<MockupPackagingStyle>(() =>
    resolvePackagingStyle({ category, productName, productDescription, businessType })
  );
  const [mockupLabelFinish, setMockupLabelFinish] = useState<MockupLabelFinish>('cream-cotton');
  const [brandedMockupUrl, setBrandedMockupUrl] = useState<string | null>(initialMockupUrl);
  const [useBrandedMockup, setUseBrandedMockup] = useState<boolean>(
    !!initialMockupUrl && initialUseBrandedMockup
  );
  const [isCreatingMockup, setIsCreatingMockup] = useState(false);
  const [mockupError, setMockupError] = useState<string | null>(null);
  const [mockupActiveBrandLabel, setMockupActiveBrandLabel] = useState<string>(brandName);

  // Service Visual state (Real uploaded photo vs Explicitly Labeled Illustrative Visual)
  const [servicePhotoSource, setServicePhotoSource] = useState<'uploaded' | 'illustrative'>(
    serviceImageUrl ? 'uploaded' : 'illustrative'
  );
  const [uploadedServicePhoto, setUploadedServicePhoto] = useState<string | null>(
    serviceImageUrl || null
  );
  const [servicePhotoPermissionConfirmed, setServicePhotoPermissionConfirmed] = useState<boolean>(
    !!serviceImageUrl
  );
  const [illustrativeServiceUrl, setIllustrativeServiceUrl] = useState<string | null>(null);
  const [isGeneratingServiceVisual, setIsGeneratingServiceVisual] = useState(false);
  const [serviceVisualError, setServiceVisualError] = useState<string | null>(null);

  // Promotional Flyer generation & export state
  const [isGeneratingFlyer, setIsGeneratingFlyer] = useState(false);
  const [generatedFlyerDataUrl, setGeneratedFlyerDataUrl] = useState<string | null>(null);
  const [generatedFlyerFileName, setGeneratedFlyerFileName] = useState<string>('');
  const [flyerError, setFlyerError] = useState<string | null>(null);
  const [justSavedNotice, setJustSavedNotice] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const productFileInputRef = useRef<HTMLInputElement>(null);
  const serviceFileInputRef = useRef<HTMLInputElement>(null);
  const attemptedVerifyKeyRef = useRef<string>('');
  const prevImageUrlRef = useRef<string | null>(imageUrl);
  const lastRenderedMockupSigRef = useRef<string>('');

  const needsProductVerification =
    businessType === 'product' ||
    (businessType === 'hybrid' && (hybridMode === 'product' || hybridMode === 'combined'));

  const needsServiceVisual =
    businessType === 'service' ||
    (businessType === 'hybrid' && (hybridMode === 'service' || hybridMode === 'combined'));

  // Keep synced with parent brand/offering state when user updates brand, tab, or hybrid sub-mode
  useEffect(() => {
    setHeadline(brandName);
    setSubline(tagline);
    setFixProductName(productName);
    setFixProductDesc(productDescription);

    if (businessType === 'service') {
      setOfferTitle(serviceName || serviceCategory || brandName);
      setSecondaryOfferLabel('');
      setDisplayPrice(servicePrice || price || '');
      setCtaText('Book via WhatsApp');
    } else if (businessType === 'hybrid') {
      if (hybridMode === 'product') {
        setOfferTitle(productName || brandName);
        setSecondaryOfferLabel('');
        setDisplayPrice(price || '');
        setCtaText('Order Product on WhatsApp');
      } else if (hybridMode === 'service') {
        setOfferTitle(serviceName || serviceCategory || brandName);
        setSecondaryOfferLabel('');
        setDisplayPrice(servicePrice || '');
        setCtaText('Book Service Appointment');
      } else {
        setOfferTitle(productName || brandName);
        setSecondaryOfferLabel(serviceName || '');
        const comboPrice = [price, servicePrice].filter(Boolean).join(' • ');
        setDisplayPrice(comboPrice);
        setCtaText('Shop & Book via WhatsApp');
      }
    } else {
      setOfferTitle(productName || brandName);
      setSecondaryOfferLabel('');
      setDisplayPrice(price || '');
      setCtaText('Order via WhatsApp');
    }

    if (businessLocation && !contactInfo) {
      setContactInfo(businessLocation);
    }

    if (palette.length > 0) {
      setSelectedColorHex(palette[0].hex);
      if (palette[1]) setAccentColorHex(palette[1].hex);
    }
  }, [
    businessType,
    hybridMode,
    brandName,
    tagline,
    productName,
    productDescription,
    price,
    serviceName,
    serviceCategory,
    servicePrice,
    palette,
  ]);

  // Reset enhanced photo & mockup whenever raw product photo changes cleanly
  useEffect(() => {
    setEnhancedPhotoUrl(null);
    setUseEnhancedPhoto(false);
    setEnhanceError(null);
    setGeneratedFlyerDataUrl(null);
    if (prevImageUrlRef.current !== imageUrl) {
      prevImageUrlRef.current = imageUrl;
      setBrandedMockupUrl(null);
      setUseBrandedMockup(false);
      setMockupError(null);
      lastRenderedMockupSigRef.current = '';
      onMockupStateChange?.({ mockupUrl: null, active: false });
    }
  }, [imageUrl, onMockupStateChange]);

  // Auto-update packaging style recommendation when category/product changes
  useEffect(() => {
    setMockupPackagingStyle(
      resolvePackagingStyle({ category, productName, productDescription, businessType })
    );
  }, [category, productName, productDescription, businessType]);

  // Sync service image URL from parent if provided
  useEffect(() => {
    if (serviceImageUrl) {
      setUploadedServicePhoto(serviceImageUrl);
      setServicePhotoSource('uploaded');
      setServicePhotoPermissionConfirmed(true);
    }
  }, [serviceImageUrl]);

  const currentVerifyKey = buildProductVerifyKey({
    imageUrl,
    productName,
    productDescription,
    category,
  });
  const isVerificationCurrent = !!verification && verifiedKey === currentVerifyKey;
  const isProductVerifiedMatch =
    !needsProductVerification || (isVerificationCurrent && verification?.matches === true);

  const verifyProductImage = useCallback(
    async (
      targetImage = imageUrl,
      targetName = productName,
      targetDesc = productDescription
    ): Promise<ProductImageVerificationResult | null> => {
      if (!targetImage) {
        attemptedVerifyKeyRef.current = '';
        setVerifyError('Please upload a product photograph first.');
        setVerification(null);
        setVerifiedKey('');
        return null;
      }

      const targetKey = buildProductVerifyKey({
        imageUrl: targetImage,
        productName: targetName,
        productDescription: targetDesc,
        category,
      });
      attemptedVerifyKeyRef.current = targetKey;
      setVerification(null);
      setVerifiedKey('');
      setIsVerifying(true);
      setVerifyError(null);

      try {
        const res = await postJsonApi<{
          success: boolean;
          verification?: ProductImageVerificationResult;
        }>('/api/verify-product-image', {
          imageBase64: targetImage,
          productName: targetName,
          productDescription: targetDesc,
          category,
        });

        if (res.success && res.verification) {
          setVerification(res.verification);
          setVerifiedKey(targetKey);
          setVerifyError(null);
          return res.verification;
        }
        throw new Error('Verification returned incomplete data. Please retry.');
      } catch (err: any) {
        console.error('Product verification failed:', err);
        setVerification(null);
        setVerifiedKey('');
        setVerifyError(
          getFriendlyErrorMessage(
            err,
            'Could not verify product image match right now. Please retry.'
          )
        );
        return null;
      } finally {
        setIsVerifying(false);
      }
    },
    [imageUrl, productName, productDescription, category]
  );

  // Sync product verification with confirmed recognition or trigger fresh verification on changes
  useEffect(() => {
    const decision = reconcileProductVerificationState({
      needsProductVerification,
      imageUrl,
      productName,
      productDescription,
      category,
      currentVerification: verification,
      currentVerifiedKey: verifiedKey,
      lastAttemptedKey: attemptedVerifyKeyRef.current,
      isVerifying,
      productRecognition,
      recognitionConfirmed,
      recognizedContext,
    });

    if (decision.action === 'clear') {
      attemptedVerifyKeyRef.current = '';
      setVerification(null);
      setVerifiedKey('');
      setVerifyError(null);
    } else if (decision.action === 'reuse-confirmed') {
      attemptedVerifyKeyRef.current = decision.verifiedKey;
      setVerification(decision.verification);
      setVerifiedKey(decision.verifiedKey);
      setVerifyError(null);
    } else if (decision.action === 'invalidate-and-verify') {
      setVerification(null);
      setVerifiedKey('');
      verifyProductImage(imageUrl, productName, productDescription);
    }
  }, [
    needsProductVerification,
    imageUrl,
    productName,
    productDescription,
    category,
    verification,
    verifiedKey,
    isVerifying,
    productRecognition,
    recognitionConfirmed,
    recognizedContext,
    verifyProductImage,
  ]);

  const handleProductFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setVerifyError('Please select a PNG, JPEG, or WebP product image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      onUpdateProductImage?.(dataUrl);
      setFixProductName(productName);
      setFixProductDesc(productDescription);
      setVerification(null);
      setVerifiedKey('');
      setGeneratedFlyerDataUrl(null);
      verifyProductImage(dataUrl, productName, productDescription);
    };
    reader.readAsDataURL(file);
  };

  const handleServiceFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setServiceVisualError('Please select a PNG, JPEG, or WebP photograph of your work or premises.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setUploadedServicePhoto(dataUrl);
      setServicePhotoSource('uploaded');
      setServiceVisualError(null);
      setGeneratedFlyerDataUrl(null);
      onUpdateServiceImage?.(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Enhance Product Photo via AI
  const handleEnhanceProductPhoto = async () => {
    if (!imageUrl) {
      setEnhanceError('Please upload a product photograph first.');
      return;
    }

    // Enforce product match verification before enhancing!
    let checkResult = isVerificationCurrent ? verification : null;
    if (!checkResult) {
      checkResult = await verifyProductImage(imageUrl, productName, productDescription);
    }
    if (!checkResult || !checkResult.matches) {
      setEnhanceError(
        'Resolve the product image mismatch first before enhancing the photograph.'
      );
      return;
    }

    setIsEnhancing(true);
    setEnhanceError(null);

    try {
      const res = await postJsonApi<{
        success: boolean;
        dataUrl?: string;
        preset?: PhotoEnhancementPreset;
      }>('/api/enhance-product-photo', {
        imageBase64: imageUrl,
        productName: productName || brandName,
        preset: enhancePreset,
      });

      if (res.success && res.dataUrl && res.dataUrl.startsWith('data:image/')) {
        setEnhancedPhotoUrl(res.dataUrl);
        setUseEnhancedPhoto(true);
        setUseBrandedMockup(false);
        setGeneratedFlyerDataUrl(null);
        onMockupStateChange?.({ mockupUrl: brandedMockupUrl, active: false });

        const slug = (brandName || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const enhancedFile = `${slug}-enhanced-${enhancePreset}.png`;
        if (onFlyerGenerated) {
          onFlyerGenerated({ fileName: enhancedFile, dataUrl: res.dataUrl });
          setJustSavedNotice(`Enhanced product photo saved to Brand Kit as ${enhancedFile}`);
          setTimeout(() => setJustSavedNotice(null), 3500);
        }
      } else {
        throw new Error('Enhancement returned no image. Original verified photo kept.');
      }
    } catch (err: any) {
      console.error('Photo enhancement error:', err);
      setEnhanceError(
        getFriendlyErrorMessage(
          err,
          'Could not enhance photo right now. Your verified original photo has been preserved.'
        )
      );
    } finally {
      setIsEnhancing(false);
    }
  };

  // Generate Illustrative AI Service Visual
  const handleGenerateServiceVisual = async () => {
    setIsGeneratingServiceVisual(true);
    setServiceVisualError(null);

    try {
      const res = await postJsonApi<{
        success: boolean;
        dataUrl?: string;
        isIllustrative?: boolean;
      }>('/api/generate-service-visual', {
        brandName: headline || brandName,
        serviceCategory: serviceCategory || category,
        serviceName: serviceName || offerTitle,
        serviceDescription: serviceDescription || productDescription,
        deliveryMethod: serviceDeliveryMethod,
        primaryColor: selectedColorHex,
        accentColor: accentColorHex,
        aspectRatio,
      });

      if (res.success && res.dataUrl && res.dataUrl.startsWith('data:image/')) {
        setIllustrativeServiceUrl(res.dataUrl);
        setServicePhotoSource('illustrative');
        setGeneratedFlyerDataUrl(null);

        const slug = (brandName || 'service').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const visualFile = `${slug}-illustrative-service-visual.png`;
        if (onFlyerGenerated) {
          onFlyerGenerated({ fileName: visualFile, dataUrl: res.dataUrl });
          setJustSavedNotice(`Illustrative service visual saved to Brand Kit (${visualFile})`);
          setTimeout(() => setJustSavedNotice(null), 3500);
        }
      } else {
        throw new Error('Service visual generator returned an empty image.');
      }
    } catch (err: any) {
      console.error('Service visual generation error:', err);
      setServiceVisualError(
        getFriendlyErrorMessage(
          err,
          'Could not generate an illustrative service visual right now. You can upload an actual photo of your work instead.'
        )
      );
    } finally {
      setIsGeneratingServiceVisual(false);
    }
  };

  // Create Branded Product Packaging Mockup (strict verification gate; never overwrites original imageUrl)
  const buildEffectiveMockupPalette = useCallback((): ColorSwatch[] => {
    const base = [...palette];
    if (selectedColorHex && (!base[0] || base[0].hex !== selectedColorHex)) {
      base[0] = {
        name: 'Flyer Primary',
        hex: selectedColorHex,
        role: 'Primary brand colour',
        psychologicalReason: '',
        marketingReason: '',
      };
    }
    if (accentColorHex) {
      const accentIdx = base.findIndex((s) => (s.role || '').toLowerCase().includes('accent'));
      const targetIdx = accentIdx >= 0 ? accentIdx : 1;
      base[targetIdx] = {
        name: base[targetIdx]?.name || 'Flyer Accent',
        hex: accentColorHex,
        role: 'Accent colour',
        psychologicalReason: '',
        marketingReason: '',
      };
    }
    return base;
  }, [palette, selectedColorHex, accentColorHex]);

  const handleCreateBrandedMockup = async (
    overrideStyle?: MockupPackagingStyle,
    overrideFinish?: MockupLabelFinish,
    preserveNotice = false
  ) => {
    if (!imageUrl) {
      setMockupError('Upload and verify a product photograph before creating a branded mockup.');
      return;
    }

    let checkResult = isVerificationCurrent ? verification : null;
    if (!checkResult) {
      checkResult = await verifyProductImage(imageUrl, productName, productDescription);
    }
    if (!checkResult || !checkResult.matches) {
      setMockupError(
        'Resolve product image verification first before creating a branded product mockup.'
      );
      return;
    }

    const activeName = (headline || brandName || '').trim() || 'YOUR BRAND';
    const targetStyle = overrideStyle || mockupPackagingStyle;
    const targetFinish = overrideFinish || mockupLabelFinish;

    setIsCreatingMockup(true);
    setMockupError(null);

    try {
      const { dataUrl, spec } = await renderBrandedProductMockup({
        brandName: activeName,
        tagline: subline || tagline,
        productName: offerTitle || productName || activeName,
        productDescription,
        category,
        businessType,
        price: displayPrice || price,
        palette: buildEffectiveMockupPalette(),
        brandTone,
        typographyRecommendation,
        brandPromise,
        packagingStyle: targetStyle,
        labelFinish: targetFinish,
        productImageUrl: imageUrl,
      });

      lastRenderedMockupSigRef.current = spec.signature;
      setBrandedMockupUrl(dataUrl);
      setMockupActiveBrandLabel(spec.brandName);
      setUseBrandedMockup(true);
      setUseEnhancedPhoto(false);
      setGeneratedFlyerDataUrl(null);
      onMockupStateChange?.({ mockupUrl: dataUrl, active: true });

      const slug = (activeName || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const mockupFile = `${slug}-branded-mockup.png`;
      if (onFlyerGenerated && !preserveNotice) {
        onFlyerGenerated({ fileName: mockupFile, dataUrl });
        setJustSavedNotice(
          `Branded product mockup for "${spec.brandName}" created & saved to Brand Kit (${mockupFile})`
        );
        setTimeout(() => setJustSavedNotice(null), 3500);
      }
    } catch (err: any) {
      console.error('Branded mockup creation error:', err);
      setMockupError(
        err?.message || 'Could not render branded product mockup right now. Your original photo is preserved.'
      );
    } finally {
      setIsCreatingMockup(false);
    }
  };

  // Automatically keep an existing Branded Product Mockup in sync if user switches active brand name or colours
  useEffect(() => {
    if (!brandedMockupUrl || !imageUrl || !isProductVerifiedMatch) return;
    const activeName = (headline || brandName || '').trim() || 'YOUR BRAND';
    const mockupInput = {
      brandName: activeName,
      tagline: subline || tagline,
      productName: offerTitle || productName || activeName,
      productDescription,
      category,
      businessType,
      price: displayPrice || price,
      palette: buildEffectiveMockupPalette(),
      brandTone,
      typographyRecommendation,
      brandPromise,
      packagingStyle: mockupPackagingStyle,
      labelFinish: mockupLabelFinish,
      productImageUrl: imageUrl,
    };
    const nextSpec = buildMockupSpec(mockupInput);
    if (lastRenderedMockupSigRef.current === nextSpec.signature) return;

    let cancelled = false;
    renderBrandedProductMockup(mockupInput)
      .then(({ dataUrl, spec }) => {
        if (cancelled) return;
        lastRenderedMockupSigRef.current = spec.signature;
        setBrandedMockupUrl(dataUrl);
        setMockupActiveBrandLabel(spec.brandName);
        setGeneratedFlyerDataUrl(null);
        onMockupStateChange?.({ mockupUrl: dataUrl, active: useBrandedMockup });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [
    brandedMockupUrl,
    imageUrl,
    isProductVerifiedMatch,
    headline,
    brandName,
    subline,
    tagline,
    offerTitle,
    productName,
    productDescription,
    category,
    businessType,
    displayPrice,
    price,
    brandTone,
    typographyRecommendation,
    brandPromise,
    mockupPackagingStyle,
    mockupLabelFinish,
    selectedColorHex,
    accentColorHex,
    useBrandedMockup,
    buildEffectiveMockupPalette,
    onMockupStateChange,
  ]);

  // Determine active images for live preview & canvas composition
  const activeProductPhoto =
    useBrandedMockup && brandedMockupUrl
      ? brandedMockupUrl
      : useEnhancedPhoto && enhancedPhotoUrl
      ? enhancedPhotoUrl
      : imageUrl;
  const activeServicePhoto =
    servicePhotoSource === 'uploaded' && uploadedServicePhoto
      ? uploadedServicePhoto
      : illustrativeServiceUrl;
  const isUsingIllustrativeServiceVisual =
    needsServiceVisual &&
    servicePhotoSource === 'illustrative' &&
    !!illustrativeServiceUrl;

  const isFlyerBlockedByProductMismatch =
    needsProductVerification &&
    (!imageUrl || !isVerificationCurrent || verification?.matches === false);

  const isFlyerBlockedByMissingServiceVisual =
    needsServiceVisual &&
    ((servicePhotoSource === 'uploaded' && (!uploadedServicePhoto || !servicePhotoPermissionConfirmed)) ||
      (servicePhotoSource === 'illustrative' && !illustrativeServiceUrl));

  // Real Promotional Flyer Generation (strict verification gate + pixel-accurate verified photo placement)
  const handleGenerateFlyer = async (downloadImmediately = false) => {
    if (!canvasRef.current) return;
    setFlyerError(null);

    // 1. Enforce Product Verification Gate
    if (needsProductVerification) {
      if (!imageUrl) {
        setFlyerError('Upload a verified product photograph before generating a product flyer.');
        return;
      }
      let check = isVerificationCurrent ? verification : null;
      if (!check) {
        check = await verifyProductImage(imageUrl, productName, productDescription);
      }
      if (!check || !check.matches) {
        setFlyerError(
          check?.mismatchReason ||
            'Promotional flyer blocked: the uploaded photograph does not match the advertised product. Upload the matching photo or update your product details.'
        );
        return;
      }
    }

    // 2. Enforce Service Visual Honesty Gate
    if (needsServiceVisual) {
      if (servicePhotoSource === 'uploaded') {
        if (!uploadedServicePhoto) {
          setFlyerError('Upload a real work/premises photo or switch to "Illustrative AI Service Visual".');
          return;
        }
        if (!servicePhotoPermissionConfirmed) {
          setFlyerError('Confirm permission to use the uploaded service/work photograph before generating your flyer.');
          return;
        }
      } else if (!illustrativeServiceUrl) {
        setFlyerError('Click "Generate Illustrative Service Visual" or upload a real work/premises photo first.');
        return;
      }
    }

    setIsGeneratingFlyer(true);
    try {
      let primarySrc: string | null = null;
      let secondarySrc: string | null = null;

      if (businessType === 'product' || (businessType === 'hybrid' && hybridMode === 'product')) {
        primarySrc = activeProductPhoto;
      } else if (businessType === 'service' || (businessType === 'hybrid' && hybridMode === 'service')) {
        primarySrc = activeServicePhoto;
      } else {
        // Hybrid combined campaign: show BOTH product and service visuals!
        primarySrc = activeProductPhoto;
        secondarySrc = activeServicePhoto;
      }

      const primaryImg = primarySrc ? await loadCanvasImage(primarySrc) : null;
      const secondaryImg = secondarySrc ? await loadCanvasImage(secondarySrc) : null;

      if (!primaryImg) {
        throw new Error('Could not load the verified image onto the flyer canvas. Please re-upload as PNG or JPEG.');
      }

      const slug = (brandName || 'sme-brand').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const suffix =
        businessType === 'hybrid'
          ? `${hybridMode}-flyer-${aspectRatio.replace(':', 'x')}`
          : businessType === 'service'
          ? `service-flyer-${aspectRatio.replace(':', 'x')}`
          : `product-flyer-${aspectRatio.replace(':', 'x')}`;
      const fileName = `${slug}-${suffix}.png`;

      const dataUrl = await generateAndDownloadFlyer(
        canvasRef.current,
        {
          brandName: headline || brandName,
          tagline: subline,
          productName: offerTitle,
          price: displayPrice,
          contactInfo,
          primaryColor: selectedColorHex,
          accentColor: accentColorHex,
          badgeText,
          callToAction: ctaText,
          aspectRatio,
          imageElement: primaryImg,
          secondaryImageElement: secondaryImg,
          secondaryLabel:
            businessType === 'hybrid' && hybridMode === 'combined' ? secondaryOfferLabel : undefined,
          isIllustrativeVisual: isUsingIllustrativeServiceVisual,
        },
        fileName,
        !downloadImmediately
      );

      setGeneratedFlyerDataUrl(dataUrl);
      setGeneratedFlyerFileName(fileName);

      if (onFlyerGenerated) {
        onFlyerGenerated({ fileName, dataUrl });
        setJustSavedNotice(`Promotional flyer "${fileName}" generated & saved to Brand Kit!`);
        setTimeout(() => setJustSavedNotice(null), 3500);
      }
    } catch (err: any) {
      console.error('Flyer generation failed:', err);
      setFlyerError(
        err?.message || 'Could not generate promotional flyer image. Please try again.'
      );
    } finally {
      setIsGeneratingFlyer(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            Verified Product & Service Visual Studio
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Verify photo-to-product accuracy, enhance product photography, or generate cohesive Instagram, Facebook & WhatsApp promotional flyers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleGenerateFlyer(false)}
            disabled={
              isGeneratingFlyer ||
              isVerifying ||
              isFlyerBlockedByProductMismatch ||
              isFlyerBlockedByMissingServiceVisual
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-300 disabled:text-stone-500 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
          >
            {isGeneratingFlyer ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            <span>
              {isGeneratingFlyer ? 'Generating Flyer...' : 'Generate Promotional Flyer'}
            </span>
          </button>

          {generatedFlyerDataUrl && (
            <button
              type="button"
              onClick={() =>
                triggerDataUrlDownload(
                  generatedFlyerDataUrl,
                  generatedFlyerFileName || 'promotional-flyer.png'
                )
              }
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-emerald-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Flyer (PNG)</span>
            </button>
          )}
        </div>
      </div>

      {/* Saved feedback notice */}
      {justSavedNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{justSavedNotice}</span>
        </div>
      )}

      {/* Hybrid Mode Campaign Switcher */}
      {businessType === 'hybrid' && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
              Hybrid Campaign Visual Mode
            </span>
            <p className="text-xs text-stone-600">
              Create individual product flyers, service flyers, or combined dual-offer campaign flyers under {brandName}.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: 'product', label: 'Product Flyer' },
                { id: 'service', label: 'Service Flyer' },
                { id: 'combined', label: 'Combined Campaign' },
              ] as { id: HybridFlyerMode; label: string }[]
            ).map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  setHybridMode(mode.id);
                  setGeneratedFlyerDataUrl(null);
                  setFlyerError(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  hybridMode === mode.id
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hidden File Inputs for quick replacement/upload */}
      <input
        ref={productFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleProductFileUpload(e.target.files[0]);
        }}
      />
      <input
        ref={serviceFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleServiceFileUpload(e.target.files[0]);
        }}
      />

      {/* =========================================================
          1. PRODUCT IMAGE VERIFICATION & ENHANCEMENT WORKSPACE
          ========================================================= */}
      {needsProductVerification && (
        <div className="space-y-4">
          {/* Verification Status Banner */}
          {!imageUrl ? (
            <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-950">Product Photograph Required</h4>
                  <p className="text-xs text-amber-900 mt-0.5">
                    Upload the real photograph of "{productName || 'your product'}" to verify accuracy and generate a promotional flyer.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => productFileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Product Photo</span>
              </button>
            </div>
          ) : isVerifying ? (
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-3 text-xs font-semibold text-stone-700">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
              <span>
                Verifying that the uploaded photo visually matches "{productName || productDescription}"...
              </span>
            </div>
          ) : verifyError ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-900">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{verifyError}</span>
              </div>
              <button
                type="button"
                onClick={() => verifyProductImage(imageUrl, productName, productDescription)}
                className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold inline-flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Verification</span>
              </button>
            </div>
          ) : isVerificationCurrent && verification?.matches ? (
            <div className="p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-emerald-950 flex items-center gap-2 flex-wrap">
                    <span>Verified Product Match ({verification.confidence}% confidence)</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 text-[10px]">
                      {verification.detectedCategory}
                    </span>
                  </div>
                  <p className="text-emerald-900 mt-0.5">
                    Detected in photo: <strong>{verification.detectedProduct}</strong> — approved as primary visual reference.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => productFileInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-900 text-[11px] font-bold hover:bg-emerald-100 cursor-pointer"
                >
                  Replace Photo
                </button>
                <button
                  type="button"
                  onClick={() => verifyProductImage(imageUrl, productName, productDescription)}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-700 text-white text-[11px] font-bold hover:bg-emerald-800 cursor-pointer"
                >
                  Re-Verify
                </button>
              </div>
            </div>
          ) : verification && !verification.matches ? (
            /* MISMATCH WARNING + BLOCKED FLYER GUARDRAIL */
            <div className="p-4 sm:p-5 rounded-xl bg-rose-50 border-2 border-rose-300 space-y-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-extrabold text-rose-950">
                      Product Image Mismatch — Flyer Generation Blocked
                    </h4>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-200 text-rose-900">
                      Photo Does Not Match Description
                    </span>
                  </div>
                  <p className="text-xs text-rose-900 leading-relaxed">
                    <strong>Detected in photo:</strong> {verification.detectedProduct} ({verification.detectedCategory}).{' '}
                    {verification.mismatchReason}
                  </p>
                  <p className="text-xs text-rose-800 font-semibold">
                    {verification.suggestedAction}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-3.5 border border-rose-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-stone-800">
                    Option 1: Upload the matching photograph
                  </span>
                  <button
                    type="button"
                    onClick={() => productFileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Correct Product Photo</span>
                  </button>
                </div>

                <div className="border-t border-stone-200 pt-3 space-y-2">
                  <span className="text-xs font-bold text-stone-800 block">
                    Option 2: Or update your product title & description to match this photo
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={fixProductName}
                      onChange={(e) => setFixProductName(e.target.value)}
                      placeholder="Correct product name"
                      className="px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                    />
                    <input
                      type="text"
                      value={fixProductDesc}
                      onChange={(e) => setFixProductDesc(e.target.value)}
                      placeholder="Short matching product description"
                      className="px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateProductDetails?.({
                        productName: fixProductName,
                        productDescription: fixProductDesc,
                      });
                      setOfferTitle(fixProductName || brandName);
                      verifyProductImage(imageUrl, fixProductName, fixProductDesc);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Save Details & Re-Verify Match</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-amber-950">
                Product details updated — verify image match before generating your promotional flyer.
              </span>
              <button
                type="button"
                onClick={() => verifyProductImage(imageUrl, productName, productDescription)}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
              >
                Verify Product Image
              </button>
            </div>
          )}

          {/* Separate Branded Product Mockup Studio (adds active brand label onto packaging without modifying original photo) */}
          {imageUrl && isProductVerifiedMatch && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-emerald-700" />
                    Branded Product Packaging Mockup
                  </h4>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Creates a separate packaging visual displaying{' '}
                    <strong className="text-stone-900">{headline || brandName}</strong> in your brand
                    colours and typography. Your original sample photograph stays preserved.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCreateBrandedMockup()}
                  disabled={isCreatingMockup}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                >
                  {isCreatingMockup ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Package className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isCreatingMockup ? 'Creating Mockup...' : 'Create Branded Product Mockup'}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1.5">
                    Packaging Format
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PACKAGING_STYLE_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setMockupPackagingStyle(opt.id);
                          if (brandedMockupUrl) {
                            handleCreateBrandedMockup(opt.id, mockupLabelFinish, true);
                          }
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                          mockupPackagingStyle === opt.id
                            ? 'bg-emerald-800 border-emerald-800 text-white'
                            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1.5">
                    Label Stock & Contrast Finish
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {LABEL_FINISH_OPTIONS.map((fin) => (
                      <button
                        key={fin.id}
                        type="button"
                        onClick={() => {
                          setMockupLabelFinish(fin.id);
                          if (brandedMockupUrl) {
                            handleCreateBrandedMockup(mockupPackagingStyle, fin.id, true);
                          }
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                          mockupLabelFinish === fin.id
                            ? 'bg-stone-900 border-stone-900 text-white'
                            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {fin.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {mockupError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{mockupError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMockupError(null)}
                    className="text-[11px] font-bold text-rose-800 hover:underline cursor-pointer shrink-0"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {brandedMockupUrl && (
                <div className="bg-white rounded-xl border border-emerald-200 p-3.5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-stone-900">
                      Original Photo vs Branded Mockup ({mockupActiveBrandLabel || headline || brandName})
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setUseBrandedMockup(false);
                          setGeneratedFlyerDataUrl(null);
                          onMockupStateChange?.({ mockupUrl: brandedMockupUrl, active: false });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer whitespace-nowrap ${
                          !useBrandedMockup && !useEnhancedPhoto
                            ? 'bg-stone-900 text-white'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        Use Original Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUseBrandedMockup(true);
                          setUseEnhancedPhoto(false);
                          setGeneratedFlyerDataUrl(null);
                          onMockupStateChange?.({ mockupUrl: brandedMockupUrl, active: true });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer whitespace-nowrap ${
                          useBrandedMockup
                            ? 'bg-emerald-800 text-white'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        Use Branded Mockup in Flyer
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const slug = (headline || brandName || 'product')
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-');
                          triggerDataUrlDownload(brandedMockupUrl, `${slug}-branded-mockup.png`);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download Mockup PNG</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      className={`rounded-xl p-2.5 border text-center ${
                        !useBrandedMockup && !useEnhancedPhoto
                          ? 'border-stone-800 bg-stone-50'
                          : 'border-stone-200'
                      }`}
                    >
                      <div className="text-[11px] font-bold text-stone-600 mb-1.5">
                        Original Verified Photo (Preserved)
                      </div>
                      <img
                        src={imageUrl}
                        alt="Original product photo"
                        referrerPolicy="no-referrer"
                        className="w-full h-44 object-contain rounded-lg bg-stone-100 mx-auto"
                      />
                    </div>
                    <div
                      className={`rounded-xl p-2.5 border text-center ${
                        useBrandedMockup ? 'border-emerald-600 bg-emerald-50/40' : 'border-stone-200'
                      }`}
                    >
                      <div className="text-[11px] font-bold text-emerald-900 mb-1.5">
                        Branded Packaging Mockup
                      </div>
                      <img
                        src={brandedMockupUrl}
                        alt={`Branded mockup for ${mockupActiveBrandLabel || headline || brandName}`}
                        className="w-full h-44 object-contain rounded-lg bg-stone-100 mx-auto"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Product Photo Enhancement Studio ("Enhance Product Photo") */}
          {imageUrl && isProductVerifiedMatch && (
            <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-700" />
                    Enhance Product Photo (Studio Lighting & Background Cleanup)
                  </h4>
                  <p className="text-xs text-stone-500">
                    Preserves your exact product’s shape, pattern, colour, and labels while upgrading background & clarity.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleEnhanceProductPhoto}
                  disabled={isEnhancing}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
                >
                  {isEnhancing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>{isEnhancing ? 'Enhancing Photo...' : 'Enhance Product Photo'}</span>
                </button>
              </div>

              {/* Enhancement Presets */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {ENHANCEMENT_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setEnhancePreset(p.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      enhancePreset === p.id
                        ? 'bg-emerald-50 border-emerald-600 ring-1 ring-emerald-500'
                        : 'bg-white border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <div className="text-xs font-bold text-stone-900">{p.label}</div>
                    <div className="text-[10px] text-stone-500 mt-0.5">{p.hint}</div>
                  </button>
                ))}
              </div>

              {enhanceError && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{enhanceError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnhanceError(null)}
                    className="text-[11px] font-bold text-amber-800 hover:underline cursor-pointer shrink-0"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Before / After Comparison when Enhanced Photo exists */}
              {enhancedPhotoUrl && (
                <div className="bg-white rounded-xl border border-emerald-200 p-3.5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-emerald-900">
                      Original vs Enhanced Comparison
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setUseEnhancedPhoto(false);
                          setUseBrandedMockup(false);
                          setGeneratedFlyerDataUrl(null);
                          onMockupStateChange?.({ mockupUrl: brandedMockupUrl, active: false });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                          !useEnhancedPhoto && !useBrandedMockup
                            ? 'bg-stone-900 text-white'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        Use Original Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUseEnhancedPhoto(true);
                          setUseBrandedMockup(false);
                          setGeneratedFlyerDataUrl(null);
                          onMockupStateChange?.({ mockupUrl: brandedMockupUrl, active: false });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                          useEnhancedPhoto && !useBrandedMockup
                            ? 'bg-emerald-700 text-white'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        Use Enhanced Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const slug = (brandName || 'product')
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-');
                          triggerDataUrlDownload(
                            enhancedPhotoUrl,
                            `${slug}-enhanced-${enhancePreset}.png`
                          );
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download Enhanced PNG</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className={`rounded-xl p-2 border text-center ${
                        !useEnhancedPhoto ? 'border-stone-800 bg-stone-50' : 'border-stone-200'
                      }`}
                    >
                      <div className="text-[11px] font-bold text-stone-600 mb-1.5">
                        Original Verified Photo
                      </div>
                      <img
                        src={imageUrl}
                        alt="Original product"
                        className="w-full h-40 object-contain rounded-lg bg-stone-100 mx-auto"
                      />
                    </div>
                    <div
                      className={`rounded-xl p-2 border text-center ${
                        useEnhancedPhoto ? 'border-emerald-600 bg-emerald-50/40' : 'border-stone-200'
                      }`}
                    >
                      <div className="text-[11px] font-bold text-emerald-800 mb-1.5">
                        Enhanced Studio Photo
                      </div>
                      <img
                        src={enhancedPhotoUrl}
                        alt="Enhanced product"
                        className="w-full h-40 object-contain rounded-lg bg-white mx-auto"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          2. SERVICE-BASED BUSINESS VISUAL SOURCE (REAL VS ILLUSTRATIVE)
          ========================================================= */}
      {needsServiceVisual && (
        <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-teal-700" />
                Service Visual Source
              </h4>
              <p className="text-xs text-stone-600">
                Use an actual photo of your work/premises/team, or generate a clearly labeled illustrative visual.
              </p>
            </div>

            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setServicePhotoSource('uploaded');
                  setGeneratedFlyerDataUrl(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  servicePhotoSource === 'uploaded'
                    ? 'bg-teal-800 text-white'
                    : 'bg-white text-stone-700 border border-stone-200'
                }`}
              >
                Actual Business Photo
              </button>
              <button
                type="button"
                onClick={() => {
                  setServicePhotoSource('illustrative');
                  setGeneratedFlyerDataUrl(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  servicePhotoSource === 'illustrative'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-stone-700 border border-stone-200'
                }`}
              >
                Illustrative AI Visual
              </button>
            </div>
          </div>

          {servicePhotoSource === 'uploaded' ? (
            <div className="bg-white rounded-xl p-3.5 border border-stone-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {uploadedServicePhoto ? (
                    <img
                      src={uploadedServicePhoto}
                      alt="Uploaded business visual"
                      className="w-16 h-16 rounded-lg object-cover border border-stone-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-stone-100 border border-dashed border-stone-300 flex items-center justify-center text-stone-400">
                      <Camera className="w-6 h-6" />
                    </div>
                  )}
                  <div className="text-xs">
                    <div className="font-bold text-stone-900">
                      {uploadedServicePhoto ? 'Real Business / Work Photo Ready' : 'No Real Work Photo Uploaded Yet'}
                    </div>
                    <p className="text-stone-500">
                      Upload photos of finished work, your studio/premises, or team in action.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => serviceFileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadedServicePhoto ? 'Change Work Photo' : 'Upload Work / Premises Photo'}</span>
                </button>
              </div>

              {uploadedServicePhoto && (
                <label className="flex items-center gap-2 text-xs text-stone-700 bg-stone-50 p-2.5 rounded-lg border border-stone-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={servicePhotoPermissionConfirmed}
                    onChange={(e) => setServicePhotoPermissionConfirmed(e.target.checked)}
                    className="rounded border-stone-300 text-teal-700"
                  />
                  <span>
                    I confirm this photograph represents our actual work, premises, or staff and I have permission to publish it.
                  </span>
                </label>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-3.5 border border-amber-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs space-y-0.5">
                  <div className="font-bold text-stone-900 flex items-center gap-2">
                    <span>AI Illustrative Service Scene</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                      Illustrative Visual (Not Actual Business Photo)
                    </span>
                  </div>
                  <p className="text-stone-500">
                    Generates a clean illustrative visual representing {serviceCategory || category} without inventing diplomas, staff claims, or fake results.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleGenerateServiceVisual}
                    disabled={isGeneratingServiceVisual}
                    className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingServiceVisual ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Wand2 className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {isGeneratingServiceVisual
                        ? 'Generating Visual...'
                        : illustrativeServiceUrl
                        ? 'Regenerate Illustrative Visual'
                        : 'Generate Illustrative Visual'}
                    </span>
                  </button>

                  {illustrativeServiceUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        const slug = (brandName || 'service')
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-');
                        triggerDataUrlDownload(
                          illustrativeServiceUrl,
                          `${slug}-illustrative-service-visual.png`
                        );
                      }}
                      className="px-2.5 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PNG</span>
                    </button>
                  )}
                </div>
              </div>

              {serviceVisualError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{serviceVisualError}</span>
                </div>
              )}

              {illustrativeServiceUrl && (
                <div className="flex items-center gap-3 pt-1">
                  <img
                    src={illustrativeServiceUrl}
                    alt="Illustrative service scene"
                    className="w-24 h-24 rounded-lg object-cover border border-amber-300"
                  />
                  <div className="text-[11px] text-amber-900">
                    <strong>Labeled on flyer:</strong> "Illustrative Service Visual (Not Actual Business Photo)" so prospective clients are never misled.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {flyerError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{flyerError}</span>
          </div>
          <button
            type="button"
            onClick={() => setFlyerError(null)}
            className="text-[11px] font-bold text-rose-700 hover:underline self-end sm:self-auto cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* =========================================================
          3. LIVE FLYER PREVIEW + GENERATED PNG + CONTROLS
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Flyer Canvas Preview & Export */}
        <div className="lg:col-span-6 flex flex-col items-center space-y-3">
          {generatedFlyerDataUrl ? (
            <div className="w-full flex flex-col items-center space-y-2.5">
              <div className="w-full max-w-[440px] rounded-2xl overflow-hidden shadow-2xl border border-stone-200 bg-stone-900">
                <img
                  src={generatedFlyerDataUrl}
                  alt="Generated Promotional Flyer"
                  className="w-full h-auto block"
                />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  Rendered PNG Ready ({aspectRatio})
                </span>
                <button
                  type="button"
                  onClick={() =>
                    triggerDataUrlDownload(
                      generatedFlyerDataUrl,
                      generatedFlyerFileName || 'promotional-flyer.png'
                    )
                  }
                  className="text-xs font-bold text-emerald-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PNG
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`w-full rounded-2xl overflow-hidden shadow-2xl relative p-6 flex flex-col justify-between text-center select-none ${
                aspectRatio === '9:16'
                  ? 'max-w-[300px] aspect-[9/16]'
                  : aspectRatio === '16:9'
                  ? 'max-w-[460px] aspect-video text-left'
                  : 'max-w-[420px] aspect-square'
              }`}
              style={{
                background: `linear-gradient(145deg, #0f172a 0%, ${selectedColorHex} 45%, #090d16 100%)`,
              }}
            >
              {/* Header */}
              <div className="relative z-10">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-wider uppercase font-display">
                  {headline}
                </h2>
                {subline && (
                  <p className="text-xs text-stone-200 font-medium italic mt-0.5 line-clamp-1">
                    {subline}
                  </p>
                )}
              </div>

              {/* Center Photo */}
              <div className="relative z-10 my-auto flex flex-col items-center">
                {businessType === 'hybrid' && hybridMode === 'combined' ? (
                  <div className="grid grid-cols-2 gap-2.5 w-full max-w-[330px]">
                    <div className="aspect-square rounded-xl overflow-hidden bg-stone-950/60 border border-white/20 flex items-center justify-center p-1.5">
                      {activeProductPhoto && isProductVerifiedMatch ? (
                        <img
                          src={activeProductPhoto}
                          alt={offerTitle}
                          className="max-h-full max-w-full object-contain rounded-lg"
                        />
                      ) : (
                        <span className="text-[10px] text-stone-400">Verified Product Photo</span>
                      )}
                    </div>
                    <div className="aspect-square rounded-xl overflow-hidden bg-stone-950/60 border border-white/20 flex items-center justify-center p-1.5">
                      {activeServicePhoto ? (
                        <img
                          src={activeServicePhoto}
                          alt={secondaryOfferLabel || 'Service visual'}
                          className="max-h-full max-w-full object-contain rounded-lg"
                        />
                      ) : (
                        <span className="text-[10px] text-stone-400">Service Visual</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden shadow-xl bg-stone-950/50 border border-white/20 flex items-center justify-center p-2">
                    {businessType === 'service' ||
                    (businessType === 'hybrid' && hybridMode === 'service') ? (
                      activeServicePhoto ? (
                        <img
                          src={activeServicePhoto}
                          alt={offerTitle}
                          className="max-h-full max-w-full object-contain rounded-xl"
                        />
                      ) : (
                        <div className="text-stone-400 text-xs flex flex-col items-center">
                          <ImageIcon className="w-7 h-7 mb-1 text-stone-500" />
                          <span>Add or generate service visual</span>
                        </div>
                      )
                    ) : activeProductPhoto && isProductVerifiedMatch ? (
                      <img
                        src={activeProductPhoto}
                        alt={offerTitle}
                        className="max-h-full max-w-full object-contain rounded-xl"
                      />
                    ) : (
                      <div className="text-amber-300 text-xs flex flex-col items-center px-2">
                        <ShieldAlert className="w-7 h-7 mb-1 text-amber-400" />
                        <span>
                          {imageUrl
                            ? 'Resolve image verification to preview product flyer'
                            : 'Upload matching product photo'}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {badgeText && (
                  <div
                    className="mt-2 text-[10px] font-bold text-white px-3 py-0.5 rounded-full shadow-md uppercase tracking-wider line-clamp-1"
                    style={{ backgroundColor: accentColorHex }}
                  >
                    {badgeText}
                  </div>
                )}
              </div>

              {/* Bottom Details */}
              <div className="relative z-10 space-y-1.5">
                <h3 className="text-sm font-bold text-white line-clamp-1">{offerTitle}</h3>
                {secondaryOfferLabel && businessType === 'hybrid' && hybridMode === 'combined' && (
                  <p className="text-xs text-stone-200 line-clamp-1">+ {secondaryOfferLabel}</p>
                )}
                {displayPrice && (
                  <div className="text-lg sm:text-xl font-extrabold" style={{ color: accentColorHex }}>
                    {displayPrice}
                  </div>
                )}
                {ctaText && (
                  <div className="bg-emerald-600 text-white font-extrabold text-xs py-1.5 px-4 rounded-full shadow-lg inline-flex items-center justify-center">
                    {ctaText}
                  </div>
                )}
                {contactInfo && (
                  <p className="text-[10px] text-stone-200 line-clamp-1">{contactInfo}</p>
                )}
                {isUsingIllustrativeServiceVisual && (
                  <p className="text-[9px] text-amber-200/90">
                    Illustrative Service Visual (Not Actual Business Photo)
                  </p>
                )}
              </div>
            </div>
          )}

          <p className="text-[11px] text-stone-500 text-center">
            {ASPECT_FORMATS.find((f) => f.id === aspectRatio)?.dim} px •{' '}
            {ASPECT_FORMATS.find((f) => f.id === aspectRatio)?.label}
          </p>

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Right: Flyer Controls */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              Flyer Format & Brand Content (No Invented Details)
            </h4>

            {/* Format selector */}
            <div>
              <label className="text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-emerald-700" />
                Social Platform Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ASPECT_FORMATS.map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => {
                      setAspectRatio(fmt.id);
                      setGeneratedFlyerDataUrl(null);
                    }}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      aspectRatio === fmt.id
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <div className="text-xs font-bold">{fmt.id}</div>
                    <div className="text-[10px] text-stone-500 leading-tight mt-0.5">
                      {fmt.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => {
                    setHeadline(e.target.value);
                    setGeneratedFlyerDataUrl(null);
                  }}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={subline}
                  onChange={(e) => {
                    setSubline(e.target.value);
                    setGeneratedFlyerDataUrl(null);
                  }}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {businessType === 'service'
                  ? 'Advertised Service Headline'
                  : 'Advertised Product / Offer Title'}
              </label>
              <input
                type="text"
                value={offerTitle}
                onChange={(e) => {
                  setOfferTitle(e.target.value);
                  setGeneratedFlyerDataUrl(null);
                }}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Your Price (Leave blank to omit)
                </label>
                <input
                  type="text"
                  value={displayPrice}
                  onChange={(e) => {
                    setDisplayPrice(e.target.value);
                    setGeneratedFlyerDataUrl(null);
                  }}
                  placeholder="e.g. ₦28,500 (optional)"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Optional Badge Label
                </label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => {
                    setBadgeText(e.target.value);
                    setGeneratedFlyerDataUrl(null);
                  }}
                  placeholder="Leave blank if none"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-700" />
                  Contact Info / Location (Optional)
                </label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => {
                    setContactInfo(e.target.value);
                    setGeneratedFlyerDataUrl(null);
                  }}
                  placeholder="WhatsApp number, @handle, or address"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Call-To-Action Button
                </label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => {
                    setCtaText(e.target.value);
                    setGeneratedFlyerDataUrl(null);
                  }}
                  placeholder="e.g. Order via WhatsApp"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                />
              </div>
            </div>

            {/* Brand Colour Swatches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Primary Flyer Background
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {palette.map((color, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSelectedColorHex(color.hex);
                        setGeneratedFlyerDataUrl(null);
                      }}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                        selectedColorHex === color.hex
                          ? 'border-white ring-2 ring-emerald-500 scale-110 shadow-sm'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={`${color.name} (${color.role})`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Accent Highlight
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {palette.map((color, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setAccentColorHex(color.hex);
                        setGeneratedFlyerDataUrl(null);
                      }}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                        accentColorHex === color.hex
                          ? 'border-white ring-2 ring-amber-500 scale-110 shadow-sm'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Saved Visuals in Complete Brand Kit */}
          {savedPromoImages.length > 0 && (
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  Saved Brand Kit Visuals ({savedPromoImages.length})
                </h5>
                <span className="text-[11px] text-emerald-800">
                  Included in Export Complete Brand Kit ZIP
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {savedPromoImages.map((img) => (
                  <div
                    key={img.fileName}
                    className="flex items-center justify-between gap-2 bg-white p-2 rounded-lg border border-emerald-100"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={img.dataUrl}
                        alt={img.fileName}
                        className="w-9 h-9 rounded object-cover border border-stone-200 shrink-0"
                      />
                      <span className="text-[11px] font-medium text-stone-800 truncate">
                        {img.fileName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => triggerDataUrlDownload(img.dataUrl, img.fileName)}
                      className="px-2 py-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[10px] font-bold shrink-0 cursor-pointer"
                    >
                      PNG
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
