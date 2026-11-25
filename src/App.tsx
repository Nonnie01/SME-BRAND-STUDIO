/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { PhotoStudio, BADGES, BACKDROPS } from './components/PhotoStudio';
import { ProductForm } from './components/ProductForm';
import { ServiceForm } from './components/ServiceForm';
import { ServiceStrategySection } from './components/ServiceStrategySection';
import { HybridForm } from './components/HybridForm';
import { HybridMarketingSection } from './components/HybridMarketingSection';
import { ExistingBrandForm } from './components/ExistingBrandForm';
import { BrandImprovementReview } from './components/BrandImprovementReview';
import { BrandNamesSection } from './components/BrandNamesSection';
import { BrandIdentitySection } from './components/BrandIdentitySection';
import { CaptionsSection } from './components/CaptionsSection';
import { AdConceptsSection } from './components/AdConceptsSection';
import { SocialFlyerStudio } from './components/SocialFlyerStudio';
import { BrandSummaryModal } from './components/BrandSummaryModal';
import { ProductRecognitionCard } from './components/ProductRecognitionCard';
import { AuthModal, AuthModalTab } from './components/AuthModal';
import { CustomerDashboard } from './components/CustomerDashboard';
import { WorkspaceSidebar, WorkspaceNavId } from './components/WorkspaceSidebar';
import { DashboardHome } from './components/DashboardHome';
import { WorkspaceEmptyKitNotice } from './components/WorkspaceEmptyKitNotice';
import { useAuth } from './context/AuthContext';
import { Toast } from './components/Toast';
import { SAMPLE_PRODUCTS, NIGERIAN_BEVERAGE_SAMPLES } from './data/sampleProducts';
import { SAMPLE_EXISTING_BRANDS } from './data/sampleExistingBrands';
import { SAMPLE_SERVICE_BUSINESSES } from './data/sampleServices';
import { SAMPLE_HYBRID_BUSINESSES } from './data/sampleHybridBusinesses';
import { formatRegionSummary } from './data/nigerianRegions';
import { postJsonApi, getFriendlyErrorMessage, onApiAuthRequired } from './utils/apiClient';
import {
  DESKTOP_SIDEBAR_MEDIA_QUERY,
  isDesktopWidth,
  resolveMobileNavOnResize,
} from './utils/navigationDrawer';
import {
  listUserProjects,
  createSavedProject,
  updateSavedProject,
  deleteSavedProject,
  parseFriendlyFirestoreError,
  UpdateProjectInput,
} from './services/projectService';
import {
  ProductCategory,
  StructuredProductCategory,
  ProductRecognitionResult,
  BrandStudioResult,
  SampleProduct,
  SampleExistingBrand,
  SampleServiceBusiness,
  SampleHybridBusiness,
  BrandNameOption,
  StudioMode,
  BusinessType,
  ServiceCategory,
  ServiceDeliveryMethod,
  ExistingBrandInput,
  BrandImprovementResult,
  StrategicColorSwatch,
  SavedBrandProject,
  ProjectFormSnapshot,
  PromoImageRefMetadata,
  RecognizedProductContext,
} from './types';
import { exportCompleteBrandKitZip, GeneratedPromoImage } from './utils/brandExport';
import {
  Sparkles,
  Layers,
  Palette,
  MessageSquare,
  Megaphone,
  Image as ImageIcon,
  AlertCircle,
  FileCheck2,
  Briefcase,
  Wand2,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Archive,
  Loader2,
  Save,
  CopyPlus,
} from 'lucide-react';

