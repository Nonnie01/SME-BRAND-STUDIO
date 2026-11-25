export interface BrandNameOption {
  name: string;
  tagline: string;
  meaning: string;
  targetVibe: string;
  isRecommended?: boolean;
  recommendationRationale?: string;
}

export type BrandColorRole =
  | 'Primary brand colour'
  | 'Secondary brand colour'
  | 'Accent colour'
  | 'Supporting colour'
  | 'Background colour'
  | 'Text colour'
  | 'Complementary colour'
  | 'Highlight colour'
  | string;

export interface StrategicColorSwatch {
  name: string;
  hex: string;
  role: BrandColorRole;
  psychologicalReason: string;
  marketingReason: string;
}

export type ColorSwatch = StrategicColorSwatch;

export interface BrandVoiceGuide {
  tone: string;
  vocabulary: string[];
  communicationDos: string[];
  communicationDonts: string[];
}

export interface BrandPositioning {
  targetAudience: string;
  customerNeedsAndMotivations: string;
  brandPersonality: { trait: string; rationale: string }[];
  uniqueSellingProposition: string;
  marketDifferentiation: string;
  brandPromise: string;
  brandVoice: BrandVoiceGuide;
}

export interface MarketRelevanceStrategy {
  priceTierAnalysis: string;
  trustBuildingTactics: string[];
  channelStrategy: string;
  locationSpecificTactics?: { region: string; tactics: string }[];
}

export interface StrategistQualityAudit {
  photoObservations: string;
  userSuppliedData: string;
  groundedClaimsPolicy: string;
  cohesionScore: number; // e.g. 96
  consistencyReview: string;
  pitfallsToAvoid: string[];
  packagingAndDisplayAdvice: string;
}

export interface TypographyRecommendation {
  headerFont: string;
  bodyFont: string;
  styleNote: string;
}

export interface IdealCustomerPersona {
  name: string;
  ageRange: string;
  location: string;
  painPoint: string;
  whyTheyBuy: string;
}

export interface BrandIdentity {
  selectedName: string;
  selectedTagline: string;
  strongestNameRationale: string;
  colorPalette: StrategicColorSwatch[]; // exactly 4 colours
  positioning: BrandPositioning;
  marketStrategy: MarketRelevanceStrategy;
  qualityAudit: StrategistQualityAudit;
  typographyRecommendation: TypographyRecommendation;
  idealCustomerPersona: IdealCustomerPersona;
}

export interface CaptionItem {
  title: string;
  hook: string;
  body: string;
  callToAction: string;
  hashtags: string[];
}

export interface MarketingCaptions {
  english: CaptionItem[];
  pidgin: CaptionItem[];
}

export interface InstagramCarousel {
  title: string;
  slide1Hook: string;
  slide2Value: string;
  slide3SocialProof: string;
  slide4CTA: string;
}

export interface TiktokReelConcept {
  hookVisual: string;
  audioSuggestion: string;
  script15s: string;
  onScreenText: string;
}

export interface WhatsappStatusItem {
  part: string;
  text: string;
  visualTip: string;
}

export interface AdvertisingConcepts {
  instagramCarousel: InstagramCarousel;
  tiktokReelConcept: TiktokReelConcept;
  whatsappStatusSequence: WhatsappStatusItem[];
  promoOfferIdeas: string[];
}

export type BusinessType = 'product' | 'service' | 'hybrid';

export type ServiceCategory =
  | 'Beauty and Personal Care'
  | 'Events and Entertainment'
  | 'Creative and Media Services'
  | 'Professional and Consulting Services'
  | 'Logistics and Transportation'
  | 'Food and Hospitality Services'
  | 'Education and Training'
  | 'Home and Facility Services'
  | 'Repairs and Technical Services'
  | 'Other Services';

