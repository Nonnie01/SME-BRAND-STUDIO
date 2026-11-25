import React, { useState } from 'react';
import { BrandImprovementResult, StrategicColorSwatch } from '../types';
import {
  Compass,
  CheckCircle2,
  Layers,
  Palette,
  MessageSquare,
  TrendingUp,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ArrowRight,
  Eye,
  Sliders,
  Type,
  FileText,
} from 'lucide-react';

interface BrandImprovementReviewProps {
  result: BrandImprovementResult;
  existingBrandName: string;
  onApplyApprovedChanges: (approvedSections: {
    positioning: boolean;
    consistency: boolean;
    visualIdentity: boolean;
    messaging: boolean;
    marketing: boolean;
    socialMedia: boolean;
  }) => void;
  onCopyText: (text: string, label: string) => void;
}

export const BrandImprovementReview: React.FC<BrandImprovementReviewProps> = ({
  result,
  existingBrandName,
  onApplyApprovedChanges,
  onCopyText,
}) => {
  const { brandAudit, recommendations } = result;

  // Individual approval checkboxes for each of the 6 recommendation sections
  const [approvals, setApprovals] = useState({
    positioning: true,
    consistency: true,
    visualIdentity: true,
    messaging: true,
    marketing: true,
    socialMedia: true,
  });

  const [activeReviewTab, setActiveReviewTab] = useState<
    'positioning' | 'consistency' | 'visual' | 'messaging' | 'marketing' | 'social'
  >('positioning');

  const toggleApproval = (key: keyof typeof approvals) => {
    setApprovals((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const approveAll = () => {
    setApprovals({
      positioning: true,
      consistency: true,
      visualIdentity: true,
      messaging: true,
      marketing: true,
      socialMedia: true,
    });
  };

  const totalApproved = Object.values(approvals).filter(Boolean).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Strategist Diagnostic Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-neutral-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-stone-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white">
                Brand Audit & Elevation Diagnostic: {existingBrandName}
              </h4>
              <p className="text-xs text-stone-400">
                Preserving established brand equity while fixing consistency and market positioning gaps
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50">
              {totalApproved} of 6 Sections Approved
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-stone-200 leading-relaxed italic bg-white/5 p-3 rounded-xl border border-white/10">
          "{brandAudit.summary}"
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-800/40 space-y-1.5">
            <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Preserved Brand Elements (Protected Equity)
            </span>
            <ul className="text-stone-300 space-y-1 list-disc list-inside">
              {brandAudit.preservedElements.map((el, idx) => (
                <li key={idx} className="leading-snug">{el}</li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-950/40 p-3.5 rounded-xl border border-amber-800/40 space-y-1.5">
            <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Critical Gaps Identified (To Be Upgraded)
            </span>
            <ul className="text-stone-300 space-y-1 list-disc list-inside">
              {brandAudit.criticalGapsIdentified.map((gap, idx) => (
                <li key={idx} className="leading-snug">{gap}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for the 6 Recommendation Areas */}
      <div className="bg-white rounded-2xl p-2 border border-stone-200 shadow-xs flex flex-wrap gap-1.5">
        {[
          { id: 'positioning', label: '1. Brand Positioning', approved: approvals.positioning, icon: Compass },
          { id: 'consistency', label: '2. Brand Consistency', approved: approvals.consistency, icon: Layers },
          { id: 'visual', label: '3. Visual Identity', approved: approvals.visualIdentity, icon: Palette },
          { id: 'messaging', label: '4. Messaging & Tagline', approved: approvals.messaging, icon: MessageSquare },
          { id: 'marketing', label: '5. Marketing Strategy', approved: approvals.marketing, icon: TrendingUp },
          { id: 'social', label: '6. Social Content', approved: approvals.socialMedia, icon: Share2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReviewTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveReviewTab(tab.id as any)}
              className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.approved ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 ml-1"></span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-stone-300 ml-1"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Review Card Container */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-stone-200 shadow-xs space-y-6">
        {/* Card Header with Approval Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mb-1">
              Strategist Recommendation Review
            </span>
            <h4 className="text-base sm:text-lg font-bold text-stone-900">
              {activeReviewTab === 'positioning' && 'Brand Positioning Recommendations'}
              {activeReviewTab === 'consistency' && 'Brand Consistency & Operational Rules'}
              {activeReviewTab === 'visual' && 'Improved Visual Identity & Colour Palette'}
              {activeReviewTab === 'messaging' && 'Brand Messaging & Elevated Taglines'}
              {activeReviewTab === 'marketing' && 'Nigerian Market Sales Strategy'}
              {activeReviewTab === 'social' && 'Social Media Content & Campaign Calendar'}
            </h4>
          </div>

          {/* Individual Approval Toggle Button */}
          <button
            type="button"
            onClick={() => {
              if (activeReviewTab === 'positioning') toggleApproval('positioning');
              if (activeReviewTab === 'consistency') toggleApproval('consistency');
              if (activeReviewTab === 'visual') toggleApproval('visualIdentity');
              if (activeReviewTab === 'messaging') toggleApproval('messaging');
              if (activeReviewTab === 'marketing') toggleApproval('marketing');
              if (activeReviewTab === 'social') toggleApproval('socialMedia');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              (activeReviewTab === 'positioning' && approvals.positioning) ||
              (activeReviewTab === 'consistency' && approvals.consistency) ||
              (activeReviewTab === 'visual' && approvals.visualIdentity) ||
              (activeReviewTab === 'messaging' && approvals.messaging) ||
              (activeReviewTab === 'marketing' && approvals.marketing) ||
              (activeReviewTab === 'social' && approvals.socialMedia)
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {(activeReviewTab === 'positioning' && approvals.positioning) ||
              (activeReviewTab === 'consistency' && approvals.consistency) ||
              (activeReviewTab === 'visual' && approvals.visualIdentity) ||
              (activeReviewTab === 'messaging' && approvals.messaging) ||
              (activeReviewTab === 'marketing' && approvals.marketing) ||
              (activeReviewTab === 'social' && approvals.socialMedia)
                ? 'Recommendation Approved'
                : 'Click to Approve'}
            </span>
          </button>
        </div>

        {/* 1. Brand Positioning Details */}
        {activeReviewTab === 'positioning' && (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block mb-1">
                Current Market Stance Audit:
              </span>
              <p className="text-xs sm:text-sm text-amber-950 leading-relaxed">
                {recommendations.brandPositioning.currentAssessment}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
                  Refined Brand Positioning Statement
                </span>
                <p className="text-xs sm:text-sm text-stone-900 font-bold leading-relaxed">
                  "{recommendations.brandPositioning.refinedPositioning}"
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full inline-block">
                  Refined Unique Selling Proposition (USP)
                </span>
                <p className="text-xs sm:text-sm text-stone-900 font-bold leading-relaxed">
                  "{recommendations.brandPositioning.refinedUSP}"
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/70">
                <span className="font-bold text-stone-900 block mb-1">🎯 Refined Target Audience:</span>
                <p className="text-stone-700 leading-relaxed">
                  {recommendations.brandPositioning.refinedTargetAudience}
                </p>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/70">
                <span className="font-bold text-stone-900 block mb-1">💡 Customer Needs & Buying Drivers:</span>
                <p className="text-stone-700 leading-relaxed">
                  {recommendations.brandPositioning.customerNeedsAndMotivations}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs">
              <span className="font-bold text-emerald-950 block mb-1">🛡️ Market Differentiation:</span>
              <p className="text-emerald-900 leading-relaxed">
                {recommendations.brandPositioning.marketDifferentiation}
              </p>
            </div>
          </div>
        )}

        {/* 2. Brand Consistency Details */}
        {activeReviewTab === 'consistency' && (
          <div className="space-y-4">
            <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200/60 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-900 block">
                Consistency Gaps Holding Your Brand Back:
              </span>
              <ul className="text-xs text-rose-950 space-y-1 list-disc list-inside">
                {recommendations.brandConsistency.consistencyGaps.map((gap, gIdx) => (
                  <li key={gIdx} className="leading-relaxed">{gap}</li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800 block mb-2">
                4 Non-Negotiable Operational & Visual Rules for Your Business:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recommendations.brandConsistency.brandRules.map((rule, rIdx) => (
                  <div key={rIdx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {rIdx + 1}
                    </span>
                    <p className="text-stone-800 font-medium leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1 text-xs">
              <span className="font-bold text-stone-900 block">💬 Communication Tone & Consistency Rules:</span>
              <p className="text-stone-700 leading-relaxed">
                {recommendations.brandConsistency.toneConsistencyRules}
              </p>
            </div>
          </div>
        )}

        {/* 3. Improved Visual Identity */}
        {activeReviewTab === 'visual' && (
          <div className="space-y-5">
            {/* Logo Critique */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mb-1">
                Logo Critique & Modernization Recommendations
              </span>
              <p className="text-stone-800 leading-relaxed text-xs sm:text-sm">
                {recommendations.improvedVisualIdentity.logoCritiqueAndRefinement}
              </p>
            </div>

            {/* Refined 4 Colours */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  Refined Complementary 4-Colour Palette (Honoring Your Brand Hues):
                </span>
                <span className="text-[11px] text-stone-400">Click to copy HEX</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {recommendations.improvedVisualIdentity.refinedColorPalette.map((color, cIdx) => (
                  <div
                    key={cIdx}
                    onClick={() => onCopyText(color.hex, `${color.name} (${color.hex})`)}
                    className="p-3 rounded-xl border border-stone-200 bg-stone-50 hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer space-y-2"
                  >
                    <div
                      className="h-16 rounded-lg w-full flex items-end justify-between p-2"
                      style={{ backgroundColor: color.hex }}
                    >
                      <span className="bg-black/60 text-white font-mono text-[9px] px-1.5 py-0.5 rounded">
                        {color.hex}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                        {color.role}
                      </span>
                      <p className="text-xs font-bold text-stone-900 mt-1">{color.name}</p>
                      <p className="text-[10px] text-stone-600 line-clamp-2 mt-0.5">
                        {color.psychologicalReason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Packaging and Typography */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 block flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-stone-500" /> Typography Upgrade:
                </span>
                <p className="text-stone-700">
                  <span className="font-semibold text-stone-900">Header:</span>{' '}
                  {recommendations.improvedVisualIdentity.typographyUpgrade.headerFont} •{' '}
                  <span className="font-semibold text-stone-900">Body:</span>{' '}
                  {recommendations.improvedVisualIdentity.typographyUpgrade.bodyFont}
                </p>
                <p className="text-stone-500 italic">
                  {recommendations.improvedVisualIdentity.typographyUpgrade.styleNote}
                </p>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 block flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Packaging & Dispatch Upgrade:
                </span>
                <p className="text-stone-700 leading-relaxed">
                  {recommendations.improvedVisualIdentity.packagingUpgradeAdvice}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4. Brand Messaging and Tagline */}
        {activeReviewTab === 'messaging' && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800 block mb-2">
                3 Elevated Tagline Options for Your Business:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recommendations.brandMessagingAndTagline.taglineOptions.map((opt, tIdx) => {
                  const isTopPick = opt.tagline === recommendations.brandMessagingAndTagline.recommendedTagline;
                  return (
                    <div
                      key={tIdx}
                      className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between ${
                        isTopPick
                          ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500/30'
                          : 'border-stone-200 bg-stone-50'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                          Angle: {opt.angle}
                        </span>
                        <p className="text-sm font-bold text-stone-900 italic">"{opt.tagline}"</p>
                      </div>
                      {isTopPick && (
                        <span className="mt-2 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full self-start">
                          ⭐ Recommended Top Pick
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/70 space-y-1 text-xs">
              <span className="font-bold text-emerald-950 block">Strategic Tagline Rationale:</span>
              <p className="text-emerald-900 leading-relaxed">
                {recommendations.brandMessagingAndTagline.taglineRationale}
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1 text-xs">
              <span className="font-bold text-stone-900 block">⚡ 30-Second Elevator Pitch:</span>
              <p className="text-stone-800 italic leading-relaxed text-xs sm:text-sm">
                "{recommendations.brandMessagingAndTagline.coreElevatorPitch}"
              </p>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800 block mb-1.5">
                Core Brand Messaging Pillars:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {recommendations.brandMessagingAndTagline.keyMessagingPillars.map((pillar, pIdx) => (
                  <div key={pIdx} className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-stone-700">
                    <span className="font-bold text-stone-900 block mb-0.5">Pillar {pIdx + 1}:</span>
                    {pillar}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. Marketing Strategy */}
        {activeReviewTab === 'marketing' && (
          <div className="space-y-4">
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mb-1">
                Pricing Tier & Value Perception Strategy
              </span>
              <p className="text-stone-800 leading-relaxed text-xs sm:text-sm">
                {recommendations.marketingStrategy.priceTierAndPerceptionStrategy}
              </p>
            </div>

            <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/70 space-y-2 text-xs">
              <span className="font-bold text-amber-950 block text-xs sm:text-sm">
                🛡️ 3 Concrete Tactics to Overcome Nigerian Buyer Skepticism:
              </span>
              <div className="space-y-2">
                {recommendations.marketingStrategy.trustBuildingTactics.map((tactic, tIdx) => (
                  <div key={tIdx} className="bg-white/90 p-2.5 rounded-lg border border-amber-200 text-amber-950 leading-relaxed">
                    <span className="font-bold text-amber-900">Tactic {tIdx + 1}: </span>
                    {tactic}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1 text-xs">
              <span className="font-bold text-stone-900 block">📲 WhatsApp Business & Omnichannel Playbook:</span>
              <p className="text-stone-700 leading-relaxed">
                {recommendations.marketingStrategy.omnichannelPlan}
              </p>
            </div>
          </div>
        )}

        {/* 6. Social Media Content */}
        {activeReviewTab === 'social' && (
          <div className="space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800 block mb-2">
                Weekly Content Calendar Pillars (4 Weekly Buckets):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                {recommendations.socialMediaContent.weeklyContentPillars.map((pillar, wIdx) => (
                  <div key={wIdx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-800 font-medium">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">
                      Bucket {wIdx + 1}
                    </span>
                    {pillar}
                  </div>
                ))}
              </div>
            </div>

            {/* Captions Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* English */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  🇬🇧 Revamped Professional English Captions:
                </span>
                {recommendations.socialMediaContent.revampedEnglishCaptions.map((cap, cIdx) => (
                  <div key={cIdx} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">{cap.title}</span>
                      <button
                        type="button"
                        onClick={() => onCopyText(`${cap.hook}\n\n${cap.body}\n\n👉 ${cap.callToAction}\n\n${cap.hashtags.join(' ')}`, cap.title)}
                        className="text-[10px] text-stone-500 hover:text-stone-900 font-semibold flex items-center gap-0.5 cursor-pointer"
                      >
                        <Copy className="w-2.5 h-2.5" /> Copy
                      </button>
                    </div>
                    <p className="font-bold text-stone-800">{cap.hook}</p>
                    <p className="text-stone-600 line-clamp-3">{cap.body}</p>
                    <p className="text-emerald-800 font-semibold">CTA: {cap.callToAction}</p>
                  </div>
                ))}
              </div>

              {/* Pidgin */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  🇳🇬 Revamped Nigerian Pidgin Captions:
                </span>
                {recommendations.socialMediaContent.revampedPidginCaptions.map((cap, cIdx) => (
                  <div key={cIdx} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">{cap.title}</span>
                      <button
                        type="button"
                        onClick={() => onCopyText(`${cap.hook}\n\n${cap.body}\n\n👉 ${cap.callToAction}\n\n${cap.hashtags.join(' ')}`, cap.title)}
                        className="text-[10px] text-stone-500 hover:text-stone-900 font-semibold flex items-center gap-0.5 cursor-pointer"
                      >
                        <Copy className="w-2.5 h-2.5" /> Copy
                      </button>
                    </div>
                    <p className="font-bold text-stone-800">{cap.hook}</p>
                    <p className="text-stone-600 line-clamp-3">{cap.body}</p>
                    <p className="text-amber-800 font-semibold">CTA: {cap.callToAction}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp Status Sequence */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800 block mb-2">
                WhatsApp Status Launch Sequence:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {recommendations.socialMediaContent.whatsAppStatusCampaign.map((status, sIdx) => (
                  <div key={sIdx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                    <span className="font-bold text-emerald-800 block">{status.part}</span>
                    <p className="text-stone-800 bg-white p-2 rounded-lg border border-stone-100 leading-relaxed italic">
                      "{status.text}"
                    </p>
                    <p className="text-[10px] text-stone-500">📸 {status.visualTip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Global Bottom Actions: Approve All & Apply Approved Changes */}
        <div className="pt-5 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={approveAll}
              className="text-xs font-semibold px-3 py-2 rounded-xl text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer w-full sm:w-auto"
            >
              Approve All Recommendations
            </button>
          </div>

          <button
            type="button"
            onClick={() => onApplyApprovedChanges(approvals)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 hover:from-emerald-900 hover:to-teal-800 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Apply Approved Changes & Launch in Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
