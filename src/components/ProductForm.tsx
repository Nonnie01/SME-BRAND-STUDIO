import React, { useState } from 'react';
import {
  ProductCategory,
  SampleProduct,
  STRUCTURED_PRODUCT_CATEGORIES,
  ProductRecognitionResult,
} from '../types';
import { SAMPLE_PRODUCTS, NIGERIAN_BEVERAGE_SAMPLES } from '../data/sampleProducts';
import {
  Sparkles,
  MapPin,
  Tag,
  Sliders,
  FileText,
  CheckCircle2,
  Scan,
  ShieldCheck,
  AlertCircle,
  Crown,
  RefreshCw,
} from 'lucide-react';
import { NigerianMarketRegionSelector } from './NigerianMarketRegionSelector';
import { formatRegionSummary } from '../data/nigerianRegions';
import { postJsonApi, getFriendlyErrorMessage } from '../utils/apiClient';

interface ProductFormProps {
  customBrandName?: string;
  onCustomBrandNameChange?: (val: string) => void;
  brandName?: string;
  onBrandNameChange?: (val: string) => void;
  category: ProductCategory;
  onCategoryChange: (cat: ProductCategory) => void;
  productName: string;
  onProductNameChange: (val: string) => void;
  description: string;
  onDescriptionChange: (val: string) => void;
  price: string;
  onPriceChange: (val: string) => void;
  targetLocation: string;
  onTargetLocationChange: (val: string) => void;
  selectedRegions?: string[];
  onSelectedRegionsChange?: (regions: string[]) => void;
  brandTone: string;
  onBrandToneChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onSelectSample: (sample: SampleProduct) => void;
  selectedSampleId: string | null;
  recognition?: ProductRecognitionResult | null;
  recognitionConfirmed?: boolean;
  recognitionError?: string | null;
  onRetryRecognition?: () => void;
  onDismissRecognitionError?: () => void;
  isAnalyzingImage?: boolean;
}

const TONES = [
  { id: 'Afro-Luxury & Regal', label: '👑 Afro-Luxury & Regal', desc: 'Distinguished, high-end, premium pricing' },
  { id: 'Street-Smart Hype & Energy', label: '🔥 Street-Smart Hype', desc: 'Vibrant, fast-paced, high engagement' },
  { id: 'Warm, Pure & Natural', label: '🌿 Warm & Natural', desc: 'Wholesome, trusted ingredients, heartfelt' },
  { id: 'Everyday Practical & Savvy', label: '💡 Everyday Savvy', desc: 'Relatable value for money, reliable' },
];

