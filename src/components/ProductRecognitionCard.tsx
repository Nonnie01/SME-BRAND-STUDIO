import React, { useState } from 'react';
import {
  ProductRecognitionResult,
  StructuredProductCategory,
  STRUCTURED_PRODUCT_CATEGORIES,
} from '../types';
import {
  Scan,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Edit3,
  ShieldCheck,
  Tag,
  Building2,
  Users,
  Eye,
  Info,
  RefreshCw,
} from 'lucide-react';

interface ProductRecognitionCardProps {
  recognition: ProductRecognitionResult;
  imagePreview: string | null;
  onConfirm: (confirmedData: ProductRecognitionResult) => void;
  onReScan?: () => void;
  isScanning?: boolean;
}

export const ProductRecognitionCard: React.FC<ProductRecognitionCardProps> = ({
  recognition,
  imagePreview,
  onConfirm,
  onReScan,
  isScanning = false,
}) => {
  // Allow manual editing of identified fields
  const [productIdentified, setProductIdentified] = useState(recognition.productIdentified);
  const [productCategory, setProductCategory] = useState<StructuredProductCategory>(
    recognition.productCategory
  );
  const [productSubcategory, setProductSubcategory] = useState(recognition.productSubcategory);
  const [industry, setIndustry] = useState(recognition.industry);
  const [likelyTargetAudience, setLikelyTargetAudience] = useState(recognition.likelyTargetAudience);
  const [visualDescription, setVisualDescription] = useState(recognition.visualDescription);
  const [isEditing, setIsEditing] = useState(false);

  const confidence = recognition.identificationConfidence;
  const isHighConfidence = confidence.level === 'High';
  const isMediumConfidence = confidence.level === 'Medium';

  const handleConfirm = () => {
    onConfirm({
      ...recognition,
      productIdentified,
      productCategory,
      productSubcategory,
      industry,
      likelyTargetAudience,
      visualDescription,
    });
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-7 border-2 border-emerald-600/80 shadow-lg space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-teal-600 text-white flex items-center justify-center shadow-md">
            <Scan className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-stone-900">
                AI Product Recognition Results
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Pre-Generation Audit
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Visual classification & taxometric identification verified before brand formulation
            </p>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              isHighConfidence
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : isMediumConfidence
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}
          >
            {isHighConfidence ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span>
              Identification Confidence: {confidence.percentage}% ({confidence.level})
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-stone-500" />
            <span>{isEditing ? 'Done Editing' : 'Edit Details'}</span>
          </button>
        </div>
      </div>

      {/* Ambiguity or Multiple Product Alert */}
      {recognition.clarificationRequired?.isAmbiguousOrMultiple && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <h4 className="text-xs sm:text-sm font-bold text-amber-950">
              Multiple Products or Ambiguity Detected
            </h4>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            {recognition.clarificationRequired.clarificationMessage ||
              'The photograph contains more than one product or background element. Please pick or refine which item is the primary product to brand:'}
          </p>
          {recognition.clarificationRequired.detectedItems && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {recognition.clarificationRequired.detectedItems.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setProductIdentified(item)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    productIdentified === item
                      ? 'bg-amber-800 text-white font-bold'
                      : 'bg-white text-stone-700 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  Focus on: {item}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Results Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Thumbnail & Visual Observation (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          {imagePreview && (
            <div className="rounded-xl overflow-hidden border border-stone-200 bg-stone-50 aspect-square flex items-center justify-center p-2 relative group">
              <img
                src={imagePreview}
                alt={productIdentified}
                className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
              />
              <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                <Eye className="w-2.5 h-2.5" /> Verified Photograph
              </span>
            </div>
          )}

          {/* Factual Distinction Box */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Confirmed Visible Attributes:</span>
            </div>
            <ul className="text-stone-700 space-y-1 list-disc list-inside text-[11px] leading-snug">
              {recognition.confirmedCharacteristics.map((attr, idx) => (
                <li key={idx}>{attr}</li>
              ))}
            </ul>

            <div className="pt-2 border-t border-stone-200 flex items-center gap-1.5 text-amber-800 font-bold">
              <Info className="w-3.5 h-3.5 text-amber-600" />
              <span>Visual Estimates (Non-Assumed):</span>
            </div>
            <ul className="text-stone-600 space-y-1 list-disc list-inside text-[11px] leading-snug">
              {recognition.visualEstimates.map((est, idx) => (
                <li key={idx}>{est}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Detailed Fields (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* 1. Product Identified & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                Product Identified:
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={productIdentified}
                  onChange={(e) => setProductIdentified(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              ) : (
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 font-bold text-stone-900 text-sm">
                  {productIdentified}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Product Category:
              </label>
              {isEditing ? (
                <select
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value as StructuredProductCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold"
                >
                  {STRUCTURED_PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                  <span>
                    {STRUCTURED_PRODUCT_CATEGORIES.find((c) => c.id === productCategory)?.icon || '✨'}
                  </span>
                  <span>{productCategory}</span>
                </div>
              )}
            </div>
          </div>

          {/* Alternative Category Quick Switch (if confidence is medium or low) */}
          {recognition.alternativeCategories && recognition.alternativeCategories.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-stone-500 font-medium">Or did you mean:</span>
              {recognition.alternativeCategories.map((altCat, aIdx) => (
                <button
                  key={aIdx}
                  type="button"
                  onClick={() => setProductCategory(altCat)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
                    productCategory === altCat
                      ? 'bg-emerald-800 text-white border-emerald-800'
                      : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                  }`}
                >
                  {altCat}
                </button>
              ))}
            </div>
          )}

          {/* 2. Subcategory & Industry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Product Subcategory:
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={productSubcategory}
                  onChange={(e) => setProductSubcategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              ) : (
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-800">
                  {productSubcategory}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-stone-500" />
                Industry:
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              ) : (
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-800">
                  {industry}
                </div>
              )}
            </div>
          </div>

          {/* 3. Visual Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Visual Description:
            </label>
            {isEditing ? (
              <textarea
                rows={2}
                value={visualDescription}
                onChange={(e) => setVisualDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white leading-relaxed resize-none"
              />
            ) : (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-700 leading-relaxed">
                {visualDescription}
              </div>
            )}
          </div>

          {/* 4. Likely Target Audience */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              Likely Target Audience:
            </label>
            {isEditing ? (
              <input
                type="text"
                value={likelyTargetAudience}
                onChange={(e) => setLikelyTargetAudience(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            ) : (
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-800">
                {likelyTargetAudience}
              </div>
            )}
          </div>

          {/* Confidence Rationale Note */}
          <p className="text-[11px] text-stone-500 italic">
            Confidence Rationale: {confidence.explanation}
          </p>
        </div>
      </div>

      {/* Confirmation & Continue Footer Button */}
      <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Confirming locks in these details to generate your tailored brand kit.</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onReScan && (
            <button
              type="button"
              disabled={isScanning}
              onClick={onReScan}
              className="px-3.5 py-3 rounded-xl text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>Re-scan</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-extrabold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 hover:from-emerald-900 hover:to-teal-800 shadow-md shadow-emerald-800/25 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Confirm Product & Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
