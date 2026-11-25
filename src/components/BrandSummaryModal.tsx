import React, { useState } from 'react';
import { BrandStudioResult } from '../types';
import { downloadBrandGuidePdf } from '../utils/brandExport';
import { X, Copy, Download, FileText, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

interface BrandSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: BrandStudioResult;
  productName: string;
  onCopyText: (text: string, label: string) => void;
}

export const BrandSummaryModal: React.FC<BrandSummaryModalProps> = ({
  isOpen,
  onClose,
  result,
  productName,
  onCopyText,
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  if (!isOpen) return null;

  const generateFullText = () => {
    const { brandIdentity, marketingCaptions, advertisingConcepts, visualAnalysis, brandNames } = result;
    const { positioning, qualityAudit, marketStrategy, colorPalette } = brandIdentity;

    return `================================================
SME BRAND STUDIO - COMPLETE BRAND GUIDE & STRATEGY
Brand Name: ${brandIdentity.selectedName}
Tagline: "${brandIdentity.selectedTagline}"
Product: ${productName}
================================================

1. SENIOR STRATEGIST QUALITY AUDIT & FACTUAL CHECK:
- Visual Observations: ${qualityAudit?.photoObservations || visualAnalysis}
- User-Supplied Information: ${qualityAudit?.userSuppliedData || 'Direct client brief'}
- Grounded Claims Policy: ${qualityAudit?.groundedClaimsPolicy || 'Claims grounded in physical evidence.'}
- Cohesion Score: ${qualityAudit?.cohesionScore || 98}%
- Consistency Review: ${qualityAudit?.consistencyReview || 'Consistent brand ecosystem.'}

2. 5 DISTINCTIVE BRAND NAME OPTIONS:
${brandNames
  .map(
    (b, idx) =>
      `[Option ${idx + 1}] ${b.name} - "${b.tagline}" ${b.isRecommended ? '⭐ (STRATEGIST TOP PICK)' : ''}
 Meaning: ${b.meaning}
 Vibe: ${b.targetVibe}
 ${b.recommendationRationale ? `Rationale: ${b.recommendationRationale}` : ''}`
  )
  .join('\n\n')}

3. STRATEGIC 4-COLOUR PALETTE:
${colorPalette
  .map(
    (c) =>
      `- ${c.name} (${c.hex}) [${c.role}]:
   Psychological Reason: ${c.psychologicalReason}
   Marketing Reason: ${c.marketingReason}`
  )
  .join('\n')}

4. BRAND POSITIONING ARCHITECTURE:
- Target Audience: ${positioning.targetAudience}
- Customer Needs & Motivations: ${positioning.customerNeedsAndMotivations}
- Unique Selling Proposition (USP): "${positioning.uniqueSellingProposition}"
- Market Differentiation: ${positioning.marketDifferentiation}
- Brand Promise: "${positioning.brandPromise}"
- Brand Personality:
${positioning.brandPersonality.map((p) => `  * ${p.trait}: ${p.rationale}`).join('\n')}
- Brand Voice:
  Tone: ${positioning.brandVoice.tone}
  Vocabulary: ${positioning.brandVoice.vocabulary.join(', ')}
  Communication DOs: ${positioning.brandVoice.communicationDos.join('; ')}
  Communication DON'Ts: ${positioning.brandVoice.communicationDonts.join('; ')}

5. NIGERIAN MARKET RELEVANCE & STRATEGY:
- Price Tier Analysis: ${marketStrategy.priceTierAnalysis}
- Trust Building Tactics:
${marketStrategy.trustBuildingTactics.map((t) => `  * ${t}`).join('\n')}
- Channel & Logistics Strategy: ${marketStrategy.channelStrategy}

6. PITFALLS THIS NIGERIAN SME MUST AVOID:
${qualityAudit?.pitfallsToAvoid ? qualityAudit.pitfallsToAvoid.map((p, idx) => `  ${idx + 1}. ${p}`).join('\n') : 'N/A'}
- Packaging & Display Advice: ${qualityAudit?.packagingAndDisplayAdvice || 'Quality branded dispatch box.'}

7. TYPOGRAPHY & BUYER PERSONA:
- Typography: Header: ${brandIdentity.typographyRecommendation.headerFont} | Body: ${brandIdentity.typographyRecommendation.bodyFont}
- Ideal Customer Persona: ${brandIdentity.idealCustomerPersona.name} (${brandIdentity.idealCustomerPersona.ageRange}, ${brandIdentity.idealCustomerPersona.location})
  Pain Point: ${brandIdentity.idealCustomerPersona.painPoint}
  Why They Buy: ${brandIdentity.idealCustomerPersona.whyTheyBuy}

8. MARKETING CAPTIONS (PROFESSIONAL ENGLISH):
${marketingCaptions.english
  .map(
    (c, i) =>
      `Caption ${i + 1} (${c.title}):\n"${c.hook}"\n${c.body}\nCTA: ${c.callToAction}\nTags: ${c.hashtags.join(' ')}\n`
  )
  .join('\n')}

9. MARKETING CAPTIONS (AUTHENTIC NIGERIAN PIDGIN):
${marketingCaptions.pidgin
  .map(
    (c, i) =>
      `Caption ${i + 1} (${c.title}):\n"${c.hook}"\n${c.body}\nCTA: ${c.callToAction}\nTags: ${c.hashtags.join(' ')}\n`
  )
  .join('\n')}

10. SOCIAL MEDIA AD CONCEPTS:
A. Instagram Carousel (${advertisingConcepts.instagramCarousel.title}):
- Slide 1 Hook: ${advertisingConcepts.instagramCarousel.slide1Hook}
- Slide 2 Value: ${advertisingConcepts.instagramCarousel.slide2Value}
- Slide 3 Proof: ${advertisingConcepts.instagramCarousel.slide3SocialProof}
- Slide 4 CTA: ${advertisingConcepts.instagramCarousel.slide4CTA}

B. TikTok/Reels Concept (15 Seconds):
- Hook: ${advertisingConcepts.tiktokReelConcept.hookVisual}
- Sound: ${advertisingConcepts.tiktokReelConcept.audioSuggestion}
- Script:\n${advertisingConcepts.tiktokReelConcept.script15s}
- Text Overlays: ${advertisingConcepts.tiktokReelConcept.onScreenText}

C. WhatsApp Status Flash Sale Sequence:
${advertisingConcepts.whatsappStatusSequence.map((s) => `${s.part}: "${s.text}" (Visual: ${s.visualTip})`).join('\n')}

D. Promo Offer Ideas:
${advertisingConcepts.promoOfferIdeas.map((p, idx) => `${idx + 1}. ${p}`).join('\n')}
${
  result.serviceStrategy
    ? `
11. SERVICE STRATEGY, PACKAGES & WHATSAPP SCRIPTS:
- Onboarding & Journey: ${result.serviceStrategy.clientOnboardingAndExperience}
- Deposit & Trust Policy: ${result.serviceStrategy.trustAndDepositPolicy || result.serviceStrategy.trustDepositPolicy || ''}
- Packages:
${result.serviceStrategy.servicePackages
  ?.map(
    (pkg, idx) =>
      `  [Package ${idx + 1}] ${pkg.tierName || pkg.name} (${pkg.recommendedPricing || pkg.pricingAdvice || 'Custom Quote'} | ${pkg.turnaroundOrDuration || 'Standard Timeline'})
   Target: ${pkg.targetClient}
   Deliverables: ${Array.isArray(pkg.deliverables) ? pkg.deliverables.join(', ') : pkg.deliverables}`
  )
  .join('\n')}
- WhatsApp Greeting:
"${result.serviceStrategy.whatsAppBookingFlow.greetingAndQualification || result.serviceStrategy.whatsAppBookingFlow.inquiryGreeting || ''}"
- WhatsApp Rate Card:
"${result.serviceStrategy.whatsAppBookingFlow.rateCardMessage || (result.serviceStrategy.whatsAppBookingFlow.qualifyingQuestions ? result.serviceStrategy.whatsAppBookingFlow.qualifyingQuestions.join('; ') : '')}"
- WhatsApp Deposit Notice:
"${result.serviceStrategy.whatsAppBookingFlow.depositConfirmationNotice}"
- WhatsApp Review Request:
"${result.serviceStrategy.whatsAppBookingFlow.postServiceReviewRequest || result.serviceStrategy.whatsAppBookingFlow.postServiceReviewPrompt || ''}"
`
    : ''
}
${
  result.hybridMarketingKit
    ? `
12. HYBRID BUSINESS MARKETING & CROSS-SELLING ENGINE:
- Unified Tagline: "${result.hybridMarketingKit.unifiedTagline}"
- Unified 30s Pitch: ${result.hybridMarketingKit.unifiedElevatorPitch}

Cross-Selling Opportunities:
${result.hybridMarketingKit.crossSellingOpportunities
  .map((c, i) => `  ${i + 1}. [Trigger: ${c.trigger}] -> Recommend: ${c.recommendation} (Benefit: ${c.benefit})`)
  .join('\n')}

Combined Bundled Campaigns:
${result.hybridMarketingKit.combinedCampaigns
  .map((b, i) => `  ${i + 1}. ${b.title} [${b.theme}]: "${b.hook}"\n     Bundle: ${b.bundleOffer} | CTA: ${b.callToAction}`)
  .join('\n')}

WhatsApp Omnichannel Flows:
- Product Inquiry -> Service Upsell:
"${result.hybridMarketingKit.whatsAppOmnichannelFlow.productInquiryToServiceUpsell}"
- Service Client -> Product Add-on:
"${result.hybridMarketingKit.whatsAppOmnichannelFlow.serviceClientToProductAddon}"
- VIP Combo Broadcast:
"${result.hybridMarketingKit.whatsAppOmnichannelFlow.vipComboBroadcast}"

Promotional Offers:
${result.hybridMarketingKit.promotionalOffers.map((p, i) => `  ${i + 1}. ${p}`).join('\n')}

Retention & Loyalty Tactics:
${result.hybridMarketingKit.customerRetentionTactics.map((r, i) => `  ${i + 1}. ${r}`).join('\n')}
`
    : ''
}
================================================
Generated with SME Brand Studio for Nigerian Entrepreneurs
================================================`;
  };

  const handleDownloadTxt = () => {
    const text = generateFullText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.brandIdentity.selectedName.toLowerCase().replace(/\s+/g, '-')}-brand-guide.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    setPdfError(null);
    try {
      await downloadBrandGuidePdf(result, { productName });
    } catch (err: any) {
      console.error('Error exporting Brand Guide PDF:', err);
      setPdfError(err?.message || 'Failed to generate PDF Brand Guide. Please try again.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Senior Strategist Brand Guide: {result.brandIdentity.selectedName}
            </h3>
            <p className="text-xs text-stone-500">
              Download or copy your complete branding, colors, captions & campaign blueprints.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onCopyText(generateFullText(), 'Complete Brand Guide')}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
              title="Copy all to clipboard"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleDownloadTxt}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
              title="Download TXT Guide"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Export Error Banner (if any) */}
        {pdfError && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{pdfError}</span>
          </div>
        )}

        {/* Modal Content Scroll */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-stone-800 leading-relaxed font-mono">
          <pre className="whitespace-pre-wrap font-sans bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs sm:text-sm">
            {generateFullText()}
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-stone-500 font-medium">
            🇳🇬 Made for Nigerian small businesses & vendors
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownloadTxt}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-200 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download .TXT Guide
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {isExportingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
              <span>{isExportingPdf ? 'Generating PDF...' : 'Export as PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
