import React, { useState } from 'react';
import {
  ServiceCategory,
  STRUCTURED_SERVICE_CATEGORIES,
  ServiceDeliveryMethod,
  SampleServiceBusiness,
} from '../types';
import { SAMPLE_SERVICE_BUSINESSES } from '../data/sampleServices';
import { NigerianMarketRegionSelector } from './NigerianMarketRegionSelector';
import { formatRegionSummary } from '../data/nigerianRegions';
import {
  Crown,
  Sparkles,
  Briefcase,
  Layers,
  MapPin,
  CheckCircle2,
  Users,
  Tag,
  Sliders,
  FileText,
  Upload,
  X,
  Building,
  Monitor,
  Repeat,
  ShieldCheck,
  Check,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { postJsonApi, getFriendlyErrorMessage } from '../utils/apiClient';

interface ServiceFormProps {
  brandName: string;
  onBrandNameChange: (val: string) => void;
  category: ServiceCategory | string;
  onCategoryChange: (cat: string) => void;
  customCategory: string;
  onCustomCategoryChange: (val: string) => void;
  serviceDescription: string;
  onServiceDescriptionChange: (val: string) => void;
  specificServices: string;
  onSpecificServicesChange: (val: string) => void;
  targetCustomers: string;
  onTargetCustomersChange: (val: string) => void;
  businessLocation: string;
  onBusinessLocationChange: (val: string) => void;
  selectedRegions: string[];
  onSelectedRegionsChange: (regions: string[]) => void;
  targetLocationSummary: string;
  onTargetLocationSummaryChange: (summary: string) => void;
  deliveryMethod: ServiceDeliveryMethod;
  onDeliveryMethodChange: (method: ServiceDeliveryMethod) => void;
  rateCardOrPricing: string;
  onRateCardOrPricingChange: (val: string) => void;
  brandTone: string;
  onBrandToneChange: (val: string) => void;
  logoOrAssetUrl: string | null;
  onLogoOrAssetChange: (url: string | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onSelectSample: (sample: SampleServiceBusiness) => void;
  selectedSampleId: string | null;
}

const TONES = [
  { id: 'Afro-Luxury & Regal', label: '👑 Afro-Luxury & Regal', desc: 'High-end, bespoke prestige, high fees' },
  { id: 'Elite Professional & Polished', label: '💼 Elite Professional', desc: 'Corporate rigor, meticulous reliability' },
  { id: 'Warm, Trusted & Heartfelt', label: '🌿 Warm & Trusted', desc: 'Approachable, attentive, customer-first' },
  { id: 'Street-Smart Hype & Energy', label: '🔥 Street-Smart & Energetic', desc: 'Fast, trendy, high social engagement' },
  { id: 'Everyday Practical & Savvy', label: '💡 Everyday Savvy', desc: 'Relatable value, transparent, dependable' },
];

export const ServiceForm: React.FC<ServiceFormProps> = ({
  brandName,
  onBrandNameChange,
  category,
  onCategoryChange,
  customCategory,
  onCustomCategoryChange,
  serviceDescription,
  onServiceDescriptionChange,
  specificServices,
  onSpecificServicesChange,
  targetCustomers,
  onTargetCustomersChange,
  businessLocation,
  onBusinessLocationChange,
  selectedRegions,
  onSelectedRegionsChange,
  targetLocationSummary,
  onTargetLocationSummaryChange,
  deliveryMethod,
  onDeliveryMethodChange,
  rateCardOrPricing,
  onRateCardOrPricingChange,
  brandTone,
  onBrandToneChange,
  logoOrAssetUrl,
  onLogoOrAssetChange,
  onSubmit,
  isLoading,
  onSelectSample,
  selectedSampleId,
}) => {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<{ name: string; tagline: string; vibe: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  // Suggest brand names for service business
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
        productName: specificServices || category,
        productDescription: serviceDescription,
        brandTone,
        businessType: 'service',
      });

      if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
      } else {
        setSuggestError('No brand name suggestions were returned. Please retry or type your own business name.');
      }
    } catch (err) {
      console.error('Error fetching service name suggestions:', err);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onLogoOrAssetChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isCustomCategory = category === 'Other Services' || !STRUCTURED_SERVICE_CATEGORIES.some((c) => c.id === category);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/80 shadow-xs space-y-6">
      {/* Sample Service Presets Quick Bar */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick Test: Load Nigerian Service SME Samples
          </label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SAMPLE_SERVICE_BUSINESSES.map((sample) => {
            const isSelected = selectedSampleId === sample.id;
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
                  {sample.logoOrAssetUrl ? (
                    <img
                      src={sample.logoOrAssetUrl}
                      alt={sample.brandName}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      💼
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-stone-800 truncate">
                      {sample.brandName.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-semibold truncate">
                      {sample.category.split(' ')[0]}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-stone-600 line-clamp-1 group-hover:text-emerald-800">
                  {sample.brandName}
                </p>
                {isSelected && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 absolute top-1 right-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* 1. Service Category Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-bold text-stone-900">
              Service Category <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-stone-400">10 Major Service Sectors</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {STRUCTURED_SERVICE_CATEGORIES.map((cat) => (
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

          {/* Custom Category Input if "Other Services" is selected */}
          {isCustomCategory && (
            <div className="mt-2.5">
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Specify Your Custom Service Category:
              </label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => onCustomCategoryChange(e.target.value)}
                placeholder="e.g. Solar & Renewable Energy Audits, Virtual Executive Assistance"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}
        </div>

        {/* 2. Business or Brand Name (Editable Input Field) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-emerald-50/40 to-stone-50 border-2 border-emerald-600/50 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label htmlFor="service-brand-name-input" className="block text-sm sm:text-base font-black text-stone-900 flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Enter Your Business or Brand Name</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  You're in Control
                </span>
              </label>
              <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5 leading-relaxed">
                Enter your exact service business name below, or leave blank to let the AI strategist formulate naming options.
              </p>
            </div>

            {/* "Suggest a name for me" button */}
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
              id="service-brand-name-input"
              type="text"
              value={brandName}
              onChange={(e) => onBrandNameChange(e.target.value)}
              placeholder="e.g. GlamByTiti Luxury Bridal, SwiftWaybill Logistics"
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-300 text-sm sm:text-base font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600 bg-white shadow-xs"
            />
            {brandName && (
              <button
                type="button"
                onClick={() => onBrandNameChange('')}
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

          {/* Clickable AI Name Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="pt-2.5 border-t border-emerald-200/60 animate-in fade-in duration-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Suggested Service Brand Names (Click to Apply):
                </span>
                <button
                  type="button"
                  onClick={() => setShowSuggestions(false)}
                  className="text-[10px] text-stone-400 hover:text-stone-600 font-semibold cursor-pointer"
                >
                  Hide
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestions.map((s, idx) => {
                  const isCurrent = brandName.trim().toLowerCase() === s.name.trim().toLowerCase();
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onBrandNameChange(s.name)}
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

        {/* 3. Specific Services Offered & Pricing Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
              Specific Services & Packages Offered <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={specificServices}
              onChange={(e) => onSpecificServicesChange(e.target.value)}
              placeholder="e.g. Bridal Glam, Event Lighting, Interstate Haulage, CAC Filing, Deep Cleaning"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              Typical Rates / Fees (₦)
            </label>
            <input
              type="text"
              value={rateCardOrPricing}
              onChange={(e) => onRateCardOrPricingChange(e.target.value)}
              placeholder="e.g. ₦35,000 / session or ₦150k package"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white font-medium"
            />
          </div>
        </div>

        {/* 4. Service Description & Value Details */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-stone-700">
              Service Description & Value Proposition <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-stone-400">Describe what you do & your standard of delivery</span>
          </div>
          <textarea
            rows={3}
            value={serviceDescription}
            onChange={(e) => onServiceDescriptionChange(e.target.value)}
            placeholder="Describe your service process, years of craft, what sets you apart from unverified freelancers, equipment/materials used, and client satisfaction promise..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white leading-relaxed resize-none"
          />
        </div>

        {/* 5. Target Customers & Business Base Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              Target Customers
            </label>
            <input
              type="text"
              value={targetCustomers}
              onChange={(e) => onTargetCustomersChange(e.target.value)}
              placeholder="e.g. Brides-to-be, corporate event managers, busy moms, online vendors"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-emerald-600" />
              Base Business Location / Studio Hub
            </label>
            <input
              type="text"
              value={businessLocation}
              onChange={(e) => onBusinessLocationChange(e.target.value)}
              placeholder="e.g. Lekki Phase 1, Lagos | Wuse 2, Abuja | Onitsha Main Hub"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>
        </div>

        {/* 6. Service Delivery Method Selection */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
            <Repeat className="w-3.5 h-3.5 text-emerald-600" />
            Service Delivery Method <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { id: 'physical' as ServiceDeliveryMethod, icon: Building, label: 'Physical / On-Site', desc: 'Client comes to studio or on-location' },
              { id: 'online' as ServiceDeliveryMethod, icon: Monitor, label: 'Online / Virtual', desc: 'Remote delivery via Zoom, WhatsApp, Cloud' },
              { id: 'hybrid' as ServiceDeliveryMethod, icon: Repeat, label: 'Hybrid', desc: 'Both on-site and remote options' },
            ].map((method) => {
              const Icon = method.icon;
              const isSelected = deliveryMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => onDeliveryMethodChange(method.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/30'
                      : 'border-stone-200 hover:border-emerald-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-700' : 'text-stone-500'}`} />
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <div>
                    <h6 className="text-xs font-bold text-stone-900">{method.label}</h6>
                    <p className="text-[10px] text-stone-500 line-clamp-1">{method.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 7. Complete Nigerian Market Region Selector */}
        <NigerianMarketRegionSelector
          selectedRegions={selectedRegions}
          onChange={(regions) => {
            onSelectedRegionsChange(regions);
            onTargetLocationSummaryChange(formatRegionSummary(regions));
          }}
          onSummaryChange={onTargetLocationSummaryChange}
        />

        {/* 8. Desired Brand Tone & Optional Logo/Portfolio Asset */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              Optional Logo or Portfolio Asset
            </label>
            {logoOrAssetUrl ? (
              <div className="flex items-center justify-between p-2 rounded-xl border border-emerald-200 bg-emerald-50/70 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <img src={logoOrAssetUrl} alt="Logo" className="w-7 h-7 rounded object-cover shrink-0" />
                  <span className="truncate text-emerald-950 font-semibold text-xs">Asset Attached</span>
                </div>
                <button
                  type="button"
                  onClick={() => onLogoOrAssetChange(null)}
                  className="text-stone-400 hover:text-rose-600 font-bold p-1 cursor-pointer"
                  title="Remove asset"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-stone-300 hover:border-emerald-500 bg-stone-50 hover:bg-stone-100/70 text-xs text-stone-600 font-medium cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>Upload Logo / Banner (Optional)</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-6 rounded-xl font-extrabold text-sm sm:text-base text-white bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 hover:from-emerald-900 hover:to-teal-800 shadow-md shadow-emerald-800/25 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Crafting your brand identity, visual direction & market-ready growth strategy...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Generate Full Nigerian Service Brand Studio Kit</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