export const STRUCTURED_SERVICE_CATEGORIES: { id: ServiceCategory; label: string; icon: string; example: string }[] = [
  { id: 'Beauty and Personal Care', label: 'Beauty and Personal Care', icon: '💇', example: 'Bridal makeup, hairstyling, spa therapy, bespoke barbering' },
  { id: 'Events and Entertainment', label: 'Events and Entertainment', icon: '🎪', example: 'Event planning, MC/Hypeman, DJ services, photography & photobooths' },
  { id: 'Creative and Media Services', label: 'Creative and Media Services', icon: '🎨', example: 'Graphic design, videography, social media management, copywriting' },
  { id: 'Professional and Consulting Services', label: 'Professional and Consulting Services', icon: '💼', example: 'Accounting, CAC registration, tax advisory, business coaching' },
  { id: 'Logistics and Transportation', label: 'Logistics and Transportation', icon: '🚚', example: 'Intra-city dispatch, interstate waybill haulage, airport transfers' },
  { id: 'Food and Hospitality Services', label: 'Food and Hospitality Services', icon: '🍽️', example: 'Event catering, private chef, cocktail mixology, meal-prep' },
  { id: 'Education and Training', label: 'Education and Training', icon: '📚', example: 'Tutorial centers, tech/coding bootcamps, fashion academies' },
  { id: 'Home and Facility Services', label: 'Home and Facility Services', icon: '🧹', example: 'Deep cleaning, post-construction cleanup, fumigation, plumbing' },
  { id: 'Repairs and Technical Services', label: 'Repairs and Technical Services', icon: '🔧', example: 'Phone/laptop repair, AC installation, solar/inverter technicians' },
  { id: 'Other Services', label: 'Other Services', icon: '🌟', example: 'Custom tailored and specialized service businesses' },
];

export type ServiceDeliveryMethod = 'physical' | 'online' | 'hybrid';

export interface ServicePackageOffer {
  name?: string;
  tierName?: string;
  targetClient: string;
  deliverables: string | string[];
  pricingAdvice?: string;
  recommendedPricing?: string;
  turnaroundOrDuration?: string;
}

export interface ServiceStrategy {
  clientOnboardingAndExperience: string;
  trustAndDepositPolicy: string;
  trustDepositPolicy?: string;
  retentionAndReferralTactics: string[];
  servicePackages: ServicePackageOffer[];
  whatsAppBookingFlow: {
    greetingAndQualification?: string;
    inquiryGreeting?: string;
    qualifyingQuestions?: string[];
    rateCardMessage?: string;
    depositConfirmationNotice: string;
    postServiceReviewRequest?: string;
    postServiceReviewPrompt?: string;
  };
}

export interface CrossSellingOpportunity {
  trigger: string;
  recommendation: string;
  benefit: string;
}

export interface CombinedCampaign {
  title: string;
  theme: string;
  hook: string;
  bundleOffer: string;
  callToAction: string;
}

export interface HybridMarketingKit {
  unifiedTagline: string;
  unifiedElevatorPitch: string;
  productCaptions: {
    english: CaptionItem[];
    pidgin: CaptionItem[];
  };
  serviceCaptions: {
    english: CaptionItem[];
    pidgin: CaptionItem[];
  };
  combinedCampaigns: CombinedCampaign[];
  crossSellingOpportunities: CrossSellingOpportunity[];
  whatsAppOmnichannelFlow: {
    productInquiryToServiceUpsell: string;
    serviceClientToProductAddon: string;
    vipComboBroadcast: string;
  };
  adCopyInstagramFacebook: {
    headline: string;
    primaryText: string;
    creativeAngle: string;
    callToAction: string;
  }[];
  promotionalOffers: string[];
  customerRetentionTactics: string[];
}

export interface BrandStudioResult {
  businessType?: BusinessType;
  visualAnalysis: string;
  brandNames: BrandNameOption[]; // 5 options
  brandIdentity: BrandIdentity;
  marketingCaptions: MarketingCaptions;
  advertisingConcepts: AdvertisingConcepts;
  serviceStrategy?: ServiceStrategy;
  hybridMarketingKit?: HybridMarketingKit;
}

export type StructuredProductCategory =
  | 'Food and beverages'
  | 'Fashion and clothing'
  | 'Beauty and skincare'
  | 'Haircare and cosmetics'
  | 'Footwear and accessories'
  | 'Electronics and gadgets'
  | 'Home and household products'
  | 'Agriculture and agricultural products'
  | 'Health and wellness'
  | 'Arts, crafts and handmade products'
  | 'Other products';

export const STRUCTURED_PRODUCT_CATEGORIES: { id: StructuredProductCategory; label: string; icon: string }[] = [
  { id: 'Food and beverages', label: 'Food and beverages', icon: '🍲' },
  { id: 'Fashion and clothing', label: 'Fashion and clothing', icon: '👗' },
  { id: 'Beauty and skincare', label: 'Beauty and skincare', icon: '🌿' },
  { id: 'Haircare and cosmetics', label: 'Haircare and cosmetics', icon: '💄' },
  { id: 'Footwear and accessories', label: 'Footwear and accessories', icon: '👞' },
  { id: 'Electronics and gadgets', label: 'Electronics and gadgets', icon: '📱' },
  { id: 'Home and household products', label: 'Home and household products', icon: '🕯️' },
  { id: 'Agriculture and agricultural products', label: 'Agriculture and agricultural products', icon: '🌾' },
  { id: 'Health and wellness', label: 'Health and wellness', icon: '🧘' },
  { id: 'Arts, crafts and handmade products', label: 'Arts, crafts and handmade products', icon: '🎨' },
  { id: 'Other products', label: 'Other products', icon: '✨' },
];