export default function App() {
  // Top Level Application Mode: 'create' = Create a New Brand | 'improve' = Improve My Existing Brand
  const [studioMode, setStudioMode] = useState<StudioMode>('create');

  // Mode 1: Business Type Selection ('product' = Physical Goods | 'service' = Service SME)
  const [businessType, setBusinessType] = useState<BusinessType>('product');
  const [customBrandName, setCustomBrandName] = useState<string>('');

  // Mode 1: Product-Based Business State
  const [category, setCategory] = useState<ProductCategory>('fashion');
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('₦28,500');
  const [selectedBadge, setSelectedBadge] = useState<string>('naija-made');
  const [backdropTheme, setBackdropTheme] = useState<string>('natural');
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [productTargetAudience, setProductTargetAudience] = useState<string>(
    'Nigerian buyers and diaspora market'
  );

  // Mode 1: Service-Based Business State
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory | string>('Beauty & Wellness');
  const [customServiceCategory, setCustomServiceCategory] = useState<string>('');
  const [serviceDescription, setServiceDescription] = useState<string>('');
  const [specificServices, setSpecificServices] = useState<string>('');
  const [serviceTargetCustomers, setServiceTargetCustomers] = useState<string>(
    'Nigerian brides, wedding guests, and high-profile event attendees'
  );
  const [serviceBusinessLocation, setServiceBusinessLocation] = useState<string>('');
  const [serviceDeliveryMethod, setServiceDeliveryMethod] = useState<ServiceDeliveryMethod>('hybrid');
  const [rateCardOrPricing, setRateCardOrPricing] = useState<string>('₦45,000 / bridal session');
  const [serviceLogoUrl, setServiceLogoUrl] = useState<string | null>(null);
  const [selectedServiceSampleId, setSelectedServiceSampleId] = useState<string | null>(null);

  // Mode 1: Hybrid Business State (Products + Services)
  const [hybridIndustryCategory, setHybridIndustryCategory] = useState<string>('Beauty, Haircare & Wellness');
  const [hybridProductName, setHybridProductName] = useState<string>('Herbal Hair Regrowth Oil');
  const [hybridProductDescription, setHybridProductDescription] = useState<string>(
    'Cold-pressed chebe, rosemary and batana infused scalp oil in 100ml amber dropper bottles'
  );
  const [hybridProductPrice, setHybridProductPrice] = useState<string>('₦14,500');
  const [hybridProductCategory, setHybridProductCategory] = useState<string>('Haircare and cosmetics');
  const [hybridProductImage, setHybridProductImage] = useState<string | null>(null);
  const [hybridServiceName, setHybridServiceName] = useState<string>(
    'Scalp Detox & Hair Revitalization Therapy'
  );
  const [hybridServiceDescription, setHybridServiceDescription] = useState<string>(
    'In-salon intensive steam scalp detox, split-end repair, and personalized routine consultation'
  );
  const [hybridServiceCategory, setHybridServiceCategory] = useState<string>('Beauty and Personal Care');
  const [hybridServiceDeliveryMethod, setHybridServiceDeliveryMethod] = useState<ServiceDeliveryMethod>('hybrid');
  const [hybridServicePriceOrPackages, setHybridServicePriceOrPackages] = useState<string>('₦38,000 / session');
  const [selectedHybridSampleId, setSelectedHybridSampleId] = useState<string | null>(null);

  // Common Geographic & Visual State (Lagos is an optional default only for new blank projects)
  const [targetLocation, setTargetLocation] = useState('Lagos');
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['Lagos']);
  const [isRegeneratingPalette, setIsRegeneratingPalette] = useState(false);
  const [brandTone, setBrandTone] = useState('Afro-Luxury & Regal');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Mode 2: Improve My Existing Brand Input State
  const [existingBrandInput, setExistingBrandInput] = useState<ExistingBrandInput>({
    businessType: 'product',
    existingBrandName: '',
    logoUrl: null,
    currentColours: '',
    existingTagline: '',
    businessDescription: '',
    targetCustomers: '',
    improvementGoals: [
      'Brand positioning',
      'Brand consistency',
      'Improved visual identity',
      'Brand messaging and tagline',
      'Marketing strategy',
      'Social media content',
    ],
    customImprovementNote: '',
    rebrandRequested: false,
    productOfferings: '',
    serviceOfferings: '',
  });
  const [selectedExistingSampleId, setSelectedExistingSampleId] = useState<string | null>(null);
  const [improvementResult, setImprovementResult] = useState<BrandImprovementResult | null>(null);

  // Advanced AI Product Recognition Engine State (Grounded Pre-Generation Classification)
  const [productRecognition, setProductRecognition] = useState<ProductRecognitionResult | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState<boolean>(false);
  const [recognitionConfirmed, setRecognitionConfirmed] = useState<boolean>(false);
  const [recognizedContext, setRecognizedContext] = useState<RecognizedProductContext | null>(null);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  // Workflow & Results State
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lastFailedAction, setLastFailedAction] = useState<'new' | 'improve' | null>(null);
  const [result, setResult] = useState<BrandStudioResult | null>(null);
  const [activeNav, setActiveNav] = useState<WorkspaceNavId>('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const lastViewportWidthRef = useRef<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );
  const [brandKitTab, setBrandKitTab] = useState<'names' | 'identity' | 'service' | 'hybrid'>('names');
  const [marketingTab, setMarketingTab] = useState<'captions' | 'ads' | 'flyer'>('captions');

  // Active Selected Brand Name & Tagline
  const [activeBrandName, setActiveBrandName] = useState<string>('');
  const [activeTagline, setActiveTagline] = useState<string>('');

  // Modals, Dashboard & Cloud Project Persistence
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<AuthModalTab>('login');
  const [savedProjects, setSavedProjects] = useState<SavedBrandProject[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [saveProjectError, setSaveProjectError] = useState<string | null>(null);
  const [lastSavedNotice, setLastSavedNotice] = useState<string | null>(null);

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRegeneratingCaptions, setIsRegeneratingCaptions] = useState(false);
  const [paletteError, setPaletteError] = useState<string | null>(null);
  const [captionsError, setCaptionsError] = useState<string | null>(null);
  const [generatedPromoImages, setGeneratedPromoImages] = useState<GeneratedPromoImage[]>([]);
  const [brandedMockupUrl, setBrandedMockupUrl] = useState<string | null>(null);
  const [useBrandedMockup, setUseBrandedMockup] = useState<boolean>(false);
  const [isExportingKit, setIsExportingKit] = useState(false);
  const [kitExportError, setKitExportError] = useState<string | null>(null);

  // Load first sample product by default so the user immediately sees a populated, working state!
  useEffect(() => {
    handleSelectSample(SAMPLE_PRODUCTS[0]);
  }, []);

  const handleCloseMobileNav = useCallback(() => {
    setIsMobileNavOpen(false);
  }, []);

  const handleMockupStateChange = useCallback(
    (state: { mockupUrl: string | null; active: boolean }) => {
      setBrandedMockupUrl(state.mockupUrl);
      setUseBrandedMockup(state.active);
    },
    []
  );

  // Automatically close any open drawer when navigating between sections
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [activeNav]);

  // Reset stale drawer state across Preview <-> Fullscreen / horizontal viewport resizes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia(DESKTOP_SIDEBAR_MEDIA_QUERY)
        : null;

    if (mediaQuery?.matches || isDesktopWidth(window.innerWidth)) {
      setIsMobileNavOpen(false);
    }

    const handleViewportResize = () => {
      const nextWidth = window.innerWidth;
      const prevWidth = lastViewportWidthRef.current;
      lastViewportWidthRef.current = nextWidth;

      setIsMobileNavOpen((currentOpen) =>
        resolveMobileNavOnResize({
          isMobileOpen: currentOpen,
          prevWidth,
          nextWidth,
        })
      );
    };

    const handleBreakpointChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setIsMobileNavOpen(false);
      }
    };

    if (mediaQuery) {
      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', handleBreakpointChange);
      } else {
        mediaQuery.addListener(handleBreakpointChange);
      }
    }
    window.addEventListener('resize', handleViewportResize);

    return () => {
      if (mediaQuery) {
        if (typeof mediaQuery.removeEventListener === 'function') {
          mediaQuery.removeEventListener('change', handleBreakpointChange);
        } else {
          mediaQuery.removeListener(handleBreakpointChange);
        }
      }
      window.removeEventListener('resize', handleViewportResize);
    };
  }, []);

  const loadUserProjects = React.useCallback(async (uid: string) => {
    setIsLoadingProjects(true);
    setProjectsError(null);
    try {
      const items = await listUserProjects(uid);
      setSavedProjects(items);
    } catch (err) {
      setProjectsError(
        parseFriendlyFirestoreError(err, 'Could not load your saved projects right now.')
      );
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.emailVerified) {
      loadUserProjects(user.uid);
    } else {
      setSavedProjects([]);
      setProjectsError(null);
      if (!user) {
        setActiveProjectId(null);
      }
    }
  }, [user, loadUserProjects]);

  useEffect(() => {
    return onApiAuthRequired((code) => {
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
      if (code === 'EMAIL_VERIFICATION_REQUIRED') {
        triggerToast('Please verify your email address to unlock this AI feature.');
      } else {
        triggerToast('Log in or create a free account to run AI generation — your inputs are preserved.');
      }
    });
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    triggerToast(`Copied ${label} to clipboard!`);
  };

  // Dynamic Palette Handlers
  const handleUpdatePalette = (newPalette: StrategicColorSwatch[]) => {
    if (result) {
      setResult({
        ...result,
        brandIdentity: {
          ...result.brandIdentity,
          colorPalette: newPalette,
        },
      });
      triggerToast('Custom brand colour palette updated!');
    }
  };

  const handleRegeneratePalette = async () => {
    if (!result) return;
    setIsRegeneratingPalette(true);
    setPaletteError(null);
    try {
      const data = await postJsonApi<{ success: boolean; palette?: StrategicColorSwatch[] }>(
        '/api/regenerate-palette',
        {
          brandName: activeBrandName || result.brandIdentity.selectedName,
          productName: productName || activeBrandName,
          category: businessType === 'service' ? serviceCategory : category,
          businessType,
          brandTone,
          targetLocation,
          selectedRegions,
        }
      );

      if (data.success && Array.isArray(data.palette) && data.palette.length >= 6) {
        handleUpdatePalette(data.palette);
        triggerToast('Harmonized fresh 6–8 colour palette!');
      } else {
        setPaletteError('The regenerated palette returned fewer than 6 colours.');
        triggerToast('Incomplete palette returned — existing colours kept.');
      }
    } catch (e) {
      console.error('Palette regen error:', e);
      const errMsg = getFriendlyErrorMessage(
        e,
        'Could not regenerate colour palette right now. Please try again.'
      );
      setPaletteError(errMsg);
      triggerToast('Could not regenerate palette — existing colours preserved.');
    } finally {
      setIsRegeneratingPalette(false);
    }
  };

  // Service Sample Selection Handler
  const handleSelectServiceSample = (sample: SampleServiceBusiness) => {
    setSelectedServiceSampleId(sample.id);
    setCustomBrandName(sample.brandName || '');
    setServiceCategory(sample.category);
    setCustomServiceCategory('');
    setServiceDescription(sample.serviceDescription);
    setSpecificServices(sample.specificServices);
    setServiceTargetCustomers(sample.targetCustomers);
    setServiceBusinessLocation(sample.businessLocation);
    setServiceDeliveryMethod(sample.deliveryMethod);
    const nextServiceRegions = Array.isArray(sample.selectedRegions) ? sample.selectedRegions : [];
    setSelectedRegions(nextServiceRegions);
    setTargetLocation(
      nextServiceRegions.length > 0
        ? formatRegionSummary(nextServiceRegions)
        : sample.businessLocation || ''
    );
    setRateCardOrPricing(sample.rateCardOrPricing);
    setBrandTone(sample.brandTone);
    setServiceLogoUrl(sample.logoOrAssetUrl || null);
    if (sample.logoOrAssetUrl) {
      setImagePreview(sample.logoOrAssetUrl);
    }
    setProductRecognition(null);
    setRecognitionConfirmed(false);
    setRecognizedContext(null);
    setBrandedMockupUrl(null);
    setUseBrandedMockup(false);
    triggerToast(`Loaded sample service: "${sample.brandName || sample.category}"`);
  };

  // Hybrid Sample Selection Handler
  const handleSelectHybridSample = (sample: SampleHybridBusiness) => {
    setSelectedHybridSampleId(sample.id);
    setCustomBrandName(sample.brandName || '');
    setHybridIndustryCategory(sample.industryCategory);
    setServiceDescription(sample.businessDescription);
    setDescription(sample.businessDescription);
    setServiceTargetCustomers(sample.targetCustomers);
    setServiceBusinessLocation(sample.businessLocation);
    const nextHybridRegions = Array.isArray(sample.selectedRegions) ? sample.selectedRegions : [];
    setSelectedRegions(nextHybridRegions);
    setTargetLocation(
      nextHybridRegions.length > 0
        ? formatRegionSummary(nextHybridRegions)
        : sample.businessLocation || ''
    );
    setBrandTone(sample.brandTone);

    // Product part
    setHybridProductName(sample.productName);
    setHybridProductDescription(sample.productDescription);
    setHybridProductPrice(sample.productPrice);
    setHybridProductCategory(sample.productCategory);
    if (sample.productImageUrl) {
      setHybridProductImage(sample.productImageUrl);
      setImagePreview(sample.productImageUrl);
    } else {
      setHybridProductImage(null);
    }
    if (sample.recognition && sample.productImageUrl) {
      setProductRecognition(sample.recognition);
      setRecognitionConfirmed(true);
      setRecognizedContext({
        imageUrl: sample.productImageUrl,
        productName: sample.productName,
        productDescription: sample.productDescription,
        category: String(sample.productCategory || ''),
        recognitionProductIdentified: sample.recognition.productIdentified,
      });
    } else {
      setProductRecognition(null);
      setRecognitionConfirmed(false);
      setRecognizedContext(null);
    }

    // Service part
    setHybridServiceName(sample.serviceName);
    setHybridServiceDescription(sample.serviceDescription);
    setHybridServiceCategory(sample.serviceCategory);
    setHybridServiceDeliveryMethod(sample.serviceDeliveryMethod);
    setHybridServicePriceOrPackages(sample.servicePriceOrPackages);
    setBrandedMockupUrl(null);
    setUseBrandedMockup(false);

    triggerToast(`Loaded sample hybrid business: "${sample.brandName}"`);
  };

  // Run Real AI Product Recognition on Uploaded Image
  const runProductRecognition = async (base64: string, hint?: string) => {
    setIsAnalyzingImage(true);
    setRecognitionError(null);
    setRecognitionConfirmed(false);
    setRecognizedContext(null);
    triggerToast('AI Product Recognition Engine analyzing image taxonomy...');

    try {
      const resData = await postJsonApi<{ success: boolean; data?: ProductRecognitionResult }>(
        '/api/recognize-product',
        {
          imageBase64: base64,
          userHint: hint || productName || description,
        }
      );

      if (resData.success && resData.data?.productIdentified) {
        setProductRecognition(resData.data);
        setRecognitionError(null);
        triggerToast(`Product Identified: "${resData.data.productIdentified}". Please review & confirm.`);
      } else {
        setRecognitionError(
          'Product recognition returned incomplete results. You can retry the scan or enter details manually.'
        );
        triggerToast('Incomplete recognition response — retry or enter manually.');
      }
    } catch (err) {
      console.error('Product recognition failed:', err);
      const errMsg = getFriendlyErrorMessage(
        err,
        'AI product recognition could not complete right now.'
      );
      setRecognitionError(errMsg);
      triggerToast('Product scan failed — retry or enter product details manually.');
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  // Sample Selection Handlers
  const handleSelectSample = (sample: SampleProduct) => {
    setSelectedSampleId(sample.id);

    // Populate suggested brand name only if empty or currently showing another sample's suggestion,
    // so a user's manually entered business/brand name is never overwritten unexpectedly.
    const knownSampleBrandNames = new Set(
      [...SAMPLE_PRODUCTS, ...NIGERIAN_BEVERAGE_SAMPLES]
        .map((s) => (s.suggestedBrandName || '').trim().toLowerCase())
        .filter(Boolean)
    );
    setCustomBrandName((prev) => {
      const trimmed = prev.trim();
      if (!trimmed || knownSampleBrandNames.has(trimmed.toLowerCase())) {
        return sample.suggestedBrandName || '';
      }
      return prev;
    });

    setCategory(sample.category);
    setProductName(sample.productName);
    setDescription(sample.description);
    setPrice(sample.priceRange);
    setProductTargetAudience(
      sample.targetAudience || 'Nigerian buyers and diaspora market'
    );
    const nextSampleRegions = Array.isArray(sample.selectedRegions) ? sample.selectedRegions : [];
    setSelectedRegions(nextSampleRegions);
    setTargetLocation(
      nextSampleRegions.length > 0
        ? formatRegionSummary(nextSampleRegions)
        : sample.targetLocation || ''
    );
    setImagePreview(sample.imageUrl || null);
    setBrandedMockupUrl(null);
    setUseBrandedMockup(false);
    if (sample.recognition && sample.imageUrl) {
      setProductRecognition(sample.recognition);
      setRecognitionConfirmed(true);
      setRecognizedContext({
        imageUrl: sample.imageUrl,
        productName: sample.productName,
        productDescription: sample.description,
        category: String(sample.category || ''),
        recognitionProductIdentified: sample.recognition.productIdentified,
      });
    } else {
      setProductRecognition(null);
      setRecognitionConfirmed(false);
      setRecognizedContext(null);
    }
  };

  const handleSelectExistingSample = (sample: SampleExistingBrand) => {
    setSelectedExistingSampleId(sample.id);
    setExistingBrandInput({
      existingBrandName: sample.name,
      logoUrl: sample.logoUrl,
      currentColours: sample.colours,
      existingTagline: sample.tagline,
      businessDescription: sample.description,
      targetCustomers: sample.targetCustomers,
      improvementGoals: sample.improvementGoals,
      customImprovementNote: '',
      rebrandRequested: false,
    });
    const nextExistingRegions = Array.isArray(sample.selectedRegions) ? sample.selectedRegions : [];
    setSelectedRegions(nextExistingRegions);
    setTargetLocation(nextExistingRegions.length > 0 ? formatRegionSummary(nextExistingRegions) : '');
    setCategory(sample.category);
    setImagePreview(sample.logoUrl);
    setRecognizedContext(null);
    setBrandedMockupUrl(null);
    setUseBrandedMockup(false);
    if (sample.recognition) {
      setProductRecognition(sample.recognition);
      setRecognitionConfirmed(true);
    } else {
      setProductRecognition(null);
      setRecognitionConfirmed(false);
    }
  };

  const handleImageChange = (base64: string | null) => {
    setImagePreview(base64);
    setSelectedSampleId(null);
    setProductRecognition(null);
    setRecognitionConfirmed(false);
    setRecognizedContext(null);
    setRecognitionError(null);
    setBrandedMockupUrl(null);
    setUseBrandedMockup(false);
    if (base64) {
      runProductRecognition(base64);
    }
  };

  // User confirms the AI product identification
  const handleConfirmRecognition = (confirmed: ProductRecognitionResult) => {
    setProductRecognition(confirmed);
    setRecognitionConfirmed(true);

    if (businessType === 'hybrid') {
      const nextHybridName = confirmed.productIdentified;
      const nextHybridCategory = confirmed.productCategory;
      const nextHybridDescription =
        !hybridProductDescription ||
        hybridProductDescription.trim().length === 0 ||
        hybridProductDescription.startsWith('Product photograph')
          ? `${confirmed.visualDescription} Designed for ${confirmed.likelyTargetAudience}.`
          : hybridProductDescription;
      setHybridProductName(nextHybridName);
      setHybridProductCategory(nextHybridCategory);
      setHybridProductDescription(nextHybridDescription);
      const activeHybridImg = hybridProductImage || imagePreview || '';
      setRecognizedContext(
        activeHybridImg
          ? {
              imageUrl: activeHybridImg,
              productName: nextHybridName,
              productDescription: nextHybridDescription,
              category: String(nextHybridCategory || ''),
              recognitionProductIdentified: confirmed.productIdentified,
            }
          : null
      );
    } else {
      const nextProductName = confirmed.productIdentified;
      const nextCategory = confirmed.productCategory;
      const nextDescription =
        !description || description.trim().length === 0 || description.startsWith('Product photograph')
          ? `${confirmed.visualDescription} Designed for ${confirmed.likelyTargetAudience}.`
          : description;

      setProductName(nextProductName);
      setCategory(nextCategory);
      if (confirmed.likelyTargetAudience) {
        setProductTargetAudience(confirmed.likelyTargetAudience);
      }
      setDescription(nextDescription);
      setRecognizedContext(
        imagePreview
          ? {
              imageUrl: imagePreview,
              productName: nextProductName,
              productDescription: nextDescription,
              category: String(nextCategory || ''),
              recognitionProductIdentified: confirmed.productIdentified,
            }
          : null
      );
    }
    triggerToast(`Product confirmed: "${confirmed.productIdentified}". Brand Identity Generation is unlocked!`);
  };

  const handleSelectBrandName = (option: BrandNameOption) => {
    setActiveBrandName(option.name);
    setActiveTagline(option.tagline);
    if (result) {
      setResult({
        ...result,
        brandIdentity: {
          ...result.brandIdentity,
          selectedName: option.name,
          selectedTagline: option.tagline,
        },
      });
    }
    triggerToast(`Set "${option.name}" as your active brand!`);
  };

  // Mode 1: Create a New Brand Submission (Supports Product, Service & Hybrid Businesses)
  const executeNewBrandGeneration = async () => {
    // Guard: For physical products, require confirmation of AI product recognition if active
    if (businessType === 'product' && productRecognition && !recognitionConfirmed) {
      triggerToast('Please click "Confirm Product & Continue" above before generating your brand identity.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLastFailedAction(null);
    setPaletteError(null);
    setCaptionsError(null);
    setKitExportError(null);
    setLoadingStepText(
      'Crafting your brand identity, visual direction & market-ready growth strategy...'
    );

    try {
      const payload =
        businessType === 'hybrid'
          ? {
              businessType: 'hybrid',
              brandName: customBrandName,
              customBrandName,
              industryCategory: hybridIndustryCategory,
              productName: hybridProductName,
              productDescription: hybridProductDescription,
              productPrice: hybridProductPrice,
              productCategory: hybridProductCategory,
              serviceName: hybridServiceName,
              serviceDescription: hybridServiceDescription,
              serviceCategory: hybridServiceCategory,
              serviceDeliveryMethod: hybridServiceDeliveryMethod,
              servicePriceOrPackages: hybridServicePriceOrPackages,
              targetCustomers: serviceTargetCustomers,
              targetAudience: serviceTargetCustomers,
              businessLocation: serviceBusinessLocation,
              selectedRegions,
              targetLocation,
              brandTone,
              imageBase64: hybridProductImage || imagePreview,
              imageMimeType: 'image/jpeg',
            }
          : businessType === 'service'
          ? {
              businessType: 'service',
              brandName: customBrandName,
              customBrandName,
              serviceDescription,
              specificServices,
              category: customServiceCategory.trim() || serviceCategory,
              targetCustomers: serviceTargetCustomers,
              targetAudience: serviceTargetCustomers,
              businessLocation: serviceBusinessLocation,
              deliveryMethod: serviceDeliveryMethod,
              rateCardOrPricing,
              targetLocation,
              selectedRegions,
              priceRange: rateCardOrPricing,
              brandTone,
              imageBase64: serviceLogoUrl || imagePreview,
              imageMimeType: 'image/jpeg',
            }
          : {
              businessType: 'product',
              brandName: customBrandName,
              customBrandName,
              productName,
              productDescription: description,
              category,
              targetAudience: productTargetAudience || 'Nigerian buyers and diaspora market',
              targetLocation,
              selectedRegions,
              priceRange: price,
              brandTone,
              imageBase64: imagePreview,
              imageMimeType: 'image/jpeg',
            };

      const resData = await postJsonApi<{ success: boolean; data?: BrandStudioResult }>(
        '/api/generate-brand',
        payload
      );

      if (
        resData.success &&
        resData.data &&
        resData.data.brandIdentity &&
        Array.isArray(resData.data.brandNames) &&
        resData.data.marketingCaptions
      ) {
        const finalResult = resData.data;

        // If the user entered a custom brand name, preserve that exact name throughout the generated brand identity
        if (customBrandName && customBrandName.trim()) {
          const chosenName = customBrandName.trim();
          finalResult.brandIdentity.selectedName = chosenName;
          if (Array.isArray(finalResult.brandNames) && finalResult.brandNames.length > 0) {
            finalResult.brandNames[0].name = chosenName;
            finalResult.brandNames[0].isRecommended = true;
          }
        }

        setResult(finalResult);
        setGeneratedPromoImages([]);
        setActiveBrandName(finalResult.brandIdentity.selectedName);
        setActiveTagline(finalResult.brandIdentity.selectedTagline);

        // Highlight optimal Brand Kit tab based on business type and open Brand Studio Kit
        if (businessType === 'hybrid') {
          setBrandKitTab('hybrid');
        } else if (businessType === 'service' && finalResult.serviceStrategy) {
          setBrandKitTab('service');
        } else {
          setBrandKitTab('names');
        }
        setMarketingTab('captions');
        setActiveNav('brand-kit');

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#059669', '#f59e0b', '#10b981', '#d97706'],
        });

        triggerToast(
          businessType === 'hybrid'
            ? 'Unified Hybrid Brand Kit & Bundles created!'
            : businessType === 'service'
            ? 'Service Brand Kit & Booking Suite created!'
            : 'New Brand Kit successfully created!'
        );
      } else {
        throw new Error('The AI returned an incomplete Brand Kit. Please retry to generate all assets cleanly.');
      }
    } catch (err: any) {
      console.error('Error generating brand assets:', err);
      const errMsg = getFriendlyErrorMessage(
        err,
        'Could not generate your brand assets right now. Please wait a moment and try again.'
      );
      setError(errMsg);
      setLastFailedAction('new');
      triggerToast('Brand generation did not complete — see error message.');
    } finally {
      setIsLoading(false);
      setLoadingStepText('');
    }
  };

  const handleSubmitNewBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeNewBrandGeneration();
  };

  // Mode 2: Improve My Existing Brand Submission
  const executeExistingBrandAudit = async () => {
    // Guard: Only after the user confirms the product identification should the application proceed to brand identity generation.
    if (productRecognition && !recognitionConfirmed) {
      triggerToast('Please click "Confirm Product & Continue" on the product recognition card before proceeding.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLastFailedAction(null);
    setLoadingStepText(
      'Crafting your brand identity, visual direction & market-ready growth strategy...'
    );

    try {
      const resData = await postJsonApi<{ success: boolean; data?: BrandImprovementResult }>(
        '/api/improve-brand',
        {
          existingBrandName: existingBrandInput.existingBrandName,
          currentColours: existingBrandInput.currentColours,
          existingTagline: existingBrandInput.existingTagline,
          businessDescription: existingBrandInput.businessDescription,
          targetCustomers: existingBrandInput.targetCustomers,
          selectedRegions,
          targetLocation,
          improvementGoals: existingBrandInput.improvementGoals,
          customImprovementNote: existingBrandInput.customImprovementNote,
          logoBase64: existingBrandInput.logoUrl,
          logoMimeType: 'image/png',
          rebrandRequested: existingBrandInput.rebrandRequested,
        }
      );

      if (resData.success && resData.data?.brandAudit && resData.data?.recommendations) {
        setImprovementResult(resData.data);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#059669', '#f59e0b', '#10b981', '#d97706'],
        });
        triggerToast('Brand audit & recommendations ready for your review!');
      } else {
        throw new Error('The AI returned an incomplete brand audit. Please retry to receive all 6 strategic recommendations.');
      }
    } catch (err: any) {
      console.error('Error analyzing existing brand:', err);
      const errMsg = getFriendlyErrorMessage(
        err,
        'Could not complete the brand audit right now. Your inputs were preserved — please try again.'
      );
      setError(errMsg);
      setLastFailedAction('improve');
      triggerToast('Brand audit did not complete — see error message.');
    } finally {
      setIsLoading(false);
      setLoadingStepText('');
    }
  };

  const handleSubmitExistingBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeExistingBrandAudit();
  };

  // Bridge: User reviews recommendations and clicks "Apply Approved Changes to Studio"
  const handleApplyApprovedChanges = (approvedSections: {
    positioning: boolean;
    consistency: boolean;
    visualIdentity: boolean;
    messaging: boolean;
    marketing: boolean;
    socialMedia: boolean;
  }) => {
    if (!improvementResult) return;

    const brandName = existingBrandInput.existingBrandName || 'My Brand';
    const recs = improvementResult.recommendations;
    const recommendedTagline = recs.brandMessagingAndTagline.recommendedTagline;
    const effectiveLocationSummary =
      selectedRegions.length > 0
        ? formatRegionSummary(selectedRegions)
        : targetLocation.trim() || 'Nigeria';
    const primaryMarketRegion =
      selectedRegions[0] || targetLocation.trim() || 'Nigeria';
    const cleanRegionTag = primaryMarketRegion.toLowerCase().includes('abuja')
      ? '#AbujaVendor'
      : primaryMarketRegion === 'Nigeria' ||
        primaryMarketRegion.toLowerCase().includes('nationwide')
      ? '#NigeriaVendor'
      : `#${primaryMarketRegion.replace(/[^A-Za-z0-9]/g, '')}Vendor`;

    // Build standard BrandStudioResult from approved recommendations
    const upgradedStudioResult: BrandStudioResult = {
      visualAnalysis: improvementResult.brandAudit.summary,
      brandNames: [
        {
          name: brandName,
          tagline: recommendedTagline,
          meaning: `Preserved established brand name with elevated market positioning. ${recs.brandMessagingAndTagline.taglineRationale}`,
          targetVibe: 'Preserved & Elevated Brand',
          isRecommended: true,
          recommendationRationale: 'ESTABLISHED IDENTITY: Preserving this brand name protects customer equity, recognition, and goodwill while upgrading all visual and messaging touchpoints.',
        },
        ...recs.brandMessagingAndTagline.taglineOptions.map((opt, i) => ({
          name: brandName,
          tagline: opt.tagline,
          meaning: `Alternative messaging angle: ${opt.angle}`,
          targetVibe: opt.angle,
          isRecommended: false,
          recommendationRationale: opt.angle,
        })),
      ],
      brandIdentity: {
        selectedName: brandName,
        selectedTagline: recommendedTagline,
        strongestNameRationale:
          'Preserved established brand name to protect customer loyalty and market equity while implementing elevated positioning and consistency.',
        colorPalette: recs.improvedVisualIdentity.refinedColorPalette,
        positioning: {
          targetAudience: recs.brandPositioning.refinedTargetAudience,
          customerNeedsAndMotivations: recs.brandPositioning.customerNeedsAndMotivations,
          brandPersonality: [
            { trait: 'Dependable & Grounded', rationale: 'Builds on established reputation and customer trust.' },
            { trait: 'Polished & Professional', rationale: 'Eliminates informal vendor friction.' },
            { trait: 'Proudly Nigerian', rationale: 'Celebrates local craftsmanship and authenticity.' },
            { trait: 'Transparent & Respectful', rationale: 'States clear pricing and swift dispatch.' },
          ],
          uniqueSellingProposition: recs.brandPositioning.refinedUSP,
          marketDifferentiation: recs.brandPositioning.marketDifferentiation,
          brandPromise: `Consistent, master-finished quality and honest service delivered right to your doorstep.`,
          brandVoice: {
            tone: 'Warm, respectful, polished, and culturally confident.',
            vocabulary: ['Distinction', 'Verified quality', 'Dependable', 'Handcrafted', 'Naija pride', 'Carefully finished'],
            communicationDos: [
              'State prices upfront in Naira with delivery timelines',
              'Send pre-dispatch verification photos or videos on WhatsApp',
              'Address clients with polite warmth and prompt responses',
            ],
            communicationDonts: [
              'Never hide prices with "DM for price" friction',
              'Never deliver orders in flimsy unbranded polythene bags',
              'Avoid vague delivery promises without tracking details',
            ],
          },
        },
        marketStrategy: {
          priceTierAnalysis: recs.marketingStrategy.priceTierAndPerceptionStrategy,
          trustBuildingTactics: recs.marketingStrategy.trustBuildingTactics,
          channelStrategy: recs.marketingStrategy.omnichannelPlan,
        },
        qualityAudit: {
          photoObservations: 'Brand audit evaluated existing logo, established color palette, and business description.',
          userSuppliedData: existingBrandInput.businessDescription,
          groundedClaimsPolicy: 'AUDIT VERIFIED: Recommendations preserve authentic business capabilities and avoid unverified claims.',
          cohesionScore: 99,
          consistencyReview: 'All approved recommendations are synchronized across visual palette, positioning, and content calendar.',
          pitfallsToAvoid: recs.brandConsistency.consistencyGaps,
          packagingAndDisplayAdvice: recs.improvedVisualIdentity.packagingUpgradeAdvice,
        },
        typographyRecommendation: recs.improvedVisualIdentity.typographyUpgrade,
        idealCustomerPersona: {
          name: 'The Loyal Nigerian Shopper',
          ageRange: '26 - 45 years old',
          location: effectiveLocationSummary,
          painPoint: 'Tired of informal vendors who fail to deliver on promises or produce inconsistent items.',
          whyTheyBuy: 'Appreciates verified durability, transparent pricing, and polished customer care.',
        },
      },
      marketingCaptions: {
        english: [
          ...recs.socialMediaContent.revampedEnglishCaptions,
          {
            title: 'Customer Trust & Longevity',
            hook: 'Why our loyal customers stay with us year after year. 🌿✨',
            body: `At ${brandName}, quality is not an accident—it’s our daily commitment. Hand-finished, carefully inspected, and delivered with pride across ${effectiveLocationSummary}.`,
            callToAction: 'Chat our WhatsApp catalog now to place your order.',
            hashtags: ['#LoyalCustomers', '#MadeInNigeria', cleanRegionTag, '#QualityFirst'],
          },
        ],
        pidgin: [
          ...recs.socialMediaContent.revampedPidginCaptions,
          {
            title: 'Everyday Value ("Better Quality")',
            hook: 'Quality wey go make you smile every time! 🇳🇬🔥',
            body: `We dey make sure say any item wey leave our studio reach your hand na pure grade one. No cutting corners!`,
            callToAction: 'Send us message for WhatsApp sharp sharp!',
            hashtags: ['#NaijaVendor', '#NoCarryLast', '#OriginalBrand'],
          },
        ],
      },
      advertisingConcepts: {
        instagramCarousel: {
          title: 'The Brand Elevation Storyboard',
          slide1Hook: `Slide 1: "The story behind ${brandName} and why we never compromise on quality."`,
          slide2Value: 'Slide 2: Split screen showing detailed craftsmanship, reinforced seams, and premium finishing.',
          slide3SocialProof: 'Slide 3: Real customer WhatsApp reviews and happy buyer photos.',
          slide4CTA: 'Slide 4: Upfront pricing in ₦ + Click link in bio to chat directly on WhatsApp.',
        },
        tiktokReelConcept: {
          hookVisual: 'Close-up ASMR packaging of an order being neatly wrapped in tissue paper and sealed with branded sticker.',
          audioSuggestion: 'Warm trending Afrobeats instrumental (mid-tempo, relaxing, premium vibe).',
          script15s: `0-4s: "Packing an order for a lovely customer in ${primaryMarketRegion}!"\n4-8s: Quick inspection of the product details.\n8-12s: Spritz of room scent, packing note added.\n12-15s: "Order yours via the link in bio!"`,
          onScreenText: `"${brandName}" → "Handcrafted Quality" → "Delivering to ${effectiveLocationSummary}"`,
        },
        whatsappStatusSequence: recs.socialMediaContent.whatsAppStatusCampaign,
        promoOfferIdeas: [
          'The "Loyal Customer Thank You" — 10% discount voucher on next order for repeat WhatsApp clients.',
          `The "Fast Dispatch & Waybill" weekend promotion for ${effectiveLocationSummary} on orders over ₦25,000.`,
          'The "Refer-Your-Padi" WhatsApp referral incentive with airtime reward.',
        ],
      },
    };

    setResult(upgradedStudioResult);
    setActiveBrandName(brandName);
    setActiveTagline(recommendedTagline);
    setProductName(brandName);
    setGeneratedPromoImages([]);
    setKitExportError(null);

    // Switch active Brand Kit view to Identity & Strategy
    setBrandKitTab('identity');
    setMarketingTab('captions');
    setActiveNav('brand-kit');

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#059669', '#f59e0b', '#10b981', '#d97706'],
    });

    triggerToast(`Approved improvements applied to ${brandName}!`);
  };

  const handlePromoImageGenerated = (image: GeneratedPromoImage) => {
    setGeneratedPromoImages((prev) => {
      const existingIdx = prev.findIndex((p) => p.fileName === image.fileName);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = image;
        return updated;
      }
      return [...prev, image];
    });
    triggerToast(`Saved "${image.fileName}" to Complete Brand Kit!`);
  };

  const handleExportCompleteBrandKit = async () => {
    if (!result) return;
    setIsExportingKit(true);
    setKitExportError(null);

    try {
      const offeringName =
        businessType === 'hybrid'
          ? hybridProductName || hybridServiceName
          : businessType === 'service'
          ? specificServices || serviceCategory
          : productName || activeBrandName;

      const { zipFileName, includedFiles } = await exportCompleteBrandKitZip(result, {
        context: { productName: offeringName, serviceName: hybridServiceName || specificServices },
        promoImages: generatedPromoImages,
      });
      triggerToast(`Exported ${zipFileName} (${includedFiles.length} files)!`);
    } catch (err: any) {
      console.error('Complete Brand Kit export failed:', err);
      const errMsg = err?.message || 'Failed to export Complete Brand Kit ZIP. Please try again.';
      setKitExportError(errMsg);
      triggerToast('Brand Kit export failed — see error notice.');
    } finally {
      setIsExportingKit(false);
    }
  };

  const buildFormSnapshot = (): ProjectFormSnapshot => ({
    customBrandName,
    category: String(category || ''),
    productName,
    description,
    price,
    selectedBadge,
    backdropTheme,
    targetLocation,
    selectedRegions,
    brandTone,
    serviceCategory: String(serviceCategory || ''),
    customServiceCategory,
    serviceDescription,
    specificServices,
    serviceTargetCustomers,
    serviceBusinessLocation,
    serviceDeliveryMethod,
    rateCardOrPricing,
    hybridIndustryCategory,
    hybridProductName,
    hybridProductDescription,
    hybridProductPrice,
    hybridProductCategory,
    hybridServiceName,
    hybridServiceDescription,
    hybridServiceCategory,
    hybridServiceDeliveryMethod,
    hybridServicePriceOrPackages,
    existingBrandName: existingBrandInput.existingBrandName,
    currentColours: existingBrandInput.currentColours,
    existingTagline: existingBrandInput.existingTagline,
    existingBusinessDescription: existingBrandInput.businessDescription,
    existingTargetCustomers: existingBrandInput.targetCustomers,
    improvementGoals: existingBrandInput.improvementGoals,
    customImprovementNote: existingBrandInput.customImprovementNote,
    rebrandRequested: existingBrandInput.rebrandRequested,
  });

  const handleSaveProject = async (saveAsNew = false) => {
    if (!result) return;
    setSaveProjectError(null);
    setLastSavedNotice(null);

    if (!user) {
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
      triggerToast('Log in or create a free account to save this project to Cloud Firestore.');
      return;
    }

    if (!user.emailVerified) {
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
      triggerToast('Please verify your email address before saving projects.');
      return;
    }

    const effectiveBusinessType: BusinessType =
      result.businessType ||
      (studioMode === 'improve'
        ? existingBrandInput.businessType || 'product'
        : businessType);

    const effectiveBrandName = (
      activeBrandName ||
      result.brandIdentity.selectedName ||
      customBrandName ||
      existingBrandInput.existingBrandName ||
      productName ||
      'Untitled SME Brand'
    ).trim();

    const effectiveCategory =
      studioMode === 'improve'
        ? String(category || 'Established SME')
        : effectiveBusinessType === 'hybrid'
        ? hybridIndustryCategory || hybridProductCategory
        : effectiveBusinessType === 'service'
        ? customServiceCategory.trim() || String(serviceCategory)
        : String(category || 'General SME');

    const effectivePrice =
      effectiveBusinessType === 'hybrid'
        ? `${hybridProductPrice}${hybridServicePriceOrPackages ? ` / ${hybridServicePriceOrPackages}` : ''}`
        : effectiveBusinessType === 'service'
        ? rateCardOrPricing
        : price;

    const syncedResult: BrandStudioResult = {
      ...result,
      businessType: effectiveBusinessType,
      brandIdentity: {
        ...result.brandIdentity,
        selectedName: effectiveBrandName,
        selectedTagline: activeTagline || result.brandIdentity.selectedTagline,
      },
    };

    const promoRefs: PromoImageRefMetadata[] = generatedPromoImages.map((img) => ({
      fileName: img.fileName,
      label: 'Generated Session Promotional Flyer (export locally via PNG/ZIP)',
      createdAtIso: new Date().toISOString(),
    }));

    setIsSavingProject(true);
    try {
      if (activeProjectId && !saveAsNew) {
        const updates: UpdateProjectInput = {
          studioMode,
          businessType: effectiveBusinessType,
          businessName: effectiveBrandName,
          businessCategory: effectiveCategory,
          selectedRegions,
          targetLocation,
          brandTone,
          priceRange: effectivePrice,
          productDescription:
            studioMode === 'improve'
              ? existingBrandInput.businessDescription
              : effectiveBusinessType === 'hybrid'
              ? hybridProductDescription
              : description,
          serviceDescription:
            effectiveBusinessType === 'hybrid'
              ? hybridServiceDescription
              : serviceDescription,
          formSnapshot: buildFormSnapshot(),
          brandResult: syncedResult,
          promoImageRefs: promoRefs,
        };
        await updateSavedProject(activeProjectId, updates);

        setSavedProjects((prev) => {
          const updatedList = prev.map((proj) =>
            proj.id === activeProjectId
              ? {
                  ...proj,
                  ...updates,
                  updatedAtMs: Date.now(),
                }
              : proj
          );
          return [...updatedList].sort((a, b) => (b.updatedAtMs || 0) - (a.updatedAtMs || 0));
        });

        setLastSavedNotice(`Changes saved to "${effectiveBrandName}" in Cloud Firestore.`);
        triggerToast(`Updated saved project "${effectiveBrandName}"!`);
      } else {
        const created = await createSavedProject(user.uid, user.email || '', {
          studioMode,
          businessType: effectiveBusinessType,
          businessName: effectiveBrandName,
          businessCategory: effectiveCategory,
          selectedRegions,
          targetLocation,
          brandTone,
          priceRange: effectivePrice,
          productDescription:
            studioMode === 'improve'
              ? existingBrandInput.businessDescription
              : effectiveBusinessType === 'hybrid'
              ? hybridProductDescription
              : description,
          serviceDescription:
            effectiveBusinessType === 'hybrid'
              ? hybridServiceDescription
              : serviceDescription,
          formSnapshot: buildFormSnapshot(),
          brandResult: syncedResult,
          promoImageRefs: promoRefs,
        });
        setActiveProjectId(created.id);
        setSavedProjects((prev) => [created, ...prev]);
        setLastSavedNotice(`Saved "${effectiveBrandName}" to your Customer Dashboard.`);
        triggerToast(`Saved "${effectiveBrandName}" to Cloud Firestore!`);
      }
    } catch (err) {
      const msg = parseFriendlyFirestoreError(err, 'Could not save this project to Cloud Firestore.');
      setSaveProjectError(msg);
      triggerToast('Save failed — check notice below.');
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleReopenProject = (project: SavedBrandProject) => {
    const snap = project.formSnapshot || {};
    const targetMode: StudioMode = project.studioMode === 'improve' ? 'improve' : 'create';
    const targetBizType: BusinessType =
      project.businessType === 'service' || project.businessType === 'hybrid'
        ? project.businessType
        : 'product';

    setStudioMode(targetMode);
    setBusinessType(targetBizType);
    setCustomBrandName(snap.customBrandName ?? project.businessName ?? '');
    setCategory((snap.category as ProductCategory) || (project.businessCategory as ProductCategory) || 'fashion');
    setProductName(snap.productName || project.businessName || '');
    setDescription(snap.description || project.productDescription || '');
    setPrice(snap.price || project.priceRange || '');
    if (snap.selectedBadge) setSelectedBadge(snap.selectedBadge);
    if (snap.backdropTheme) setBackdropTheme(snap.backdropTheme);

    const restoredRegions = snap.selectedRegions ?? project.selectedRegions ?? [];
    setSelectedRegions(restoredRegions);
    setTargetLocation(
      snap.targetLocation ??
        project.targetLocation ??
        (restoredRegions.length > 0 ? formatRegionSummary(restoredRegions) : '')
    );
    setBrandTone(snap.brandTone ?? project.brandTone ?? 'Afro-Luxury & Regal');

    if (snap.serviceCategory !== undefined) setServiceCategory(snap.serviceCategory);
    if (snap.customServiceCategory !== undefined) setCustomServiceCategory(snap.customServiceCategory);
    setServiceDescription(snap.serviceDescription ?? project.serviceDescription ?? '');
    if (snap.specificServices !== undefined) setSpecificServices(snap.specificServices);
    if (snap.serviceTargetCustomers !== undefined) setServiceTargetCustomers(snap.serviceTargetCustomers);
    if (snap.serviceBusinessLocation !== undefined) setServiceBusinessLocation(snap.serviceBusinessLocation);
    if (snap.serviceDeliveryMethod !== undefined) setServiceDeliveryMethod(snap.serviceDeliveryMethod);
    if (snap.rateCardOrPricing !== undefined) setRateCardOrPricing(snap.rateCardOrPricing);

    if (snap.hybridIndustryCategory !== undefined) setHybridIndustryCategory(snap.hybridIndustryCategory);
    if (snap.hybridProductName !== undefined) setHybridProductName(snap.hybridProductName);
    if (snap.hybridProductDescription !== undefined) setHybridProductDescription(snap.hybridProductDescription);
    if (snap.hybridProductPrice !== undefined) setHybridProductPrice(snap.hybridProductPrice);
    if (snap.hybridProductCategory !== undefined) setHybridProductCategory(snap.hybridProductCategory);
    if (snap.hybridServiceName !== undefined) setHybridServiceName(snap.hybridServiceName);
    if (snap.hybridServiceDescription !== undefined) setHybridServiceDescription(snap.hybridServiceDescription);
    if (snap.hybridServiceCategory !== undefined) setHybridServiceCategory(snap.hybridServiceCategory);
    if (snap.hybridServiceDeliveryMethod !== undefined) setHybridServiceDeliveryMethod(snap.hybridServiceDeliveryMethod);
    if (snap.hybridServicePriceOrPackages !== undefined) setHybridServicePriceOrPackages(snap.hybridServicePriceOrPackages);

    if (targetMode === 'improve') {
      setExistingBrandInput((prev) => ({
        ...prev,
        businessType: targetBizType,
        existingBrandName: snap.existingBrandName || project.businessName || '',
        logoUrl: null,
        currentColours: snap.currentColours || '',
        existingTagline: snap.existingTagline || '',
        businessDescription: snap.existingBusinessDescription || project.productDescription || '',
        targetCustomers: snap.existingTargetCustomers || '',
        improvementGoals: snap.improvementGoals || prev.improvementGoals,
        customImprovementNote: snap.customImprovementNote || '',
        rebrandRequested: !!snap.rebrandRequested,
      }));
    }

    // Clear volatile session image buffers (not stored in Firestore Spark tier)
    setImagePreview(null);
    setServiceLogoUrl(null);
    setHybridProductImage(null);
    setProductRecognition(null);
    setRecognitionConfirmed(false);
    setRecognizedContext(null);
    setRecognitionError(null);
    setImprovementResult(null);
    setGeneratedPromoImages([]);
    setBrandedMockupUrl(null);
    setUseBrandedMockup(false);
    setError(null);
    setSaveProjectError(null);
    setLastSavedNotice(null);

    // Load saved Brand Kit directly without re-running AI generation
    setResult(project.brandResult);
    setActiveBrandName(project.brandResult?.brandIdentity?.selectedName || project.businessName);
    setActiveTagline(project.brandResult?.brandIdentity?.selectedTagline || '');
    setActiveProjectId(project.id);

    if (targetBizType === 'hybrid' && project.brandResult?.hybridMarketingKit) {
      setBrandKitTab('hybrid');
    } else if (targetBizType === 'service' && project.brandResult?.serviceStrategy) {
      setBrandKitTab('service');
    } else {
      setBrandKitTab('identity');
    }
    setMarketingTab('captions');

    setActiveNav('brand-kit');
    triggerToast(`Reopened "${project.businessName}" from Cloud Firestore!`);
  };

  const handleUpdateProjectDetailsFromDashboard = async (
    project: SavedBrandProject,
    updates: UpdateProjectInput
  ) => {
    await updateSavedProject(project.id, updates);

    setSavedProjects((prev) => {
      const next = prev.map((item) =>
        item.id === project.id
          ? {
              ...item,
              ...updates,
              updatedAtMs: Date.now(),
            }
          : item
      );
      return [...next].sort((a, b) => (b.updatedAtMs || 0) - (a.updatedAtMs || 0));
    });

    if (activeProjectId === project.id) {
      if (updates.businessName) {
        setCustomBrandName(updates.businessName);
        setActiveBrandName(updates.businessName);
      }
      if (updates.brandResult) {
        setResult(updates.brandResult);
        setActiveTagline(updates.brandResult.brandIdentity?.selectedTagline || '');
      }
      if (updates.selectedRegions !== undefined) {
        setSelectedRegions(updates.selectedRegions);
      }
      if (updates.targetLocation !== undefined) {
        setTargetLocation(updates.targetLocation);
      }
      if (updates.brandTone !== undefined) {
        setBrandTone(updates.brandTone);
      }
    }
  };

  const handleDeleteProjectFromDashboard = async (projectId: string) => {
    await deleteSavedProject(projectId);
    setSavedProjects((prev) => prev.filter((item) => item.id !== projectId));
    if (activeProjectId === projectId) {
      setActiveProjectId(null);
    }
  };

  const handleReset = () => {
    setCustomBrandName('');
    setProductName('');
    setDescription('');
    setProductTargetAudience('Nigerian buyers and diaspora market');
    setSelectedRegions(['Lagos']);
    setTargetLocation('Lagos');
    setServiceBusinessLocation('');
    setImagePreview(null);
    setSelectedSampleId(null);
    setSelectedExistingSampleId(null);
    setResult(null);
    setImprovementResult(null);
    setActiveBrandName('');
    setActiveTagline('');
    setActiveProjectId(null);
    setSaveProjectError(null);
    setLastSavedNotice(null);
    setError(null);
    setLastFailedAction(null);
    setRecognitionError(null);
    setPaletteError(null);
    setCaptionsError(null);
    setProductRecognition(null);
    setRecognitionConfirmed(false);
    setRecognizedContext(null);
    setGeneratedPromoImages([]);
    setBrandedMockupUrl(null);
    setUseBrandedMockup(false);
    setKitExportError(null);
    if (activeNav === 'brand-kit' || activeNav === 'marketing-assets') {
      setActiveNav(studioMode === 'improve' ? 'improve' : 'create');
    }
  };

  const handleSelectNav = (nav: WorkspaceNavId) => {
    setActiveNav(nav);
    setIsMobileNavOpen(false);
    if (nav === 'create') {
      setStudioMode('create');
    } else if (nav === 'improve') {
      setStudioMode('improve');
    }
  };

  const handleLoadDemo = () => {
    const targetMode = activeNav === 'improve' ? 'improve' : 'create';
    if (targetMode === 'create') {
      setStudioMode('create');
      if (businessType === 'hybrid') {
        const nextIndex = Math.floor(Math.random() * SAMPLE_HYBRID_BUSINESSES.length);
        handleSelectHybridSample(SAMPLE_HYBRID_BUSINESSES[nextIndex]);
      } else if (businessType === 'service') {
        const nextIndex = Math.floor(Math.random() * SAMPLE_SERVICE_BUSINESSES.length);
        handleSelectServiceSample(SAMPLE_SERVICE_BUSINESSES[nextIndex]);
      } else {
        const nextIndex = Math.floor(Math.random() * SAMPLE_PRODUCTS.length);
        handleSelectSample(SAMPLE_PRODUCTS[nextIndex]);
        triggerToast(`Loaded sample product: ${SAMPLE_PRODUCTS[nextIndex].productName}`);
      }
      if (activeNav !== 'create') {
        setActiveNav('create');
      }
    } else {
      setStudioMode('improve');
      const nextIndex = Math.floor(Math.random() * SAMPLE_EXISTING_BRANDS.length);
      handleSelectExistingSample(SAMPLE_EXISTING_BRANDS[nextIndex]);
      triggerToast(`Loaded sample business: ${SAMPLE_EXISTING_BRANDS[nextIndex].name}`);
      if (activeNav !== 'improve') {
        setActiveNav('improve');
      }
    }
  };

  const currentBadgeLabel =
    BADGES.find((b) => b.id === selectedBadge && b.id !== 'none')?.label || '';

  const activeBrandBanner = result && (
    <div className="space-y-4">
      <div className="bg-emerald-900 text-white p-5 sm:p-6 rounded-2xl border border-emerald-800/60 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-800 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Active Brand Kit: {result.brandIdentity.selectedName}
            </h4>
            <p className="text-xs sm:text-sm text-stone-200 mt-0.5 leading-relaxed">
              {result.visualAnalysis}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleSaveProject(false)}
            disabled={isSavingProject}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-950 bg-white hover:bg-stone-100 disabled:opacity-60 transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            {isSavingProject ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 text-emerald-700" />
            )}
            <span>
              {isSavingProject
                ? 'Saving...'
                : activeProjectId
                ? 'Save Changes'
                : 'Save Project'}
            </span>
          </button>

          {activeProjectId && (
            <button
              type="button"
              onClick={() => handleSaveProject(true)}
              disabled={isSavingProject}
              className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 border border-emerald-600/60 disabled:opacity-60 transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="Save as a separate new project copy"
            >
              <CopyPlus className="w-3.5 h-3.5" />
              <span>Save as New</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsSummaryOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-950 bg-amber-400 hover:bg-amber-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            View Full Brand Guide
          </button>

          <button
            type="button"
            onClick={handleExportCompleteBrandKit}
            disabled={isExportingKit}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 border border-emerald-500/40 disabled:opacity-60 transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            {isExportingKit ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Archive className="w-3.5 h-3.5" />
            )}
            <span>{isExportingKit ? 'Bundling Brand Kit...' : 'Export Complete Brand Kit'}</span>
          </button>
        </div>
      </div>

      {lastSavedNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
            <span>
              {lastSavedNotice}{' '}
              <span className="text-emerald-800/80">
                (Text brand kit &amp; strategy saved; download images/flyers locally via PNG or ZIP.)
              </span>
            </span>
          </div>
          {user && (
            <button
              type="button"
              onClick={() => setActiveNav('projects')}
              className="text-emerald-800 font-bold hover:underline cursor-pointer whitespace-nowrap"
            >
              View in My Projects
            </button>
          )}
        </div>
      )}

      {saveProjectError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{saveProjectError}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveProjectError(null)}
            className="text-rose-700 font-bold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {kitExportError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{kitExportError}</span>
          </div>
          <button
            type="button"
            onClick={() => setKitExportError(null)}
            className="text-rose-700 font-bold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex bg-stone-50 text-stone-900 selection:bg-emerald-600 selection:text-white">
      {/* Desktop Vertical Sidebar & Mobile Collapsible Drawer */}
      <WorkspaceSidebar
        activeNav={activeNav}
        onSelectNav={handleSelectNav}
        hasResult={!!result}
        activeBrandName={activeBrandName || result?.brandIdentity?.selectedName || ''}
        savedProjectsCount={savedProjects.length}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={handleCloseMobileNav}
        onOpenSummary={() => setIsSummaryOpen(true)}
        onOpenAuthModal={(tab = 'login') => {
          setAuthModalTab(tab);
          setIsAuthModalOpen(true);
        }}
        onLogoutSuccess={() => {
          setActiveProjectId(null);
          setSavedProjects([]);
          if (activeNav === 'projects') {
            setActiveNav('dashboard');
          }
          triggerToast('Signed out of SME Brand Studio.');
        }}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Compact SaaS Top Header */}
        <Header
          activeNav={activeNav}
          isMobileMenuOpen={isMobileNavOpen}
          onToggleMobileMenu={() => setIsMobileNavOpen((prev) => !prev)}
          onLoadDemo={handleLoadDemo}
          onReset={handleReset}
          onOpenSummary={() => setIsSummaryOpen(true)}
          hasResult={!!result}
          activeBrandName={activeBrandName || result?.brandIdentity?.selectedName}
          onOpenAuthModal={(tab = 'login') => {
            setAuthModalTab(tab);
            setIsAuthModalOpen(true);
          }}
          onOpenProjects={() => setActiveNav('projects')}
          onLogoutSuccess={() => {
            setActiveProjectId(null);
            setSavedProjects([]);
            if (activeNav === 'projects') {
              setActiveNav('dashboard');
            }
            triggerToast('Signed out of SME Brand Studio.');
          }}
        />

        {user && !user.emailVerified && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs text-amber-950 flex flex-wrap items-center justify-center gap-2">
            <span>
              Signed in as <strong>{user.email}</strong> — verify your email address to unlock AI generation and cloud project saving.
            </span>
            <button
              type="button"
              onClick={() => {
                setAuthModalTab('login');
                setIsAuthModalOpen(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer whitespace-nowrap"
            >
              Verify Email
            </button>
          </div>
        )}

        {/* Spacious Desktop Content Canvas */}
        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 pb-20 space-y-6">
          {/* 1. DASHBOARD HOMEPAGE */}
          {activeNav === 'dashboard' && (
            <DashboardHome
              result={result}
              activeBrandName={activeBrandName}
              activeTagline={activeTagline}
              selectedRegions={selectedRegions}
              savedProjects={savedProjects}
              isLoadingProjects={isLoadingProjects}
              onStartCreateBrand={(preferredType) => {
                if (preferredType) setBusinessType(preferredType);
                setStudioMode('create');
                setActiveNav('create');
              }}
              onStartImproveBrand={() => {
                setStudioMode('improve');
                setActiveNav('improve');
              }}
              onOpenBrandKit={() => setActiveNav('brand-kit')}
              onOpenMarketingAssets={() => setActiveNav('marketing-assets')}
              onOpenMyProjects={() => setActiveNav('projects')}
              onReopenProject={handleReopenProject}
              onLoadSampleAndCreate={(sample) => {
                setBusinessType('product');
                setStudioMode('create');
                handleSelectSample(sample);
                setActiveNav('create');
                triggerToast(`Loaded sample: ${sample.productName}`);
              }}
              onLoadDemo={handleLoadDemo}
              onOpenAuthModal={(tab = 'login') => {
                setAuthModalTab(tab);
                setIsAuthModalOpen(true);
              }}
            />
          )}

          {/* 2. CREATE NEW BRAND WORKFLOW */}
          {activeNav === 'create' && (
            <div className="w-full max-w-5xl mx-auto space-y-6">
              {/* Section Header + Active Kit Quick Jump */}
              <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900">
                    Create a New Brand
                  </h1>
                  <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                    Select your business model, complete the details below, and generate your Brand Studio Kit and Marketing Assets.
                  </p>
                </div>

                {result && (
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveNav('brand-kit')}
                      className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Palette className="w-3.5 h-3.5 text-emerald-700" />
                      <span>View Active Kit: {activeBrandName || result.brandIdentity.selectedName}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Business Model Selection */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                      Step 1: Select Your Business Model
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-stone-900">
                      Are you branding physical products, client services, or both?
                    </h3>
                  </div>
                  <span className="text-xs text-stone-500">
                    Tailored for Nigerian MSMEs
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setBusinessType('product');
                      triggerToast('Switched to Product-Based Business workflow');
                    }}
                    className={`p-4 rounded-xl text-left transition-colors cursor-pointer flex items-start gap-3 border-2 ${
                      businessType === 'product'
                        ? 'bg-emerald-50/80 border-emerald-700'
                        : 'bg-stone-50/70 hover:bg-stone-100 border-stone-200 text-stone-700'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        businessType === 'product'
                          ? 'bg-emerald-700 text-white'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-stone-900">
                        Product-Based
                      </div>
                      <p className="text-xs text-stone-600 mt-1 leading-snug">
                        Physical goods, fashion, skincare, packaged foods &amp; crafts with AI photo recognition.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBusinessType('service');
                      triggerToast('Switched to Service-Based Business workflow');
                    }}
                    className={`p-4 rounded-xl text-left transition-colors cursor-pointer flex items-start gap-3 border-2 ${
                      businessType === 'service'
                        ? 'bg-teal-50/80 border-teal-700'
                        : 'bg-stone-50/70 hover:bg-stone-100 border-stone-200 text-stone-700'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        businessType === 'service'
                          ? 'bg-teal-700 text-white'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-stone-900">
                        Service-Based
                      </div>
                      <p className="text-xs text-stone-600 mt-1 leading-snug">
                        Salons, consultants, caterers, logistics &amp; studios with booking suite &amp; rate card.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBusinessType('hybrid');
                      triggerToast('Switched to Hybrid Business (Products + Services) workflow');
                    }}
                    className={`p-4 rounded-xl text-left transition-colors cursor-pointer flex items-start gap-3 border-2 ${
                      businessType === 'hybrid'
                        ? 'bg-amber-50/80 border-amber-600'
                        : 'bg-stone-50/70 hover:bg-stone-100 border-stone-200 text-stone-700'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        businessType === 'hybrid'
                          ? 'bg-amber-600 text-white'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      <Wand2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-stone-900">
                        Hybrid (Products + Services)
                      </div>
                      <p className="text-xs text-stone-600 mt-1 leading-snug">
                        Businesses combining physical inventory retail with client appointments &amp; bundles.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Active Form */}
              {businessType === 'hybrid' ? (
                <HybridForm
                  brandName={customBrandName}
                  onBrandNameChange={setCustomBrandName}
                  industryCategory={hybridIndustryCategory}
                  onIndustryCategoryChange={setHybridIndustryCategory}
                  businessDescription={serviceDescription || description}
                  onBusinessDescriptionChange={(val) => {
                    setServiceDescription(val);
                    setDescription(val);
                  }}
                  targetCustomers={serviceTargetCustomers}
                  onTargetCustomersChange={setServiceTargetCustomers}
                  businessLocation={serviceBusinessLocation}
                  onBusinessLocationChange={setServiceBusinessLocation}
                  selectedRegions={selectedRegions}
                  onSelectedRegionsChange={setSelectedRegions}
                  targetLocationSummary={targetLocation}
                  onTargetLocationSummaryChange={setTargetLocation}
                  brandTone={brandTone}
                  onBrandToneChange={setBrandTone}
                  logoOrAssetUrl={imagePreview}
                  onLogoOrAssetChange={(url) => setImagePreview(url)}
                  productName={hybridProductName}
                  onProductNameChange={setHybridProductName}
                  productDescription={hybridProductDescription}
                  onProductDescriptionChange={setHybridProductDescription}
                  productPrice={hybridProductPrice}
                  onProductPriceChange={setHybridProductPrice}
                  productCategory={hybridProductCategory}
                  onProductCategoryChange={setHybridProductCategory}
                  productImageBase64={hybridProductImage}
                  onProductImageChange={(img) => {
                    setHybridProductImage(img);
                    setProductRecognition(null);
                    setRecognitionConfirmed(false);
                    setRecognizedContext(null);
                    setBrandedMockupUrl(null);
                    setUseBrandedMockup(false);
                    if (img) runProductRecognition(img, hybridProductName);
                  }}
                  productRecognition={productRecognition}
                  recognitionConfirmed={recognitionConfirmed}
                  onConfirmRecognition={handleConfirmRecognition}
                  onReScanProductImage={() => {
                    if (hybridProductImage) {
                      runProductRecognition(hybridProductImage, hybridProductName);
                    }
                  }}
                  recognitionError={recognitionError}
                  onDismissRecognitionError={() => setRecognitionError(null)}
                  isAnalyzingProductImage={isAnalyzingImage}
                  serviceName={hybridServiceName}
                  onServiceNameChange={setHybridServiceName}
                  serviceDescription={hybridServiceDescription}
                  onServiceDescriptionChange={setHybridServiceDescription}
                  serviceCategory={hybridServiceCategory}
                  onServiceCategoryChange={setHybridServiceCategory}
                  serviceDeliveryMethod={hybridServiceDeliveryMethod}
                  onServiceDeliveryMethodChange={setHybridServiceDeliveryMethod}
                  servicePriceOrPackages={hybridServicePriceOrPackages}
                  onServicePriceOrPackagesChange={setHybridServicePriceOrPackages}
                  onSubmit={handleSubmitNewBrand}
                  isLoading={isLoading}
                  onSelectSample={handleSelectHybridSample}
                  selectedSampleId={selectedHybridSampleId}
                />
              ) : businessType === 'product' ? (
                <section className="space-y-6">
                  <PhotoStudio
                    imagePreview={imagePreview}
                    onImageChange={handleImageChange}
                    selectedBadge={selectedBadge}
                    onBadgeChange={setSelectedBadge}
                    backdropTheme={backdropTheme}
                    onBackdropChange={setBackdropTheme}
                    isAnalyzingImage={isAnalyzingImage}
                    recognitionConfirmed={recognitionConfirmed}
                  />

                  {productRecognition && !recognitionConfirmed && (
                    <ProductRecognitionCard
                      recognition={productRecognition}
                      imagePreview={imagePreview}
                      onConfirm={handleConfirmRecognition}
                      onReScan={() => imagePreview && runProductRecognition(imagePreview)}
                      isScanning={isAnalyzingImage}
                    />
                  )}

                  <ProductForm
                    customBrandName={customBrandName}
                    onCustomBrandNameChange={setCustomBrandName}
                    brandName={customBrandName}
                    onBrandNameChange={setCustomBrandName}
                    category={category}
                    onCategoryChange={setCategory}
                    productName={productName}
                    onProductNameChange={setProductName}
                    description={description}
                    onDescriptionChange={setDescription}
                    price={price}
                    onPriceChange={setPrice}
                    targetLocation={targetLocation}
                    onTargetLocationChange={setTargetLocation}
                    selectedRegions={selectedRegions}
                    onSelectedRegionsChange={setSelectedRegions}
                    brandTone={brandTone}
                    onBrandToneChange={setBrandTone}
                    onSubmit={handleSubmitNewBrand}
                    isLoading={isLoading}
                    onSelectSample={handleSelectSample}
                    selectedSampleId={selectedSampleId}
                    recognition={productRecognition}
                    recognitionConfirmed={recognitionConfirmed}
                    recognitionError={recognitionError}
                    onRetryRecognition={() => imagePreview && runProductRecognition(imagePreview)}
                    onDismissRecognitionError={() => setRecognitionError(null)}
                    isAnalyzingImage={isAnalyzingImage}
                  />
                </section>
              ) : (
                <ServiceForm
                  brandName={customBrandName}
                  onBrandNameChange={setCustomBrandName}
                  category={serviceCategory}
                  onCategoryChange={setServiceCategory}
                  customCategory={customServiceCategory}
                  onCustomCategoryChange={setCustomServiceCategory}
                  serviceDescription={serviceDescription}
                  onServiceDescriptionChange={setServiceDescription}
                  specificServices={specificServices}
                  onSpecificServicesChange={setSpecificServices}
                  targetCustomers={serviceTargetCustomers}
                  onTargetCustomersChange={setServiceTargetCustomers}
                  businessLocation={serviceBusinessLocation}
                  onBusinessLocationChange={setServiceBusinessLocation}
                  selectedRegions={selectedRegions}
                  onSelectedRegionsChange={setSelectedRegions}
                  targetLocationSummary={targetLocation}
                  onTargetLocationSummaryChange={setTargetLocation}
                  deliveryMethod={serviceDeliveryMethod}
                  onDeliveryMethodChange={setServiceDeliveryMethod}
                  rateCardOrPricing={rateCardOrPricing}
                  onRateCardOrPricingChange={setRateCardOrPricing}
                  brandTone={brandTone}
                  onBrandToneChange={setBrandTone}
                  logoOrAssetUrl={serviceLogoUrl}
                  onLogoOrAssetChange={(url) => {
                    setServiceLogoUrl(url);
                    if (url) setImagePreview(url);
                  }}
                  onSubmit={handleSubmitNewBrand}
                  isLoading={isLoading}
                  onSelectSample={handleSelectServiceSample}
                  selectedSampleId={selectedServiceSampleId}
                />
              )}
            </div>
          )}

          {/* 3. IMPROVE EXISTING BRAND WORKFLOW */}
          {activeNav === 'improve' && (
            <section className="w-full max-w-5xl mx-auto space-y-6">
              <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900">
                    Improve Existing Brand
                  </h1>
                  <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                    Audit your established business, preserve customer recognition, and apply approved upgrades directly to your Brand Studio Kit.
                  </p>
                </div>

                {result && (
                  <button
                    type="button"
                    onClick={() => setActiveNav('brand-kit')}
                    className="self-start lg:self-auto px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Palette className="w-3.5 h-3.5 text-emerald-700" />
                    <span>View Active Kit: {activeBrandName || result.brandIdentity.selectedName}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <ExistingBrandForm
                input={existingBrandInput}
                onChange={(updated) => {
                  if (updated.logoUrl !== undefined && updated.logoUrl !== existingBrandInput.logoUrl) {
                    setRecognizedContext(null);
                    setBrandedMockupUrl(null);
                    setUseBrandedMockup(false);
                    if (updated.logoUrl) {
                      runProductRecognition(
                        updated.logoUrl,
                        existingBrandInput.existingBrandName || existingBrandInput.businessDescription
                      );
                    } else {
                      setProductRecognition(null);
                      setRecognitionConfirmed(false);
                    }
                  }
                  setExistingBrandInput((prev) => ({ ...prev, ...updated }));
                }}
                onSubmit={handleSubmitExistingBrand}
                isLoading={isLoading}
                onSelectSample={handleSelectExistingSample}
                selectedSampleId={selectedExistingSampleId}
                recognition={productRecognition}
                isAnalyzingImage={isAnalyzingImage}
                onConfirmRecognition={(confirmed) => {
                  setProductRecognition(confirmed);
                  setRecognitionConfirmed(true);
                  const nextExistingName = existingBrandInput.existingBrandName || confirmed.productIdentified;
                  const nextExistingDesc =
                    existingBrandInput.businessDescription ||
                    `${confirmed.visualDescription} Sector: ${confirmed.productCategory} (${confirmed.industry}).`;
                  setExistingBrandInput((prev) => ({
                    ...prev,
                    existingBrandName: prev.existingBrandName || confirmed.productIdentified,
                    targetCustomers: prev.targetCustomers || confirmed.likelyTargetAudience,
                    businessDescription:
                      prev.businessDescription ||
                      `${confirmed.visualDescription} Sector: ${confirmed.productCategory} (${confirmed.industry}).`,
                  }));
                  setRecognizedContext(
                    existingBrandInput.logoUrl
                      ? {
                          imageUrl: existingBrandInput.logoUrl,
                          productName: productName || activeBrandName || nextExistingName,
                          productDescription: description || nextExistingDesc,
                          category: String(category || confirmed.productCategory || ''),
                          recognitionProductIdentified: confirmed.productIdentified,
                        }
                      : null
                  );
                  triggerToast(`Product confirmed: "${confirmed.productIdentified}"! Brand improvement unlocked.`);
                }}
                recognitionConfirmed={recognitionConfirmed}
                onReScan={() => {
                  if (existingBrandInput.logoUrl) {
                    runProductRecognition(existingBrandInput.logoUrl, existingBrandInput.existingBrandName);
                  }
                }}
                recognitionError={recognitionError}
                onDismissRecognitionError={() => setRecognitionError(null)}
                selectedRegions={selectedRegions}
                onSelectedRegionsChange={setSelectedRegions}
                onTargetLocationChange={setTargetLocation}
              />

              {improvementResult && !isLoading && (
                <BrandImprovementReview
                  result={improvementResult}
                  existingBrandName={existingBrandInput.existingBrandName || 'Your Business'}
                  onApplyApprovedChanges={handleApplyApprovedChanges}
                  onCopyText={handleCopyText}
                />
              )}
            </section>
          )}

          {/* Shared Actionable Error Banner (Shown inside Create/Improve/Kit flows) */}
          {error && !isLoading && (activeNav === 'create' || activeNav === 'improve') && (
            <div className="w-full max-w-5xl mx-auto p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-rose-950">
                    {lastFailedAction === 'improve'
                      ? 'Brand Audit Could Not Be Completed'
                      : 'Error Generating Brand Assets'}
                  </h4>
                  <p className="text-xs sm:text-sm text-rose-900 leading-relaxed">{error}</p>
                  {(result || improvementResult) && (
                    <p className="text-[11px] font-semibold text-rose-800">
                      Your previously generated brand kit and form inputs have been preserved.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                {(!user || !user.emailVerified) && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalTab('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {!user ? 'Log In / Sign Up' : 'Verify Email'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    lastFailedAction === 'improve'
                      ? executeExistingBrandAudit()
                      : executeNewBrandGeneration()
                  }
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>
                    {lastFailedAction === 'improve' ? 'Retry Brand Audit' : 'Retry Brand Generation'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-800 hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Shared Loading State */}
          {isLoading && (activeNav === 'create' || activeNav === 'improve') && (
            <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl p-8 sm:p-12 border border-stone-200 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  Senior Nigerian Brand Strategist at Work
                </h3>
                <p className="text-sm text-emerald-800 font-semibold mt-1">
                  {loadingStepText ||
                    'Crafting your brand identity, visual direction & market-ready growth strategy...'}
                </p>
              </div>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                {studioMode === 'improve'
                  ? 'Analysing your business, audience & target markets to elevate positioning, visual identity & growth strategy.'
                  : 'Developing your brand positioning, visual identity, colour palette & marketing campaigns for your selected target markets.'}
              </p>
            </div>
          )}

          {/* 4. BRAND STUDIO KIT WORKSPACE */}
          {activeNav === 'brand-kit' &&
            (result ? (
              <section className="space-y-6 animate-in fade-in duration-200">
                {activeBrandBanner}

                {/* Brand Studio Kit Sub-Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl p-2 border border-stone-200">
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    <button
                      type="button"
                      onClick={() => setBrandKitTab('names')}
                      className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                        brandKitTab === 'names'
                          ? 'bg-emerald-800 text-white'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      <span>Brand Names &amp; Taglines</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBrandKitTab('identity')}
                      className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                        brandKitTab === 'identity'
                          ? 'bg-emerald-800 text-white'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                      }`}
                    >
                      <Palette className="w-4 h-4" />
                      <span>Strategy, Colour Palette &amp; Positioning</span>
                    </button>

                    {(result.businessType === 'hybrid' || result.hybridMarketingKit) && (
                      <button
                        type="button"
                        onClick={() => setBrandKitTab('hybrid')}
                        className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                          brandKitTab === 'hybrid'
                            ? 'bg-amber-600 text-white'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                        }`}
                      >
                        <Wand2 className="w-4 h-4" />
                        <span>Hybrid Bundles &amp; Cross-Selling</span>
                      </button>
                    )}

                    {(result.businessType === 'service' || result.serviceStrategy) && (
                      <button
                        type="button"
                        onClick={() => setBrandKitTab('service')}
                        className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                          brandKitTab === 'service'
                            ? 'bg-teal-800 text-white'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                        }`}
                      >
                        <Briefcase className="w-4 h-4" />
                        <span>Service Packages &amp; Booking</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveNav('marketing-assets')}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 hover:bg-emerald-50 inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 self-end sm:self-center"
                  >
                    <Megaphone className="w-3.5 h-3.5" />
                    <span>Open Marketing Assets</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {brandKitTab === 'names' && (
                  <BrandNamesSection
                    brandNames={result.brandNames}
                    activeBrandName={activeBrandName || result.brandIdentity.selectedName}
                    onSelectBrandName={handleSelectBrandName}
                    onCopyText={handleCopyText}
                  />
                )}

                {brandKitTab === 'identity' && (
                  <BrandIdentitySection
                    identity={result.brandIdentity}
                    onCopyText={handleCopyText}
                    onUpdatePalette={handleUpdatePalette}
                    onRegeneratePalette={handleRegeneratePalette}
                    isRegeneratingPalette={isRegeneratingPalette}
                    paletteError={paletteError}
                    onDismissPaletteError={() => setPaletteError(null)}
                  />
                )}

                {brandKitTab === 'hybrid' && (
                  <HybridMarketingSection
                    marketingKit={result.hybridMarketingKit}
                    brandName={activeBrandName || result.brandIdentity.selectedName}
                    productName={hybridProductName || productName || 'Signature Products'}
                    serviceName={hybridServiceName || specificServices || 'Signature Services'}
                    onCopyText={handleCopyText}
                  />
                )}

                {brandKitTab === 'service' && (
                  <ServiceStrategySection
                    strategy={result.serviceStrategy}
                    brandName={activeBrandName || result.brandIdentity.selectedName}
                    onCopyText={handleCopyText}
                  />
                )}
              </section>
            ) : (
              <WorkspaceEmptyKitNotice
                section="brand-kit"
                onGoToCreate={() => {
                  setStudioMode('create');
                  setActiveNav('create');
                }}
                onGoToImprove={() => {
                  setStudioMode('improve');
                  setActiveNav('improve');
                }}
                onGoToProjects={() => setActiveNav('projects')}
              />
            ))}

          {/* 5. MARKETING ASSETS WORKSPACE */}
          {activeNav === 'marketing-assets' &&
            (result ? (
              <section className="space-y-6 animate-in fade-in duration-200">
                {activeBrandBanner}

                {/* Marketing Assets Sub-Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl p-2 border border-stone-200">
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    <button
                      type="button"
                      onClick={() => setMarketingTab('captions')}
                      className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                        marketingTab === 'captions'
                          ? 'bg-emerald-800 text-white'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>English &amp; Pidgin Captions</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMarketingTab('ads')}
                      className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                        marketingTab === 'ads'
                          ? 'bg-emerald-800 text-white'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                      }`}
                    >
                      <Megaphone className="w-4 h-4" />
                      <span>Social Ad Campaigns</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMarketingTab('flyer')}
                      className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                        marketingTab === 'flyer'
                          ? 'bg-amber-600 text-white'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                      }`}
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Promo Flyer Studio</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveNav('brand-kit')}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 hover:bg-emerald-50 inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 self-end sm:self-center"
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>Brand Studio Kit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {marketingTab === 'captions' && (
                  <CaptionsSection
                    captions={result.marketingCaptions}
                    brandName={activeBrandName || result.brandIdentity.selectedName}
                    productName={productName || activeBrandName}
                    onCopyText={handleCopyText}
                    captionsError={captionsError}
                    onDismissCaptionsError={() => setCaptionsError(null)}
                    onRegenerateMore={async (theme) => {
                      setIsRegeneratingCaptions(true);
                      setCaptionsError(null);
                      try {
                        const data = await postJsonApi<{
                          success: boolean;
                          data?: { english?: any; pidgin?: any };
                        }>('/api/regenerate-captions', {
                          brandName: activeBrandName || result.brandIdentity.selectedName,
                          productName: productName || activeBrandName,
                          theme,
                          tone: brandTone,
                        });

                        if (data.success && data.data && (data.data.english || data.data.pidgin)) {
                          const newEnglish = data.data.english
                            ? [data.data.english, ...result.marketingCaptions.english.slice(0, 2)]
                            : result.marketingCaptions.english;
                          const newPidgin = data.data.pidgin
                            ? [data.data.pidgin, ...result.marketingCaptions.pidgin.slice(0, 2)]
                            : result.marketingCaptions.pidgin;
                          setResult({
                            ...result,
                            marketingCaptions: { english: newEnglish, pidgin: newPidgin },
                          });
                          if (!data.data.english || !data.data.pidgin) {
                            setCaptionsError(
                              `Only partial captions (${data.data.english ? 'English' : 'Pidgin'}) were returned. Existing captions were kept.`
                            );
                            triggerToast(`Partial "${theme}" caption added.`);
                          } else {
                            triggerToast(`New "${theme}" captions added!`);
                          }
                        } else {
                          setCaptionsError('Caption generation returned incomplete data.');
                          triggerToast('Captions unchanged — see retry notice.');
                        }
                      } catch (e) {
                        console.error('Caption regeneration error:', e);
                        setCaptionsError(
                          getFriendlyErrorMessage(
                            e,
                            'Could not generate new captions right now. Please try again.'
                          )
                        );
                        triggerToast('Caption generation failed — existing captions preserved.');
                      } finally {
                        setIsRegeneratingCaptions(false);
                      }
                    }}
                    isRegenerating={isRegeneratingCaptions}
                  />
                )}

                {marketingTab === 'ads' && (
                  <AdConceptsSection
                    concepts={result.advertisingConcepts}
                    brandName={activeBrandName || result.brandIdentity.selectedName}
                    productName={productName || activeBrandName}
                    onCopyText={handleCopyText}
                  />
                )}

                {marketingTab === 'flyer' && (
                  <SocialFlyerStudio
                    businessType={result.businessType || businessType}
                    brandName={activeBrandName || result.brandIdentity.selectedName}
                    tagline={activeTagline || result.brandIdentity.selectedTagline}
                    productName={
                      (result.businessType || businessType) === 'hybrid'
                        ? hybridProductName
                        : productName || activeBrandName
                    }
                    productDescription={
                      (result.businessType || businessType) === 'hybrid'
                        ? hybridProductDescription
                        : description || existingBrandInput.businessDescription
                    }
                    category={
                      (result.businessType || businessType) === 'hybrid'
                        ? hybridProductCategory
                        : (result.businessType || businessType) === 'service'
                        ? customServiceCategory.trim() || serviceCategory
                        : category
                    }
                    price={
                      (result.businessType || businessType) === 'hybrid'
                        ? hybridProductPrice
                        : (result.businessType || businessType) === 'service'
                        ? rateCardOrPricing
                        : price
                    }
                    serviceName={
                      (result.businessType || businessType) === 'hybrid'
                        ? hybridServiceName
                        : specificServices || serviceCategory
                    }
                    serviceDescription={
                      (result.businessType || businessType) === 'hybrid'
                        ? hybridServiceDescription
                        : serviceDescription
                    }
                    serviceCategory={
                      (result.businessType || businessType) === 'hybrid'
                        ? hybridServiceCategory
                        : customServiceCategory.trim() || serviceCategory
                    }
                    servicePrice={
                      (result.businessType || businessType) === 'hybrid'
                        ? hybridServicePriceOrPackages
                        : rateCardOrPricing
                    }
                    serviceDeliveryMethod={
                      (result.businessType || businessType) === 'hybrid'
                        ? hybridServiceDeliveryMethod
                        : serviceDeliveryMethod
                    }
                    businessLocation={
                      (result.businessType || businessType) === 'product'
                        ? targetLocation || (selectedRegions.length > 0 ? formatRegionSummary(selectedRegions) : '')
                        : targetLocation || serviceBusinessLocation
                    }
                    palette={result.brandIdentity.colorPalette}
                    imageUrl={
                      (result.businessType || businessType) === 'hybrid'
                        ? hybridProductImage || imagePreview
                        : imagePreview || existingBrandInput.logoUrl
                    }
                    serviceImageUrl={
                      (result.businessType || businessType) === 'service'
                        ? serviceLogoUrl
                        : (result.businessType || businessType) === 'hybrid' &&
                          imagePreview &&
                          imagePreview !== hybridProductImage
                        ? imagePreview
                        : null
                    }
                    selectedBadge={currentBadgeLabel}
                    productRecognition={productRecognition}
                    recognitionConfirmed={recognitionConfirmed}
                    recognizedContext={recognizedContext}
                    brandTone={brandTone}
                    typographyRecommendation={result.brandIdentity.typographyRecommendation}
                    brandPromise={result.brandIdentity.positioning?.brandPromise}
                    initialMockupUrl={brandedMockupUrl}
                    initialUseBrandedMockup={useBrandedMockup}
                    onMockupStateChange={handleMockupStateChange}
                    onUpdateProductImage={(newUrl) => {
                      const activeTarget = result.businessType || businessType;
                      const currentImage =
                        activeTarget === 'hybrid'
                          ? hybridProductImage || imagePreview
                          : imagePreview || existingBrandInput.logoUrl;
                      if (newUrl !== currentImage) {
                        setProductRecognition(null);
                        setRecognitionConfirmed(false);
                        setRecognizedContext(null);
                        setBrandedMockupUrl(null);
                        setUseBrandedMockup(false);
                      }
                      if (activeTarget === 'hybrid') {
                        setHybridProductImage(newUrl);
                      } else {
                        setImagePreview(newUrl);
                      }
                    }}
                    onUpdateProductDetails={({ productName: nextName, productDescription: nextDesc }) => {
                      if ((result.businessType || businessType) === 'hybrid') {
                        if (nextName !== undefined) setHybridProductName(nextName);
                        if (nextDesc !== undefined) setHybridProductDescription(nextDesc);
                      } else {
                        if (nextName !== undefined) setProductName(nextName);
                        if (nextDesc !== undefined) setDescription(nextDesc);
                      }
                    }}
                    onUpdateServiceImage={(newUrl) => {
                      if ((result.businessType || businessType) === 'service') {
                        setServiceLogoUrl(newUrl);
                      } else if ((result.businessType || businessType) === 'hybrid') {
                        setImagePreview(newUrl);
                      }
                    }}
                    onFlyerGenerated={handlePromoImageGenerated}
                    savedPromoImages={generatedPromoImages}
                  />
                )}
              </section>
            ) : (
              <WorkspaceEmptyKitNotice
                section="marketing-assets"
                onGoToCreate={() => {
                  setStudioMode('create');
                  setActiveNav('create');
                }}
                onGoToImprove={() => {
                  setStudioMode('improve');
                  setActiveNav('improve');
                }}
                onGoToProjects={() => setActiveNav('projects')}
              />
            ))}

          {/* 6. MY PROJECTS WORKSPACE */}
          {activeNav === 'projects' && (
            <CustomerDashboard
              embeddedInWorkspace
              projects={savedProjects}
              isLoadingProjects={isLoadingProjects}
              projectsError={projectsError}
              activeProjectId={activeProjectId}
              onRetryLoadProjects={() => user && loadUserProjects(user.uid)}
              onCreateNewBrand={() => {
                handleReset();
                setStudioMode('create');
                setActiveNav('create');
                triggerToast('Ready to create a new brand!');
              }}
              onImproveExistingBrand={() => {
                handleReset();
                setStudioMode('improve');
                setActiveNav('improve');
                triggerToast('Ready to upgrade an existing brand!');
              }}
              onReopenProject={handleReopenProject}
              onUpdateProjectDetails={handleUpdateProjectDetailsFromDashboard}
              onDeleteProject={handleDeleteProjectFromDashboard}
              onCloseDashboard={() => setActiveNav('dashboard')}
              onOpenAuthModal={(tab = 'login') => {
                setAuthModalTab(tab);
                setIsAuthModalOpen(true);
              }}
              onNotify={triggerToast}
            />
          )}
        </main>
      </div>

      {/* Brand Summary Modal */}
      {result && (
        <BrandSummaryModal
          isOpen={isSummaryOpen}
          onClose={() => setIsSummaryOpen(false)}
          result={result}
          productName={productName || activeBrandName}
          onCopyText={handleCopyText}
        />
      )}

      {/* Account Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialTab={authModalTab}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(msg) => triggerToast(msg)}
      />

      {/* Feedback Toast */}
      <Toast message={toastMessage} />
    </div>
  );
}
