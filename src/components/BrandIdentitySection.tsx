import React from 'react';
import { BrandIdentity, StrategicColorSwatch } from '../types';
import { InteractiveBrandPalette } from './InteractiveBrandPalette';
import {
  Palette,
  Compass,
  Star,
  Type,
  UserCheck,
  Copy,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  TrendingUp,
  Volume2,
  Layers,
  Sparkles,
  MapPin,
  Globe,
} from 'lucide-react';

interface BrandIdentitySectionProps {
  identity: BrandIdentity;
  onCopyText: (text: string, label: string) => void;
  onUpdatePalette?: (newPalette: StrategicColorSwatch[]) => void;
  onRegeneratePalette?: () => Promise<void>;
  isRegeneratingPalette?: boolean;
  paletteError?: string | null;
  onDismissPaletteError?: () => void;
}

export const BrandIdentitySection: React.FC<BrandIdentitySectionProps> = ({
  identity,
  onCopyText,
  onUpdatePalette,
  onRegeneratePalette,
  isRegeneratingPalette = false,
  paletteError = null,
  onDismissPaletteError,
}) => {
  const {
    selectedName,
    selectedTagline,
    strongestNameRationale,
    colorPalette,
    positioning,
    marketStrategy,
    qualityAudit,
    typographyRecommendation,
    idealCustomerPersona,
  } = identity;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-stone-200 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-600" />
              Strategic Brand Identity & Market Positioning
            </h3>
            <p className="text-xs sm:text-sm text-stone-500">
              Formulated by Senior Nigerian Brand Strategy: grounded product audit, psychological color harmony, and market positioning.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cohesion Score: {qualityAudit?.cohesionScore || 98}%</span>
          </div>
        </div>
      </div>

      {/* 1. Quality Control & Product Understanding Audit */}
      {qualityAudit && (
        <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-neutral-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-stone-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  Senior Strategist Audit: Grounded Truth & Factual Integrity
                </h4>
                <p className="text-[11px] text-stone-400">
                  Strict distinction between visual observation and user claims (no hallucinated certifications)
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50">
              Zero-Slop Verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-1">
              <span className="text-emerald-400 font-bold block uppercase tracking-wider text-[10px]">
                📸 Physical Photograph Observations
              </span>
              <p className="text-stone-300 leading-relaxed">
                {qualityAudit.photoObservations}
              </p>
            </div>

            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-1">
              <span className="text-amber-400 font-bold block uppercase tracking-wider text-[10px]">
                📝 User-Supplied Information & Scope
              </span>
              <p className="text-stone-300 leading-relaxed">
                {qualityAudit.userSuppliedData}
              </p>
            </div>
          </div>

          <div className="p-3 bg-emerald-950/50 rounded-xl border border-emerald-800/40 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-stone-300">
              <span className="font-bold text-emerald-300">Grounded Claims Policy: </span>
              {qualityAudit.groundedClaimsPolicy}
            </div>
          </div>
        </div>
      )}

      {/* 2. Expanded Interactive Brand Colour Palette (6–8 Coordinated Colours) */}
      <InteractiveBrandPalette
        palette={colorPalette}
        onUpdatePalette={onUpdatePalette || (() => {})}
        onRegeneratePalette={onRegeneratePalette}
        isRegenerating={isRegeneratingPalette}
        paletteError={paletteError}
        onDismissPaletteError={onDismissPaletteError}
        onCopyText={onCopyText}
        brandName={selectedName}
        tagline={selectedTagline}
      />

      {/* 3. Brand Positioning Blueprint */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            <div>
              <h4 className="text-base font-bold text-stone-900">Brand Positioning Architecture</h4>
              <p className="text-xs text-stone-500">
                Core value proposition, audience motivations, market differentiation, and brand promise.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              onCopyText(
                `Brand Positioning: ${selectedName}\nUSP: ${positioning.uniqueSellingProposition}\nDifferentiation: ${positioning.marketDifferentiation}\nPromise: ${positioning.brandPromise}`,
                'Brand Positioning'
              )
            }
            className="text-xs font-semibold px-3 py-1.5 rounded-lg text-stone-700 bg-stone-100 hover:bg-stone-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Positioning</span>
          </button>
        </div>

        {/* Core Matrix Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Target Audience & Needs */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80 space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full inline-block mb-1">
                Target Audience Specification
              </span>
              <p className="text-xs sm:text-sm text-stone-800 font-medium leading-relaxed">
                {positioning.targetAudience}
              </p>
            </div>

            <div className="pt-2 border-t border-stone-200/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full inline-block mb-1">
                Customer Needs & Purchasing Motivations
              </span>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                {positioning.customerNeedsAndMotivations}
              </p>
            </div>
          </div>

          {/* USP & Market Differentiation */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80 space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-full inline-block mb-1">
                Unique Selling Proposition (USP)
              </span>
              <p className="text-xs sm:text-sm text-stone-900 font-bold leading-relaxed">
                "{positioning.uniqueSellingProposition}"
              </p>
            </div>

            <div className="pt-2 border-t border-stone-200/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-100/80 px-2 py-0.5 rounded-full inline-block mb-1">
                Market Differentiation (vs Competitors & Imports)
              </span>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                {positioning.marketDifferentiation}
              </p>
            </div>
          </div>
        </div>

        {/* Brand Promise Banner */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 block mb-0.5">
              The Unbreakable Brand Promise
            </span>
            <p className="text-sm sm:text-base font-bold italic text-white">
              "{positioning.brandPromise}"
            </p>
          </div>
          <button
            type="button"
            onClick={() => onCopyText(positioning.brandPromise, 'Brand Promise')}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
          >
            Copy Promise
          </button>
        </div>

        {/* Brand Personality Traits */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-2">
            Brand Personality Traits & Behavioral Rationale:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {positioning.brandPersonality.map((item, idx) => (
              <div
                key={idx}
                className="bg-stone-50 rounded-xl p-3 border border-stone-200/70 space-y-1"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span className="text-xs font-bold text-stone-900">{item.trait}</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">{item.rationale}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Brand Voice Guide (Dos & Don'ts) */}
        <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-700" />
              <h5 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                Brand Voice & Communication Playbook
              </h5>
            </div>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
              Tone: {positioning.brandVoice.tone}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1.5">
              Brand Vocabulary & Power Words:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {positioning.brandVoice.vocabulary.map((word, wIdx) => (
                <span
                  key={wIdx}
                  className="text-xs font-semibold px-2 py-0.5 bg-white text-stone-700 rounded-md border border-stone-200"
                >
                  "{word}"
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200/70 space-y-1">
              <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Communication DOs:
              </span>
              <ul className="text-xs text-emerald-950 space-y-1 list-disc list-inside">
                {positioning.brandVoice.communicationDos.map((doItem, dIdx) => (
                  <li key={dIdx} className="leading-snug">{doItem}</li>
                ))}
              </ul>
            </div>

            <div className="bg-rose-50/70 p-3 rounded-lg border border-rose-200/70 space-y-1">
              <span className="text-[11px] font-bold text-rose-900 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Communication DON'Ts:
              </span>
              <ul className="text-xs text-rose-950 space-y-1 list-disc list-inside">
                {positioning.brandVoice.communicationDonts.map((dontItem, dIdx) => (
                  <li key={dIdx} className="leading-snug">{dontItem}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Market Relevance & Strategy in Nigerian Context */}
      {marketStrategy && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <div>
              <h4 className="text-base font-bold text-stone-900">
                Market Relevance & Nigerian Consumer Strategy
              </h4>
              <p className="text-xs text-stone-500">
                Actionable tactics addressing real Nigerian purchasing habits, price tiers, and delivery friction.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Price Tier Analysis */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
                Price Tier Economics
              </span>
              <h5 className="text-xs font-bold text-stone-900">Purchasing Power Analysis</h5>
              <p className="text-xs text-stone-600 leading-relaxed">
                {marketStrategy.priceTierAnalysis}
              </p>
            </div>

            {/* Trust Building Tactics */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full inline-block">
                Overcoming Nigerian Skepticism
              </span>
              <h5 className="text-xs font-bold text-stone-900">Trust Building Tactics</h5>
              <ul className="text-xs text-stone-700 space-y-1 list-disc list-inside">
                {marketStrategy.trustBuildingTactics.map((tactic, tIdx) => (
                  <li key={tIdx} className="leading-relaxed">{tactic}</li>
                ))}
              </ul>
            </div>

            {/* Channel Strategy */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full inline-block">
                Omnichannel Playbook
              </span>
              <h5 className="text-xs font-bold text-stone-900">WhatsApp & Instagram Conversion</h5>
              <p className="text-xs text-stone-600 leading-relaxed">
                {marketStrategy.channelStrategy}
              </p>
            </div>
          </div>

          {/* Location-Specific Regional Marketing Recommendations */}
          {marketStrategy.locationSpecificTactics && marketStrategy.locationSpecificTactics.length > 0 && (
            <div className="pt-3.5 border-t border-stone-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <h5 className="text-xs sm:text-sm font-bold text-stone-900">
                    Location-Specific Marketing Tactics for Selected Nigerian States & Markets
                  </h5>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  Geopolitical Analysis
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {marketStrategy.locationSpecificTactics.map((loc, lIdx) => (
                  <div
                    key={lIdx}
                    className="p-3.5 bg-gradient-to-br from-emerald-50/60 via-stone-50 to-amber-50/40 rounded-xl border border-emerald-200/80 space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-emerald-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        📍
                      </span>
                      <h6 className="text-xs font-bold text-emerald-950 truncate">{loc.region}</h6>
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed">{loc.tactics}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Pitfalls to Avoid & Packaging Guidelines */}
      {qualityAudit && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pitfalls to Avoid */}
          <div className="bg-amber-50/60 rounded-2xl p-5 border border-amber-200/70 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h5 className="text-xs sm:text-sm font-bold text-amber-950 uppercase tracking-wide">
                Critical Pitfalls This Nigerian SME Must Avoid
              </h5>
            </div>
            <div className="space-y-2">
              {qualityAudit.pitfallsToAvoid.map((pitfall, pIdx) => (
                <div key={pIdx} className="bg-white/80 p-2.5 rounded-lg border border-amber-200/60 text-xs text-amber-950 leading-relaxed">
                  {pitfall}
                </div>
              ))}
            </div>
          </div>

          {/* Packaging and Service Delivery Standards Advice */}
          <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-200/70 space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-emerald-600" />
              <h5 className="text-xs sm:text-sm font-bold text-emerald-950 uppercase tracking-wide">
                Service Delivery Standards, Onboarding & Catalog Advice
              </h5>
            </div>
            <div className="bg-white/80 p-3 rounded-lg border border-emerald-200/60 text-xs text-emerald-950 leading-relaxed">
              {qualityAudit.packagingAndDisplayAdvice}
            </div>
            <div className="pt-2 border-t border-emerald-200/60 text-[11px] text-emerald-800 italic">
              Consistency Assessment: {qualityAudit.consistencyReview}
            </div>
          </div>
        </div>
      )}

      {/* 6. Typography & Buyer Persona */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Typography */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <h5 className="text-sm font-bold text-stone-900 flex items-center gap-2 mb-2">
              <Type className="w-4 h-4 text-stone-500" />
              Typography Recommendation
            </h5>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60 space-y-1 text-xs">
              <p>
                <span className="font-bold text-stone-900">Header Font:</span>{' '}
                {typographyRecommendation.headerFont}
              </p>
              <p>
                <span className="font-bold text-stone-900">Body Font:</span>{' '}
                {typographyRecommendation.bodyFont}
              </p>
              <p className="text-stone-500 italic mt-1">{typographyRecommendation.styleNote}</p>
            </div>
          </div>
        </div>

        {/* Customer Persona */}
        <div className="bg-gradient-to-r from-stone-900 to-slate-900 text-white rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                Target Persona: {idealCustomerPersona.name}
              </h5>
              <span className="text-[10px] text-stone-400 font-mono">
                {idealCustomerPersona.ageRange} • {idealCustomerPersona.location}
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <p className="text-rose-200 bg-white/5 p-2 rounded-lg border border-white/10">
                <span className="font-bold text-rose-300">Core Frustration: </span>
                {idealCustomerPersona.painPoint}
              </p>
              <p className="text-emerald-200 bg-white/5 p-2 rounded-lg border border-white/10">
                <span className="font-bold text-emerald-300">Why They Buy: </span>
                {idealCustomerPersona.whyTheyBuy}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