export interface ProductRecognitionResult {
  productIdentified: string;
  productCategory: StructuredProductCategory;
  productSubcategory: string;
  industry: string;
  visualDescription: string;
  likelyTargetAudience: string;
  identificationConfidence: {
    level: 'High' | 'Medium' | 'Low';
    percentage: number; // e.g. 94
    explanation: string;
  };
  confirmedCharacteristics: string[];
  visualEstimates: string[];
  clarificationRequired?: {
    isAmbiguousOrMultiple: boolean;
    detectedItems?: string[];
    clarificationMessage?: string;
  };
  alternativeCategories?: StructuredProductCategory[];
}

export type ProductCategory = StructuredProductCategory | 'fashion' | 'skincare' | 'food' | 'drinks' | 'handmade' | 'other';

export interface SampleProduct {
  id: string;
  category: ProductCategory;
  categoryLabel: string;
  cardCategoryLabel?: string;
  subcategory?: string;
  productName: string;
  description: string;
  priceRange: string;
  targetAudience: string;
  targetLocation: string;
  selectedRegions?: string[];
  imageUrl: string;
  badge: string;
  recognition?: ProductRecognitionResult;
  suggestedBrandName?: string;
}

export interface ServiceBusinessInput {
  businessType: 'service';
  brandName: string;
  category: ServiceCategory | string;
  customCategory?: string;
  serviceDescription: string;
  specificServices: string;
  targetCustomers: string;
  businessLocation: string;
  selectedRegions: string[];
  deliveryMethod: ServiceDeliveryMethod;
  rateCardOrPricing: string;
  brandTone: string;
  logoOrAssetUrl: string | null;
}

export interface SampleServiceBusiness {
  id: string;
  businessType: 'service';
  brandName: string;
  category: ServiceCategory;
  serviceDescription: string;
  specificServices: string;
  targetCustomers: string;
  businessLocation: string;
  selectedRegions: string[];
  deliveryMethod: ServiceDeliveryMethod;
  rateCardOrPricing: string;
  brandTone: string;
  badge: string;
  logoOrAssetUrl?: string;
}

export interface HybridBusinessInput {
  businessType: 'hybrid';
  brandName: string;
  businessDescription: string;
  industryCategory: string;
  targetCustomers: string;
  businessLocation: string;
  selectedRegions: string[];
  brandTone: string;
  logoOrAssetUrl: string | null;

  // Product Part (optional image & manual inputs)
  productName: string;
  productDescription: string;
  productPrice: string;
  productCategory: string;
  productImageBase64: string | null;
  productImageMimeType?: string;
  productRecognition?: ProductRecognitionResult | null;
  productRecognitionConfirmed?: boolean;

  // Service Part
  serviceName: string;
  serviceDescription: string;
  serviceCategory: string;
  serviceDeliveryMethod: ServiceDeliveryMethod;
  servicePriceOrPackages: string;
}

export interface SampleHybridBusiness {
  id: string;
  businessType: 'hybrid';
  brandName: string;
  industryCategory: string;
  businessDescription: string;
  targetCustomers: string;
  businessLocation: string;
  selectedRegions: string[];
  brandTone: string;
  badge: string;
  logoOrAssetUrl?: string;

  // Product Part
  productName: string;
  productDescription: string;
  productPrice: string;
  productCategory: string;
  productImageUrl?: string;
  recognition?: ProductRecognitionResult;

  // Service Part
  serviceName: string;
  serviceDescription: string;
  serviceCategory: string;
  serviceDeliveryMethod: ServiceDeliveryMethod;
  servicePriceOrPackages: string;
}

/* =========================================================
   EXISTING BRAND IMPROVEMENT TYPES
   ========================================================= */

export type StudioMode = 'create' | 'improve';

export interface ExistingBrandInput {
  businessType?: BusinessType;
  existingBrandName: string;
  logoUrl: string | null;
  currentColours: string;
  existingTagline: string;
  businessDescription: string;
  targetCustomers: string;
  improvementGoals: string[];
  customImprovementNote: string;
  rebrandRequested: boolean;
  productOfferings?: string;
  serviceOfferings?: string;
}

