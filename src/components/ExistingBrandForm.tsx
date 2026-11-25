import React, { useRef, useState } from 'react';
import {
  ExistingBrandInput,
  SampleExistingBrand,
  ProductRecognitionResult,
} from '../types';
import { SAMPLE_EXISTING_BRANDS } from '../data/sampleExistingBrands';
import { ProductRecognitionCard } from './ProductRecognitionCard';
import { NigerianMarketRegionSelector } from './NigerianMarketRegionSelector';
import { formatRegionSummary } from '../data/nigerianRegions';
import {
  Building2,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Palette,
  Target,
  FileText,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  AlertCircle,
  X,
  Scan,
  RefreshCw,
} from 'lucide-react';

interface ExistingBrandFormProps {
  input: ExistingBrandInput;
  onChange: (updated: Partial<ExistingBrandInput>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onSelectSample: (sample: SampleExistingBrand) => void;
  selectedSampleId: string | null;
  recognition?: ProductRecognitionResult | null;
  isAnalyzingImage?: boolean;
  onConfirmRecognition?: (confirmed: ProductRecognitionResult) => void;
  recognitionConfirmed?: boolean;
  onReScan?: () => void;
  recognitionError?: string | null;
  onDismissRecognitionError?: () => void;
  selectedRegions?: string[];
  onSelectedRegionsChange?: (regions: string[]) => void;
  onTargetLocationChange?: (summary: string) => void;
}

const IMPROVEMENT_OPTIONS = [
  { id: 'Brand positioning', label: '🎯 Brand Positioning', desc: 'Sharpen target market, USP, and competitive edge' },
  { id: 'Brand consistency', label: '📐 Brand Consistency', desc: 'Fix messy/inconsistent visuals, packaging & tone' },
  { id: 'Improved visual identity', label: '🎨 Visual Identity & Colors', desc: 'Modernize palette, logo polish & typography' },
  { id: 'Brand messaging and tagline', label: '💬 Messaging & Tagline', desc: 'Craft punchier slogans, pitch & communication pillars' },
  { id: 'Marketing strategy', label: '📈 Marketing Strategy', desc: 'Overcome buyer skepticism, pricing & WhatsApp sales' },
  { id: 'Social media content', label: '📱 Social Media & Captions', desc: 'Revamp English & Pidgin captions and content calendar' },
];

export const ExistingBrandForm: React.FC<ExistingBrandFormProps> = ({
  input,
  onChange,
  onSubmit,
  isLoading,
  onSelectSample,
  selectedSampleId,
  recognition,
  isAnalyzingImage = false,
  onConfirmRecognition,
  recognitionConfirmed = true,
  onReScan,
  recognitionError = null,
  onDismissRecognitionError,
  selectedRegions = ['Lagos'],
  onSelectedRegionsChange,
  onTargetLocationChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleLogoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ logoUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleToggleGoal = (goalId: string) => {
    const exists = input.improvementGoals.includes(goalId);
    if (exists) {
      onChange({
        improvementGoals: input.improvementGoals.filter((g) => g !== goalId),
      });
    } else {
      onChange({
        improvementGoals: [...input.improvementGoals, goalId],
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-7 border border-stone-200/80 shadow-xs space-y-6">
      {/* Sample Existing Nigerian Brands Quick Bar */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick Test: Load Established Nigerian SME Profiles
          </label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SAMPLE_EXISTING_BRANDS.map((sample) => {
            const isSelected = selectedSampleId === sample.id;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => onSelectSample(sample)}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/30'
                    : 'border-stone-200 hover:border-emerald-300 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <img
                    src={sample.logoUrl}
                    alt={sample.name}
                    className="w-8 h-8 rounded-lg object-cover border border-stone-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-stone-900 truncate">{sample.name}</p>
                    <span className="text-[10px] text-emerald-800 font-semibold block truncate">
                      {sample.badge}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-stone-500 italic line-clamp-1">"{sample.tagline}"</p>
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute top-1.5 right-1.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Product Recognition Analyzing Indicator */}
      {isAnalyzingImage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 animate-pulse">
          <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
            <Scan className="w-4 h-4 animate-spin" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-950">AI Product Recognition in Progress...</h4>
            <p className="text-[11px] text-emerald-800">
              Inspecting uploaded product photograph, classifying category, and identifying visible characteristics...
            </p>
          </div>
        </div>
      )}

      {/* AI Product Recognition Error Notice */}
      {recognitionError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Could Not Scan Uploaded Asset</p>
              <p className="text-[11px] text-rose-800 mt-0.5">
                {recognitionError} You can retry the scan or continue filling in your brand details below.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {onReScan && (
              <button
                type="button"
                onClick={onReScan}
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

      {/* AI Product Recognition Card (Before Brand Formulation) */}
      {recognition && !recognitionConfirmed && onConfirmRecognition && (
        <ProductRecognitionCard
          recognition={recognition}
          imagePreview={input.logoUrl}
          onConfirm={onConfirmRecognition}
          onReScan={onReScan}
          isScanning={isAnalyzingImage}
        />
      )}

      {/* Verified Recognition Pill when Confirmed */}
      {recognition && recognitionConfirmed && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-emerald-950">Product Confirmed: </span>
              <span className="text-emerald-900 font-semibold">{recognition.productIdentified}</span>
              <span className="text-emerald-700 ml-1">({recognition.productCategory})</span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold shrink-0">
            {recognition.identificationConfidence.percentage}% Confirmed
          </span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Core Business Identity & Logo Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Logo Upload Box (4 cols) */}
          <div className="md:col-span-4 space-y-2">
            <label className="block text-xs font-bold text-stone-700 flex items-center justify-between">
              <span>Brand Logo or Product Photo</span>
              {input.logoUrl && (
                <button
                  type="button"
                  onClick={() => onChange({ logoUrl: null })}
                  className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              )}
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleLogoFile(e.target.files[0]);
                }
              }}
            />

            {!input.logoUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleLogoFile(e.dataTransfer.files[0]);
                  }
                }}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px] ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-stone-300 hover:border-emerald-400 hover:bg-stone-50/60'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-stone-800">Upload product photo or logo</p>
                <p className="text-[10px] text-stone-400 mt-1">AI will automatically analyze and classify</p>
              </div>
            ) : (
              <div className="relative rounded-xl border border-stone-200 bg-stone-50 p-3 flex flex-col items-center justify-center min-h-[160px]">
                <img
                  src={input.logoUrl}
                  alt="Existing Logo"
                  className="max-h-24 max-w-full object-contain rounded-lg shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 text-[11px] font-semibold text-emerald-800 hover:text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 cursor-pointer"
                >
                  Change Photo / Logo
                </button>
              </div>
            )}
          </div>

          {/* Business Name, Tagline & Colours (8 cols) */}
          <div className="md:col-span-8 space-y-4">
            {/* Business Model Selection */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center justify-between">
                <span>Business Model</span>
                <span className="text-[10px] text-stone-400 font-normal">Select how your business operates</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'product' as const, label: '🛍️ Products', desc: 'Physical merchandise' },
                  { id: 'service' as const, label: '🛠️ Services', desc: 'Expert client services' },
                  { id: 'hybrid' as const, label: '⚡ Hybrid', desc: 'Products + Services' },
                ].map((m) => {
                  const isSelected = (input.businessType || 'product') === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => onChange({ businessType: m.id })}
                      className={`px-2.5 py-2 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs ring-1 ring-emerald-500'
                          : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600'
                      }`}
                    >
                      <div className="text-xs font-semibold">{m.label}</div>
                      <div className="text-[10px] text-stone-500 truncate">{m.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                Existing Business or Brand Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={input.existingBrandName}
                onChange={(e) => onChange({ existingBrandName: e.target.value })}
                placeholder="e.g. Mama Tolu Fabrics, Kemi Naturals, Chidi Handcrafted Leather"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            {input.businessType === 'hybrid' && (
              <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-3">
                <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Hybrid Offerings Breakdown (Products + Services)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Physical Products Offered
                    </label>
                    <input
                      type="text"
                      value={input.productOfferings || ''}
                      onChange={(e) => onChange({ productOfferings: e.target.value })}
                      placeholder="e.g. Custom hair growth oils, silk bonnets, scalp scrub"
                      className="w-full px-3 py-1.5 rounded-lg border border-amber-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Professional Services Offered
                    </label>
                    <input
                      type="text"
                      value={input.serviceOfferings || ''}
                      onChange={(e) => onChange({ serviceOfferings: e.target.value })}
                      placeholder="e.g. In-salon hair spa, scalp detox therapy, bridal styling"
                      className="w-full px-3 py-1.5 rounded-lg border border-amber-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  Existing Tagline (optional)
                </label>
                <input
                  type="text"
                  value={input.existingTagline}
                  onChange={(e) => onChange({ existingTagline: e.target.value })}
                  placeholder="e.g. Quality fabrics for all occasions"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-emerald-600" />
                  Current Brand Colours (optional)
                </label>
                <input
                  type="text"
                  value={input.currentColours}
                  onChange={(e) => onChange({ currentColours: e.target.value })}
                  placeholder="e.g. Forest Green and Gold, or #0D5C3A, #D97706"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Business Description */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-stone-700">
              Short Description of the Business <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-stone-400">What you sell, location, years in business</span>
          </div>
          <textarea
            required
            rows={3}
            value={input.businessDescription}
            onChange={(e) => onChange({ businessDescription: e.target.value })}
            placeholder="e.g. We sell bespoke African lace, hand-dyed Adire, and custom ready-to-wear in Ikeja, Lagos since 2019. Our physical walk-in clients love our stitching, but our online presence feels disorganized..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white leading-relaxed resize-none"
          />
        </div>

        {/* Target Customers */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              Target Customers <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-stone-400">Who buys or should be buying from you</span>
          </div>
          <input
            type="text"
            required
            value={input.targetCustomers}
            onChange={(e) => onChange({ targetCustomers: e.target.value })}
            placeholder="e.g. Working Nigerian women (28-50), corporate chic professionals, and wedding guests in Lagos, Abuja & diaspora"
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>

        {/* Target Market Location (All 36 States + FCT) */}
        <NigerianMarketRegionSelector
          selectedRegions={selectedRegions}
          onChange={(regions) => {
            if (onSelectedRegionsChange) onSelectedRegionsChange(regions);
            if (onTargetLocationChange) onTargetLocationChange(formatRegionSummary(regions));
          }}
        />

        {/* What the user wants to improve (Required Multi-select checklist) */}
        <div>
          <label className="block text-xs font-bold text-stone-900 mb-1.5 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-600" />
            What do you want to improve about your brand? (Select all that apply)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {IMPROVEMENT_OPTIONS.map((opt) => {
              const isChecked = input.improvementGoals.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleToggleGoal(opt.id)}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                    isChecked
                      ? 'border-emerald-600 bg-emerald-50/80 ring-1 ring-emerald-500/30'
                      : 'border-stone-200 bg-stone-50 hover:bg-white hover:border-stone-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                      isChecked
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-stone-300 bg-white'
                    }`}
                  >
                    {isChecked && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">{opt.label}</p>
                    <p className="text-[11px] text-stone-500 leading-tight mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rebranding Policy & Protection Banner */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/60 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-amber-950">
                Preserve Established Brand Equity (Default Policy)
              </h5>
              <p className="text-xs text-amber-900 leading-relaxed mt-0.5">
                The AI brand strategist will preserve your existing brand name "{input.existingBrandName || 'Your Business'}", core color foundation, and customer recognition, while professionally upgrading your positioning, consistency, messaging, and marketing.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700 shrink-0 bg-white px-3 py-1.5 rounded-lg border border-amber-200 shadow-xs">
            <input
              type="checkbox"
              checked={input.rebrandRequested}
              onChange={(e) => onChange({ rebrandRequested: e.target.checked })}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>I want a full rebrand</span>
          </label>
        </div>

        {/* Pre-generation confirmation notice if recognition is pending */}
        {recognition && !recognitionConfirmed && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              Please review and click <strong>"Confirm Product & Continue"</strong> on the Product Recognition card above before generating strategic brand improvements.
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
              <span>Analyze & Generate Strategic Brand Improvements</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