export const ProductForm: React.FC<ProductFormProps> = ({
  customBrandName = '',
  onCustomBrandNameChange,
  brandName = '',
  onBrandNameChange,
  category,
  onCategoryChange,
  productName,
  onProductNameChange,
  description,
  onDescriptionChange,
  price,
  onPriceChange,
  targetLocation,
  onTargetLocationChange,
  selectedRegions = ['Lagos'],
  onSelectedRegionsChange,
  brandTone,
  onBrandToneChange,
  onSubmit,
  isLoading,
  onSelectSample,
  selectedSampleId,
  recognition,
  recognitionConfirmed = true,
  recognitionError = null,
  onRetryRecognition,
  onDismissRecognitionError,
  isAnalyzingImage = false,
}) => {
  // Seamlessly synchronize brandName and customBrandName
  const currentBrandName = customBrandName || brandName || '';
  const handleBrandNameChange = (val: string) => {
    if (onCustomBrandNameChange) onCustomBrandNameChange(val);
    if (onBrandNameChange) onBrandNameChange(val);
  };

  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<
    { name: string; tagline: string; vibe: string }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  // Optional "Suggest a name for me" inspiration feature
  const handleSuggestNames = async (forceRefresh = false) => {
    if (!forceRefresh && suggestions.length > 0 && !suggestError) {
      setShowSuggestions(!showSuggestions);
      return;
    }

    setIsSuggesting(true);
    setSuggestError(null);
    try {
      const data = await postJsonApi<{
        success: boolean;
        suggestions?: { name: string; tagline: string; vibe: string }[];
      }>('/api/suggest-brand-names', {
        category,
        productName,
        productDescription: description,
        brandTone,
      });

      if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
      } else {
        setSuggestError('No brand name suggestions were returned. Please retry or enter your preferred name.');
      }
    } catch (err) {
      console.error('Error fetching suggested brand names:', err);
      setSuggestError(
        getFriendlyErrorMessage(
          err,
          'Could not fetch AI brand name suggestions right now. Your entered name is safe — please retry.'
        )
      );
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/80 shadow-xs space-y-6">
      {/* Sample Presets Quick Bar */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick Test: Load Nigerian SME Sample Products
          </label>

          {NIGERIAN_BEVERAGE_SAMPLES.some((b) => b.id === selectedSampleId) && (
            <div className="flex items-center gap-1.5">
              <label
                htmlFor="beverage-sample-variant"
                className="text-[11px] font-semibold text-stone-500 whitespace-nowrap"
              >
                Drink Preset:
              </label>
              <select
                id="beverage-sample-variant"
                value={selectedSampleId || 'drinks-zobo'}
                onChange={(e) => {
                  const chosen = NIGERIAN_BEVERAGE_SAMPLES.find(
                    (item) => item.id === e.target.value
                  );
                  if (chosen) onSelectSample(chosen);
                }}
                className="text-xs font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {NIGERIAN_BEVERAGE_SAMPLES.map((bev) => (
                  <option key={bev.id} value={bev.id}>
                    {bev.subcategory?.replace('Beverages & Local Drinks — ', '') || bev.productName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {SAMPLE_PRODUCTS.map((sample) => {
            const isBeverageCardSelected =
              sample.id === 'drinks-zobo' &&
              NIGERIAN_BEVERAGE_SAMPLES.some((b) => b.id === selectedSampleId);
            const isSelected = selectedSampleId === sample.id || isBeverageCardSelected;
            const displayLabel = sample.cardCategoryLabel || sample.categoryLabel.split(' ')[0];
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => onSelectSample(sample)}
                className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/30'
                    : 'border-stone-200 hover:border-emerald-300 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <img
                    src={sample.imageUrl}
                    alt={sample.productName}
                    className="w-8 h-8 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[11px] sm:text-xs font-bold text-stone-800 leading-tight line-clamp-2">
                      {displayLabel}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-semibold truncate">
                      {sample.priceRange}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-stone-600 line-clamp-1 group-hover:text-emerald-800">
                  {sample.productName}
                </p>
                {isSelected && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 absolute top-1 right-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Recognition Error Notice with Retry */}
      {recognitionError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">AI Product Recognition Incomplete</p>
              <p className="text-[11px] text-rose-800 mt-0.5">
                {recognitionError} You can retry the AI scan or enter your product details manually below.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {onRetryRecognition && (
              <button
                type="button"
                onClick={onRetryRecognition}
                disabled={isAnalyzingImage}
                className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isAnalyzingImage ? 'animate-spin' : ''}`} />
                <span>Retry AI Scan</span>
              </button>
            )}
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

      {/* AI Recognition Status Pill */}
      {recognition && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-emerald-950">AI Recognized: </span>
              <span className="text-emerald-900 font-semibold">{recognition.productIdentified}</span>
              <span className="text-emerald-700 ml-1">({recognition.productCategory})</span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold shrink-0">
            {recognition.identificationConfidence.percentage}% Confirmed
          </span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        {/* 1. Structured Product Category Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-bold text-stone-900">
              Product Category <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-stone-400">11 Structured Business Sectors</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {STRUCTURED_PRODUCT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                  category === cat.id
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 hover:border-stone-300'
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span className="truncate">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. PLACEMENT REQUIREMENT: Immediately after Product Category Section */}
        {/* ENTER YOUR BUSINESS OR BRAND NAME (Editable Input Field) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-emerald-50/40 to-stone-50 border-2 border-emerald-600/50 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label htmlFor="business-brand-name-input" className="block text-sm sm:text-base font-black text-stone-900 flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Enter Your Business or Brand Name</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  You're in Control
                </span>
              </label>
              <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5 leading-relaxed">
                Enter your exact business name below, or leave blank to let the AI suggest names for you.
              </p>
            </div>

            {/* Optional "Suggest a name for me" button */}
            <button
              type="button"
              onClick={() => handleSuggestNames(false)}
              disabled={isSuggesting}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-xs transition-all cursor-pointer hover:border-emerald-500 active:scale-95 shrink-0"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-500 ${isSuggesting ? 'animate-spin' : ''}`} />
              <span>{isSuggesting ? 'Thinking of names...' : 'Suggest a name for me'}</span>
            </button>
          </div>

          <div className="relative">
            <input
              id="business-brand-name-input"
              type="text"
              value={currentBrandName}
              onChange={(e) => handleBrandNameChange(e.target.value)}
              placeholder="e.g. Nonnies Zobo Infusion"
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-300 text-sm sm:text-base font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600 bg-white shadow-xs"
            />
            {currentBrandName && (
              <button
                type="button"
                onClick={() => handleBrandNameChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs font-bold p-1 cursor-pointer"
                title="Clear brand name"
              >
                ✕
              </button>
            )}
          </div>

          {suggestError && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{suggestError}</span>
              </div>
              <button
                type="button"
                onClick={() => handleSuggestNames(true)}
                disabled={isSuggesting}
                className="text-[11px] font-bold text-rose-700 hover:underline inline-flex items-center gap-1 self-end sm:self-auto cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3 h-3 ${isSuggesting ? 'animate-spin' : ''}`} />
                <span>Retry Suggestions</span>
              </button>
            </div>
          )}

          {/* If suggestions are loaded, display clickable chips */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="pt-2.5 border-t border-emerald-200/60 animate-in fade-in duration-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Suggested Nigerian Brand Names (Click to Apply):
                </span>
                <button
                  type="button"
                  onClick={() => setShowSuggestions(false)}
                  className="text-[10px] text-stone-400 hover:text-stone-600 font-semibold cursor-pointer"
                >
                  Hide Suggestions
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestions.map((s, idx) => {
                  const isCurrent = currentBrandName.trim().toLowerCase() === s.name.trim().toLowerCase();
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        handleBrandNameChange(s.name);
                      }}
                      className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer shadow-xs flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-emerald-800 text-white border-emerald-900 ring-2 ring-emerald-500/30'
                          : 'bg-white hover:bg-emerald-50 border-emerald-200 text-stone-800 hover:border-emerald-400'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-black tracking-tight">{s.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-700 text-emerald-100">
                            Selected
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] italic line-clamp-1 ${isCurrent ? 'text-emerald-200' : 'text-stone-500'}`}>
                        "{s.tagline}" • {s.vibe}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Product Name & Price */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              Product Name (or Identified Item)
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => onProductNameChange(e.target.value)}
              placeholder="e.g. Royal Ankara Kimono & Trouser Set, Whipped Shea Butter"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              Target Price (₦)
            </label>
            <input
              type="text"
              value={price}
              onChange={(e) => onPriceChange(e.target.value)}
              placeholder="e.g. ₦15,000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white font-medium"
            />
          </div>
        </div>

        {/* Short Description */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-stone-700">
              Product Description & Crafting Details
            </label>
            <span className="text-[11px] text-stone-400">Pre-filled from visual audit or custom</span>
          </div>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Describe visible materials, ingredients, crafting technique, sizing, and key customer benefits..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white leading-relaxed resize-none"
          />
        </div>

        {/* Target Location: Full 36 States + FCT Geopolitical Region Selector */}
        <NigerianMarketRegionSelector
          selectedRegions={selectedRegions}
          onChange={(regions) => {
            if (onSelectedRegionsChange) onSelectedRegionsChange(regions);
            onTargetLocationChange(formatRegionSummary(regions));
          }}
        />

        {/* Desired Brand Tone */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-600" />
            Desired Brand Tone & Energy
          </label>
          <select
            value={brandTone}
            onChange={(e) => onBrandToneChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            {TONES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label} — {t.desc}
              </option>
            ))}
          </select>
        </div>

        {/* Pre-generation confirmation notice if recognition is pending */}
        {recognition && !recognitionConfirmed && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              Please review and click <strong>"Confirm Product & Continue"</strong> on the Product Recognition card to unlock Brand Identity Generation.
            </span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || (!recognitionConfirmed && !!recognition)}
          className="w-full py-4 px-6 rounded-xl font-extrabold text-sm sm:text-base text-white bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 hover:from-emerald-900 hover:to-teal-800 shadow-md shadow-emerald-800/25 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Crafting your brand identity, visual direction & market-ready growth strategy...</span>
            </>
          ) : !recognitionConfirmed && !!recognition ? (
            <>
              <AlertCircle className="w-5 h-5 text-amber-300" />
              <span>Confirm Product Above to Proceed</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Generate Full Nigerian Brand Studio Kit</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
