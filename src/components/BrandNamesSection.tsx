import React from 'react';
import { BrandNameOption } from '../types';
import { Check, Copy, Sparkles, AtSign, Globe, BookmarkCheck, Crown, Award } from 'lucide-react';

interface BrandNamesSectionProps {
  brandNames: BrandNameOption[];
  activeBrandName: string;
  onSelectBrandName: (option: BrandNameOption) => void;
  onCopyText: (text: string, label: string) => void;
}

export const BrandNamesSection: React.FC<BrandNamesSectionProps> = ({
  brandNames,
  activeBrandName,
  onSelectBrandName,
  onCopyText,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-4">
        <div>
          <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            5 Distinctive Nigerian Brand Names & Strategic Slogans
          </h3>
          <p className="text-xs sm:text-sm text-stone-500">
            Carefully engineered to avoid clichés, reflect Nigerian cultural nuances, and establish immediate market distinction.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 self-start sm:self-auto">
          Click any card to set as Active Brand
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brandNames.map((brand, idx) => {
          const isSelected = activeBrandName.toLowerCase() === brand.name.toLowerCase();
          const cleanHandle = brand.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          const isRecommended = !!brand.isRecommended;

          return (
            <div
              key={idx}
              onClick={() => onSelectBrandName(brand)}
              className={`rounded-2xl p-5 border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                isRecommended
                  ? isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-amber-400/80 bg-amber-50/20 hover:border-amber-500 hover:shadow-md'
                  : isSelected
                  ? 'border-emerald-600 bg-emerald-50/40 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-stone-200 bg-white hover:border-emerald-300 hover:shadow-xs'
              }`}
            >
              <div>
                {/* Header Tag / Recommendation Pill */}
                <div className="flex items-center justify-between mb-3 gap-2">
                  {isRecommended ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                      <Crown className="w-3 h-3 text-amber-100" />
                      Strategist Top Pick
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700">
                      Option {idx + 1} • {brand.targetVibe}
                    </span>
                  )}

                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <BookmarkCheck className="w-3.5 h-3.5" /> Active
                    </span>
                  ) : (
                    <span className="text-[11px] text-stone-400 group-hover:text-emerald-600">
                      Select
                    </span>
                  )}
                </div>

                {/* Brand Name & Tagline */}
                <div className="mb-3">
                  <h4 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                    {brand.name}
                  </h4>
                  <p className="text-sm font-semibold text-emerald-800 italic mt-0.5">
                    "{brand.tagline}"
                  </p>
                </div>

                {/* Cultural Etymology & Strategic Meaning */}
                <div className="bg-stone-50/90 rounded-xl p-3 border border-stone-200/60 mb-3 space-y-1.5">
                  <p className="text-xs text-stone-700 leading-relaxed">
                    <span className="font-bold text-stone-900">Cultural Etymology: </span>
                    {brand.meaning}
                  </p>
                  {brand.recommendationRationale && (
                    <div className="pt-1.5 border-t border-stone-200/60 text-[11px] text-amber-950 font-medium bg-amber-100/40 p-2 rounded-lg">
                      <span className="font-bold text-amber-900">Commercial Reasoning: </span>
                      {brand.recommendationRationale}
                    </div>
                  )}
                </div>
              </div>

              {/* Social Handle Preview & Copy Bar */}
              <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-stone-500 font-mono text-[10px]">
                  <span className="flex items-center gap-0.5">
                    <AtSign className="w-3 h-3 text-emerald-600" />
                    {cleanHandle}_ng
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Globe className="w-3 h-3 text-emerald-600" />
                    {cleanHandle}.ng
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopyText(`${brand.name} - ${brand.tagline}`, 'Brand & Tagline');
                    }}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
                    title="Copy Name & Tagline"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectBrandName(brand);
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-emerald-600 hover:text-white'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Use Brand'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
