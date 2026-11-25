import React, { useRef, useState } from 'react';
import {
  SampleHybridBusiness,
  ServiceDeliveryMethod,
  ProductRecognitionResult,
  STRUCTURED_PRODUCT_CATEGORIES,
  STRUCTURED_SERVICE_CATEGORIES,
} from '../types';
import { SAMPLE_HYBRID_BUSINESSES } from '../data/sampleHybridBusinesses';
import { NigerianMarketRegionSelector } from './NigerianMarketRegionSelector';
import { ProductRecognitionCard } from './ProductRecognitionCard';
import {
  Building2,
  Sparkles,
  Package,
  Briefcase,
  Layers,
  MapPin,
  CheckCircle2,
  Upload,
  X,
  Sliders,
  DollarSign,
  Tag,
  Scan,
  Repeat,
  ShieldCheck,
  Check,
  FileText,
  Users,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface HybridFormProps {
  // Business Info
  brandName: string;
  onBrandNameChange: (val: string) => void;
  businessDescription: string;
  onBusinessDescriptionChange: (val: string) => void;
  industryCategory: string;
  onIndustryCategoryChange: (val: string) => void;
  targetCustomers: string;
  onTargetCustomersChange: (val: string) => void;
  businessLocation: string;
  onBusinessLocationChange: (val: string) => void;
  selectedRegions: string[];
  onSelectedRegionsChange: (regions: string[]) => void;
  targetLocationSummary: string;
  onTargetLocationSummaryChange: (val: string) => void;
  brandTone: string;
  onBrandToneChange: (val: string) => void;
  logoOrAssetUrl: string | null;
  onLogoOrAssetChange: (url: string | null) => void;

  // Product Info
  productName: string;
  onProductNameChange: (val: string) => void;
  productDescription: string;
  onProductDescriptionChange: (val: string) => void;
  productPrice: string;
  onProductPriceChange: (val: string) => void;
  productCategory: string;
  onProductCategoryChange: (val: string) => void;
  productImageBase64: string | null;
  onProductImageChange: (base64: string | null) => void;
  productRecognition: ProductRecognitionResult | null;
  isAnalyzingProductImage: boolean;
  recognitionConfirmed: boolean;
  onConfirmRecognition: (confirmed: ProductRecognitionResult) => void;
  onReScanProductImage: () => void;
  recognitionError?: string | null;
  onDismissRecognitionError?: () => void;

  // Service Info
  serviceName: string;
  onServiceNameChange: (val: string) => void;
  serviceDescription: string;
  onServiceDescriptionChange: (val: string) => void;
  serviceCategory: string;
  onServiceCategoryChange: (val: string) => void;
  serviceDeliveryMethod: ServiceDeliveryMethod;
  onServiceDeliveryMethodChange: (val: ServiceDeliveryMethod) => void;
  servicePriceOrPackages: string;
  onServicePriceOrPackagesChange: (val: string) => void;

  // Submission
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onSelectSample: (sample: SampleHybridBusiness) => void;
  selectedSampleId: string | null;
}

const TONES = [
  { id: 'Afro-Luxury & Regal', label: '👑 Afro-Luxury & Regal', desc: 'Prestige, bespoke quality, high fees' },
  { id: 'Elite Professional & Polished', label: '💼 Elite Professional', desc: 'Corporate rigor, meticulous reliability' },
  { id: 'Warm, Trusted & Heartfelt', label: '🌿 Warm & Trusted', desc: 'Holistic care, attentive, customer-first' },
  { id: 'Street-Smart Hype & Energy', label: '🔥 Street-Smart & Energetic', desc: 'Fast, trendy, viral social engagement' },
  { id: 'Everyday Practical & Savvy', label: '💡 Everyday Savvy', desc: 'Relatable value, transparent, dependable' },
];

const HYBRID_INDUSTRIES = [
  'Beauty, Haircare & Salon Services',
  'Fashion Design & Bespoke Tailoring',
  'Health, Wellness & Spa Services',
  'Food, Catering & Packaged Gourmet Products',
  'Repairs, Technical & Hardware Retail',
  'Creative Crafts, Photography & Custom Workshops',
  'Agriculture, Farm Produce & Logistics Services',
  'Custom Hybrid Industry',
];

export const HybridForm: React.FC<HybridFormProps> = ({
  brandName,
  onBrandNameChange,
  businessDescription,
  onBusinessDescriptionChange,
  industryCategory,
  onIndustryCategoryChange,
  targetCustomers,
  onTargetCustomersChange,
  businessLocation,
  onBusinessLocationChange,
  selectedRegions,
  onSelectedRegionsChange,
  targetLocationSummary,
  onTargetLocationSummaryChange,
  brandTone,
  onBrandToneChange,
  logoOrAssetUrl,
  onLogoOrAssetChange,

  productName,
  onProductNameChange,
  productDescription,
  onProductDescriptionChange,
  productPrice,
  onProductPriceChange,
  productCategory,
  onProductCategoryChange,
  productImageBase64,
  onProductImageChange,
  productRecognition,
  isAnalyzingProductImage,
  recognitionConfirmed,
  onConfirmRecognition,
  onReScanProductImage,
  recognitionError = null,
  onDismissRecognitionError,

  serviceName,
  onServiceNameChange,
  serviceDescription,
  onServiceDescriptionChange,
  serviceCategory,
  onServiceCategoryChange,
  serviceDeliveryMethod,
  onServiceDeliveryMethodChange,
  servicePriceOrPackages,
  onServicePriceOrPackagesChange,

  onSubmit,
  isLoading,
  onSelectSample,
  selectedSampleId,
}) => {
  const productImageInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);

  const handleProductFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onProductImageChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onLogoOrAssetChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const suggestedNames = [
    'DivaLuxe Atelier & Co.',
    'Aura Bloom Studio & Organics',
    'Zaria Heritage Couture & Academy',
    'NaijaFit Wellness & Pantry',
    'SolarPulse Energy & Smart Hardware',
    'Kora Dual Craft Lab',
  ];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-7 border border-stone-200/80 shadow-xs space-y-7">
      {/* Sample Hybrid Nigerian Businesses Quick Bar */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick Test: Load Nigerian Hybrid SME Presets (Products + Services)
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SAMPLE_HYBRID_BUSINESSES.map((sample) => {
            const isSelected = selectedSampleId === sample.id;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => onSelectSample(sample)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-stone-200 bg-stone-50/60 hover:bg-stone-100 text-stone-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-xs text-stone-900 truncate">
                      {sample.brandName}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full shrink-0">
                        Active
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-md inline-block mb-1">
                    {sample.badge}
                  </span>
                  <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                    📦 {sample.productName} + 💼 {sample.serviceName}
                  </p>
                </div>
                <div className="pt-2 mt-2 border-t border-stone-200/50 flex items-center justify-between text-[10px] text-stone-400">
                  <span>{sample.businessLocation.split(',')[0]}</span>
                  <span className="font-semibold text-amber-700">{sample.productPrice}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        {/* SECTION 1: CORE BUSINESS INFORMATION */}
        <div className="space-y-4">
          <div className="border-b border-stone-200 pb-2 flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              1. Business Information (Unified Identity)
            </h4>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Products + Services
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Business Name with Suggestion Helper */}
            <div className="md:col-span-8 space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-stone-800">
                  Enter Your Business or Brand Name
                </label>
                <button
                  type="button"
                  onClick={() => setShowNameSuggestions(!showNameSuggestions)}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  {showNameSuggestions ? 'Hide suggestions' : 'Suggest a name for me'}
                </button>
              </div>
              <input
                type="text"
                value={brandName}
                onChange={(e) => onBrandNameChange(e.target.value)}
                placeholder="e.g. DivaLuxe Atelier & Co., Zaria Heritage, SolarPulse Energy"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
              <p className="text-[11px] text-stone-400">
                Your entered business name is strictly preserved throughout all generated branding and marketing materials.
              </p>

              {showNameSuggestions && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 mt-2 animate-in fade-in">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block">
                    Click any curated name to apply:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedNames.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          onBrandNameChange(name);
                          setShowNameSuggestions(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-100 text-emerald-900 text-xs font-semibold border border-emerald-200 transition-colors cursor-pointer"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Industry / Category */}
            <div className="md:col-span-4 space-y-1">
              <label className="block text-xs font-bold text-stone-800">
                Combined Industry / Sector
              </label>
              <select
                value={industryCategory}
                onChange={(e) => onIndustryCategoryChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {HYBRID_INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            {/* Business Description */}
            <div className="md:col-span-12 space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-stone-800">
                  Business Overview & How Products and Services Connect <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-stone-400">Explain what you sell and what you do</span>
              </div>
              <textarea
                required
                rows={2}
                value={businessDescription}
                onChange={(e) => onBusinessDescriptionChange(e.target.value)}
                placeholder="e.g. We are a hair studio that installs luxury lace wigs and performs chemical-free treatments, while also retailing our own in-house line of 100% cold-pressed organic hair growth oils and satin bonnets..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white leading-relaxed resize-none"
              />
            </div>

            {/* Target Customers */}
            <div className="md:col-span-6 space-y-1">
              <label className="block text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                Target Customers <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={targetCustomers}
                onChange={(e) => onTargetCustomersChange(e.target.value)}
                placeholder="e.g. Nigerian brides, busy executives, and online shoppers looking for complete hair care"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            {/* Base Business Location */}
            <div className="md:col-span-6 space-y-1">
              <label className="block text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Base Business Location <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={businessLocation}
                onChange={(e) => onBusinessLocationChange(e.target.value)}
                placeholder="e.g. Lekki Phase 1, Lagos & Wuse 2, Abuja"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            {/* Complete 36 States + FCT Region Selector */}
            <div className="md:col-span-12">
              <NigerianMarketRegionSelector
                selectedRegions={selectedRegions}
                onChange={onSelectedRegionsChange}
                onSummaryChange={onTargetLocationSummaryChange}
              />
            </div>

            {/* Optional Logo Upload */}
            <div className="md:col-span-12">
              <div className="p-3.5 rounded-xl border border-dashed border-stone-300 bg-stone-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {logoOrAssetUrl ? (
                    <img
                      src={logoOrAssetUrl}
                      alt="Brand asset"
                      className="w-12 h-12 rounded-lg object-cover border border-stone-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-stone-200 flex items-center justify-center text-stone-400">
                      <Upload className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-bold text-stone-800 block">
                      Existing Logo or Brand Asset (Optional)
                    </span>
                    <span className="text-[11px] text-stone-400">
                      PNG, JPG or WebP. Preserves existing visual equity.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={logoInputRef}
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLogoFile(file);
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 cursor-pointer"
                  >
                    {logoOrAssetUrl ? 'Change Logo' : 'Upload Logo'}
                  </button>
                  {logoOrAssetUrl && (
                    <button
                      type="button"
                      onClick={() => onLogoOrAssetChange(null)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Remove Logo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: PHYSICAL PRODUCT INFORMATION */}
        <div className="space-y-4 p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-2">
            <div>
              <h4 className="text-sm font-extrabold text-amber-950 flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-700" />
                2. Physical Product Information (Retail / Inventory)
              </h4>
              <p className="text-[11px] text-amber-800">
                Product images are optional. You can upload a photo or type details manually.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-bold shrink-0 self-start sm:self-auto">
              Image Optional
            </span>
          </div>

          {/* Product Photo Upload & AI Recognition Card */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl border border-dashed border-amber-300 bg-white">
              <div className="flex items-center gap-3">
                {productImageBase64 ? (
                  <img
                    src={productImageBase64}
                    alt="Product preview"
                    className="w-14 h-14 rounded-lg object-cover border border-amber-200"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-amber-100/70 text-amber-700 flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <span className="text-xs font-bold text-stone-900 block">
                    Upload Product Photograph (Optional)
                  </span>
                  <span className="text-[11px] text-stone-500">
                    If uploaded, AI automatically identifies the product and its category.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="file"
                  ref={productImageInputRef}
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleProductFile(file);
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => productImageInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-colors cursor-pointer"
                >
                  {productImageBase64 ? 'Change Photo' : 'Upload Photo'}
                </button>
                {productImageBase64 && (
                  <button
                    type="button"
                    onClick={() => onProductImageChange(null)}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="Remove Photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* AI Product Recognition Card for Product Photo */}
            {isAnalyzingProductImage && (
              <div className="p-3.5 rounded-xl bg-white border border-amber-200 flex items-center gap-3 animate-pulse">
                <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <Scan className="w-4 h-4 animate-spin" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-amber-950">AI Product Recognition Running...</h5>
                  <p className="text-[11px] text-amber-800">
                    Analyzing photograph textures, container type, and product characteristics...
                  </p>
                </div>
              </div>
            )}

            {recognitionError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">AI Product Recognition Incomplete</p>
                    <p className="text-[11px] text-rose-800 mt-0.5">
                      {recognitionError} You can retry scanning or enter your product details manually below.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={onReScanProductImage}
                    disabled={isAnalyzingProductImage}
                    className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isAnalyzingProductImage ? 'animate-spin' : ''}`} />
                    <span>Retry AI Scan</span>
                  </button>
                  {onDismissRecognitionError && (
                    <button
                      type="button"
                      onClick={onDismissRecognitionError}
                      className="text-[11px] font-semibold text-rose-700 hover:underline cursor-pointer"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            )}

            {productRecognition && !recognitionConfirmed && (
              <ProductRecognitionCard
                recognition={productRecognition}
                imagePreview={productImageBase64}
                onConfirm={onConfirmRecognition}
                onReScan={onReScanProductImage}
                isScanning={isAnalyzingProductImage}
              />
            )}

            {productRecognition && recognitionConfirmed && (
              <div className="p-2.5 rounded-xl bg-white border border-emerald-300 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold text-stone-900">
                    AI Identified: {productRecognition.productIdentified}
                  </span>
                  <span className="text-stone-500">({productRecognition.productCategory})</span>
                </div>
                <button
                  type="button"
                  onClick={onReScanProductImage}
                  className="text-[11px] text-emerald-700 hover:underline font-semibold cursor-pointer"
                >
                  Re-classify
                </button>
              </div>
            )}
          </div>

          {/* Product Manual Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            <div className="md:col-span-8 space-y-1">
              <label className="block text-xs font-bold text-stone-800">
                Product Name or Product Line <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => onProductNameChange(e.target.value)}
                placeholder="e.g. DivaLuxe Cold-Pressed Herbal Hair Growth Elixir (100ml)"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            <div className="md:col-span-4 space-y-1">
              <label className="block text-xs font-bold text-stone-800">
                Retail Price / Unit Price (Optional)
              </label>
              <input
                type="text"
                value={productPrice}
                onChange={(e) => onProductPriceChange(e.target.value)}
                placeholder="e.g. ₦8,500 / bottle"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            <div className="md:col-span-8 space-y-1">
              <label className="block text-xs font-bold text-stone-800">
                Product Description & Physical Traits
              </label>
              <input
                type="text"
                value={productDescription}
                onChange={(e) => onProductDescriptionChange(e.target.value)}
                placeholder="e.g. Handcrafted with authentic Chebe and Nigerian castor oil in amber glass dropper bottles."
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            <div className="md:col-span-4 space-y-1">
              <label className="block text-xs font-bold text-stone-800">
                Product Category
              </label>
              <select
                value={productCategory}
                onChange={(e) => onProductCategoryChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              >
                {STRUCTURED_PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: SERVICE INFORMATION */}
        <div className="space-y-4 p-5 rounded-2xl bg-teal-50/40 border border-teal-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-200/60 pb-2">
            <div>
              <h4 className="text-sm font-extrabold text-teal-950 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-teal-700" />
                3. Service Information (Client Bookings & Sessions)
              </h4>
              <p className="text-[11px] text-teal-800">
                Define the hands-on or virtual services your business delivers alongside products.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-200/80 text-teal-900 font-bold shrink-0 self-start sm:self-auto">
              Client Booking
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            <div className="md:col-span-8 space-y-1">
              <label className="block text-xs font-bold text-stone-800">
                Service Name or Service Menu <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={serviceName}
                onChange={(e) => onServiceNameChange(e.target.value)}
                placeholder="e.g. Bespoke Frontal Installation & Scalp Revitalization"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>

            <div className="md:col-span-4 space-y-1">
              <label className="block text-xs font-bold text-stone-800">
                Service Pricing / Rate Card (Optional)
              </label>
              <input
                type="text"
                value={servicePriceOrPackages}
                onChange={(e) => onServicePriceOrPackagesChange(e.target.value)}
                placeholder="e.g. ₦35,000 / appointment"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>

            <div className="md:col-span-8 space-y-1">
              <label className="block text-xs font-bold text-stone-800">
                Service Description & Client Deliverables
              </label>
              <input
                type="text"
                value={serviceDescription}
                onChange={(e) => onServiceDescriptionChange(e.target.value)}
                placeholder="e.g. Full customization, bleaching of knots, glueless styling, and scalp massage with 4-week hold."
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>

            <div className="md:col-span-4 space-y-1">
              <label className="block text-xs font-bold text-stone-800">
                Service Category
              </label>
              <select
                value={serviceCategory}
                onChange={(e) => onServiceCategoryChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                {STRUCTURED_SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Delivery Method Selection */}
            <div className="md:col-span-12 space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-stone-800">
                Service Delivery Method:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'physical', label: '📍 Physical On-site / Studio', desc: 'At shop, salon, or client doorstep' },
                  { id: 'online', label: '💻 Virtual / Remote Only', desc: 'Via WhatsApp, Zoom, or video call' },
                  { id: 'hybrid', label: '🔄 Hybrid (In-person & Virtual)', desc: 'Both studio visits & online consultations' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onServiceDeliveryMethodChange(item.id as ServiceDeliveryMethod)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      serviceDeliveryMethod === item.id
                        ? 'border-teal-600 bg-teal-100/70 text-teal-950 font-bold shadow-xs'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <span className="text-xs">{item.label}</span>
                    <span className="text-[10px] text-stone-400 font-normal">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: BRAND TONE & SUBMISSION */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              Desired Brand Personality & Voice
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {TONES.map((tone) => (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => onBrandToneChange(tone.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    brandTone === tone.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                      : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <span className="text-xs">{tone.label}</span>
                  <span className="text-[10px] text-stone-400 font-normal mt-0.5">{tone.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 hover:from-emerald-900 hover:to-teal-950 text-white font-extrabold text-sm sm:text-base transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span>Crafting your brand identity, visual direction & market-ready growth strategy...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>
                    Generate Complete Hybrid Brand Identity & Cross-Selling Marketing Kit
                  </span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-stone-400 mt-2">
              Formulates unified positioning, 6–8 psychological colors, product captions, service captions, WhatsApp cross-sell sequences & ad campaigns.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