export interface BrandImprovementRecommendations {
  brandPositioning: {
    currentAssessment: string;
    refinedPositioning: string;
    refinedTargetAudience: string;
    customerNeedsAndMotivations: string;
    refinedUSP: string;
    marketDifferentiation: string;
  };
  brandConsistency: {
    consistencyGaps: string[];
    brandRules: string[];
    toneConsistencyRules: string;
  };
  improvedVisualIdentity: {
    logoCritiqueAndRefinement: string;
    refinedColorPalette: StrategicColorSwatch[];
    typographyUpgrade: TypographyRecommendation;
    packagingUpgradeAdvice: string;
  };
  brandMessagingAndTagline: {
    taglineOptions: { tagline: string; angle: string }[];
    recommendedTagline: string;
    taglineRationale: string;
    coreElevatorPitch: string;
    keyMessagingPillars: string[];
  };
  marketingStrategy: {
    priceTierAndPerceptionStrategy: string;
    trustBuildingTactics: string[];
    omnichannelPlan: string;
  };
  socialMediaContent: {
    revampedEnglishCaptions: CaptionItem[];
    revampedPidginCaptions: CaptionItem[];
    weeklyContentPillars: string[];
    whatsAppStatusCampaign: WhatsappStatusItem[];
  };
}

export interface BrandImprovementResult {
  brandAudit: {
    summary: string;
    preservedElements: string[];
    criticalGapsIdentified: string[];
  };
  recommendations: BrandImprovementRecommendations;
}

export interface SampleExistingBrand {
  id: string;
  name: string;
  category: ProductCategory;
  tagline: string;
  colours: string;
  description: string;
  targetCustomers: string;
  selectedRegions?: string[];
  logoUrl: string;
  improvementGoals: string[];
  badge: string;
  recognition?: ProductRecognitionResult;
}

/* =========================================================
   PRODUCT & SERVICE VISUAL VERIFICATION / FLYER TYPES
   ========================================================= */

export type PhotoEnhancementPreset =
  | 'background-remove'
  | 'studio-clean'
  | 'lighting-clarity'
  | 'lifestyle-nigeria';

export type FlyerAspectRatio = '1:1' | '9:16' | '16:9';

export type HybridFlyerMode = 'product' | 'service' | 'combined';

export interface ProductImageVerificationResult {
  matches: boolean;
  confidence: number;
  detectedProduct: string;
  detectedCategory: string;
  mismatchReason: string;
  suggestedAction: string;
}

export interface RecognizedProductContext {
  imageUrl: string;
  productName: string;
  productDescription: string;
  category: string;
  recognitionProductIdentified: string;
}

export interface EnhancedPhotoResult {
  dataUrl: string;
  preset: PhotoEnhancementPreset;
}

/* =========================================================
   CLOUD FIRESTORE SAVED BRAND PROJECT TYPES
   ========================================================= */

export type ProjectStatus = 'draft' | 'active' | 'delivered' | 'archived';

export interface PromoImageRefMetadata {
  fileName: string;
  label?: string;
  createdAtIso?: string;
}

export interface ProjectFormSnapshot {
  customBrandName?: string;
  category?: string;
  productName?: string;
  description?: string;
  price?: string;
  selectedBadge?: string;
  backdropTheme?: string;
  targetLocation?: string;
  selectedRegions?: string[];
  brandTone?: string;
  serviceCategory?: string;
  customServiceCategory?: string;
  serviceDescription?: string;
  specificServices?: string;
  serviceTargetCustomers?: string;
  serviceBusinessLocation?: string;
  serviceDeliveryMethod?: ServiceDeliveryMethod;
  rateCardOrPricing?: string;
  hybridIndustryCategory?: string;
  hybridProductName?: string;
  hybridProductDescription?: string;
  hybridProductPrice?: string;
  hybridProductCategory?: string;
  hybridServiceName?: string;
  hybridServiceDescription?: string;
  hybridServiceCategory?: string;
  hybridServiceDeliveryMethod?: ServiceDeliveryMethod;
  hybridServicePriceOrPackages?: string;
  existingBrandName?: string;
  currentColours?: string;
  existingTagline?: string;
  existingBusinessDescription?: string;
  existingTargetCustomers?: string;
  improvementGoals?: string[];
  customImprovementNote?: string;
  rebrandRequested?: boolean;
}

export interface SavedBrandProject {
  id: string;
  ownerId: string;
  ownerEmail: string;
  studioMode: StudioMode;
  businessType: BusinessType;
  businessName: string;
  businessCategory: string;
  selectedRegions: string[];
  targetLocation?: string;
  brandTone?: string;
  priceRange?: string;
  productDescription?: string;
  serviceDescription?: string;
  formSnapshot?: ProjectFormSnapshot;
  brandResult: BrandStudioResult;
  promoImageRefs: PromoImageRefMetadata[];
  isDoneForYou: boolean;
  status: ProjectStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
  createdAtMs?: number;
  updatedAtMs?: number;
}
