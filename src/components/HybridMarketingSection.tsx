import React, { useState } from 'react';
import { HybridMarketingKit } from '../types';
import {
  Layers,
  Sparkles,
  Repeat,
  Package,
  Briefcase,
  Copy,
  MessageCircle,
  Megaphone,
  CheckCircle2,
  TrendingUp,
  Tag,
  ArrowRight,
  ShieldCheck,
  Gift,
  BookmarkCheck,
  Share2,
} from 'lucide-react';

interface HybridMarketingSectionProps {
  marketingKit?: HybridMarketingKit;
  brandName: string;
  productName: string;
  serviceName: string;
  onCopyText: (text: string, label: string) => void;
}

export const HybridMarketingSection: React.FC<HybridMarketingSectionProps> = ({
  marketingKit,
  brandName,
  productName,
  serviceName,
  onCopyText,
}) => {
  const [activeCaptionView, setActiveCaptionView] = useState<'both' | 'products' | 'services'>('both');

  if (!marketingKit) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center shadow-xs">
        <Layers className="w-10 h-10 text-stone-300 mx-auto mb-2" />
        <h4 className="font-bold text-stone-700">Hybrid Marketing Kit Not Available</h4>
        <p className="text-xs text-stone-500 mt-1">
          Generate a brand kit for a hybrid business to view combined cross-selling campaigns and dual marketing assets.
        </p>
      </div>
    );
  }

  const {
    unifiedTagline,
    unifiedElevatorPitch,
    productCaptions,
    serviceCaptions,
    combinedCampaigns,
    crossSellingOpportunities,
    whatsAppOmnichannelFlow,
    adCopyInstagramFacebook,
    promotionalOffers,
    customerRetentionTactics,
  } = marketingKit;

  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-stone-900 text-white rounded-2xl p-5 sm:p-7 shadow-md border border-emerald-800/40 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
            <Repeat className="w-3.5 h-3.5 text-amber-300" />
            Hybrid SME Synergy Engine (Products + Services)
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            {brandName}: Dual-Engine Marketing & Cross-Selling Suite
          </h3>
          <p className="text-xs sm:text-sm text-stone-200 max-w-3xl leading-relaxed">
            {unifiedElevatorPitch}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-amber-300">Unified Tagline:</span>
            <span className="italic bg-white/10 px-3 py-1 rounded-lg border border-white/10">
              "{unifiedTagline}"
            </span>
            <button
              type="button"
              onClick={() => onCopyText(unifiedTagline, 'Unified Tagline')}
              className="text-[11px] text-emerald-300 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" /> Copy
            </button>
          </div>
        </div>
      </div>

      {/* 1. Cross-Selling & Upselling Opportunities (Nigerian Market Psychology) */}
      {crossSellingOpportunities && crossSellingOpportunities.length > 0 && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div>
              <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Cross-Selling & Upselling Opportunities (Maximize Average Order Value)
              </h4>
              <p className="text-xs text-stone-500">
                Turn physical product buyers into recurring service clients, and convert appointment clients into take-home product subscribers.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              High Conversion Triggers
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {crossSellingOpportunities.map((opp, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-stone-50 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide">
                      Conversion Trigger
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-stone-800 bg-white p-2.5 rounded-lg border border-stone-200/60 leading-snug">
                    {opp.trigger}
                  </p>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-stone-500 block mb-1">
                      Actionable Recommendation:
                    </span>
                    <p className="text-xs text-stone-700 leading-relaxed">
                      {opp.recommendation}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200/60 text-[11px] text-emerald-800 font-medium flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Benefit: {opp.benefit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Combined Promotional Campaigns (Bundles & Synergies) */}
      {combinedCampaigns && combinedCampaigns.length > 0 && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div>
              <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-600" />
                Combined Product + Service Promotional Campaigns
              </h4>
              <p className="text-xs text-stone-500">
                Ready-to-launch bundle packages linking physical inventory with service sessions.
              </p>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Bundle Architecture
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {combinedCampaigns.map((camp, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border-2 border-amber-200/80 bg-gradient-to-b from-amber-50/50 via-white to-amber-50/30 flex flex-col justify-between space-y-3 shadow-2xs"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md inline-block">
                    {camp.theme}
                  </span>
                  <h5 className="font-black text-sm sm:text-base text-stone-900 leading-snug">
                    {camp.title}
                  </h5>
                  <p className="text-xs text-stone-600 italic bg-white/80 p-2.5 rounded-lg border border-amber-200/50 leading-relaxed">
                    "{camp.hook}"
                  </p>
                  <div className="p-3 bg-amber-100/50 rounded-xl border border-amber-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                      Bundle Offer:
                    </span>
                    <p className="text-xs font-bold text-amber-950 leading-snug">
                      {camp.bundleOffer}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-amber-200/60">
                  <span className="text-[11px] font-medium text-stone-600 block">
                    <span className="font-semibold text-stone-800">CTA: </span>
                    {camp.callToAction}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const text = `*${brandName} Special Offer: ${camp.title}*\n\n🔥 ${camp.hook}\n\n🎁 *Bundle Includes:*\n${camp.bundleOffer}\n\n👉 *How to Claim:* ${camp.callToAction}`;
                      onCopyText(text, `${camp.title} campaign pitch`);
                    }}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-emerald-950 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Promo Broadcast
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. WhatsApp Omnichannel Marketing Sequences */}
      {whatsAppOmnichannelFlow && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div>
              <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                WhatsApp Omnichannel Cross-Sell Scripts
              </h4>
              <p className="text-xs text-stone-500">
                Convert WhatsApp inquiries effortlessly between product orders and scheduled service sessions.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              Ready to Paste in WhatsApp
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Script 1: Product to Service Upsell */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/80 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                    1. Product Buyer → Service Upsell
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-800 whitespace-pre-line leading-relaxed font-sans shadow-2xs">
                  {whatsAppOmnichannelFlow.productInquiryToServiceUpsell}
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onCopyText(
                    whatsAppOmnichannelFlow.productInquiryToServiceUpsell,
                    'Product to Service WhatsApp upsell script'
                  )
                }
                className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Script
              </button>
            </div>

            {/* Script 2: Service Client to Product Addon */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/80 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                    2. Service Client → Product Add-On
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-800 whitespace-pre-line leading-relaxed font-sans shadow-2xs">
                  {whatsAppOmnichannelFlow.serviceClientToProductAddon}
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onCopyText(
                    whatsAppOmnichannelFlow.serviceClientToProductAddon,
                    'Service to Product WhatsApp add-on script'
                  )
                }
                className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Script
              </button>
            </div>

            {/* Script 3: VIP Combo Broadcast */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/80 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                    3. VIP Dual-Offer Broadcast
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-800 whitespace-pre-line leading-relaxed font-sans shadow-2xs">
                  {whatsAppOmnichannelFlow.vipComboBroadcast}
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onCopyText(
                    whatsAppOmnichannelFlow.vipComboBroadcast,
                    'VIP Combo Broadcast WhatsApp script'
                  )
                }
                className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Script
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Instagram & Facebook Ad Copy */}
      {adCopyInstagramFacebook && adCopyInstagramFacebook.length > 0 && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div>
              <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-emerald-600" />
                Instagram & Facebook Ad Copy (Hybrid Acquisition)
              </h4>
              <p className="text-xs text-stone-500">
                High-converting paid & organic social ads communicating the full product + service ecosystem.
              </p>
            </div>
            <span className="text-[11px] font-bold uppercase text-stone-500">
              Social Ad Campaigns
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adCopyInstagramFacebook.map((ad, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-stone-200 bg-stone-50/70 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md inline-block">
                    Ad Angle {idx + 1}
                  </span>
                  <h5 className="font-extrabold text-sm sm:text-base text-stone-900">
                    "{ad.headline}"
                  </h5>
                  <p className="text-xs text-stone-700 whitespace-pre-line leading-relaxed bg-white p-3 rounded-xl border border-stone-200">
                    {ad.primaryText}
                  </p>
                  <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900">
                    <span className="font-bold">Visual Concept: </span>
                    {ad.creativeAngle}
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-stone-600">CTA: {ad.callToAction}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const fullAd = `*Headline:* ${ad.headline}\n\n*Primary Text:*\n${ad.primaryText}\n\n*Visual:* ${ad.creativeAngle}\n*CTA:* ${ad.callToAction}`;
                      onCopyText(fullAd, `Ad Copy #${idx + 1}`);
                    }}
                    className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Ad Text
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Separate Product vs Service Marketing Captions */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div>
            <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-emerald-600" />
              Categorized Marketing Captions (Product vs Service)
            </h4>
            <p className="text-xs text-stone-500">
              Clear distinction: marketing copy dedicated strictly to your retail items and your client appointments.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveCaptionView('both')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeCaptionView === 'both' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
              }`}
            >
              All Captions
            </button>
            <button
              type="button"
              onClick={() => setActiveCaptionView('products')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeCaptionView === 'products' ? 'bg-white text-amber-900 shadow-xs' : 'text-stone-500'
              }`}
            >
              <Package className="w-3 h-3 text-amber-600" />
              Products Only
            </button>
            <button
              type="button"
              onClick={() => setActiveCaptionView('services')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeCaptionView === 'services' ? 'bg-white text-teal-900 shadow-xs' : 'text-stone-500'
              }`}
            >
              <Briefcase className="w-3 h-3 text-teal-600" />
              Services Only
            </button>
          </div>
        </div>

        {/* Product Captions Block */}
        {(activeCaptionView === 'both' || activeCaptionView === 'products') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-950 uppercase tracking-wide bg-amber-50 p-2.5 rounded-xl border border-amber-200/80">
              <Package className="w-4 h-4 text-amber-700" />
              <span>Physical Product Captions (Retail Inventory)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productCaptions.english.map((cap, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800">{cap.title} (English)</span>
                    <button
                      type="button"
                      onClick={() => onCopyText(`${cap.hook}\n\n${cap.body}\n\n${cap.callToAction}\n\n${cap.hashtags.join(' ')}`, cap.title)}
                      className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-stone-900">"{cap.hook}"</p>
                  <p className="text-xs text-stone-600 leading-relaxed">{cap.body}</p>
                  <p className="text-xs font-medium text-amber-900">👉 {cap.callToAction}</p>
                  <p className="text-[11px] text-stone-400 font-mono">{cap.hashtags.join(' ')}</p>
                </div>
              ))}
              {productCaptions.pidgin.map((cap, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800">{cap.title} (Nigerian Pidgin)</span>
                    <button
                      type="button"
                      onClick={() => onCopyText(`${cap.hook}\n\n${cap.body}\n\n${cap.callToAction}\n\n${cap.hashtags.join(' ')}`, cap.title)}
                      className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-stone-900">"{cap.hook}"</p>
                  <p className="text-xs text-stone-600 leading-relaxed">{cap.body}</p>
                  <p className="text-xs font-medium text-amber-900">👉 {cap.callToAction}</p>
                  <p className="text-[11px] text-stone-400 font-mono">{cap.hashtags.join(' ')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Service Captions Block */}
        {(activeCaptionView === 'both' || activeCaptionView === 'services') && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-950 uppercase tracking-wide bg-teal-50 p-2.5 rounded-xl border border-teal-200/80">
              <Briefcase className="w-4 h-4 text-teal-700" />
              <span>Client Service Captions (Bookings & Sessions)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serviceCaptions.english.map((cap, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800">{cap.title} (English)</span>
                    <button
                      type="button"
                      onClick={() => onCopyText(`${cap.hook}\n\n${cap.body}\n\n${cap.callToAction}\n\n${cap.hashtags.join(' ')}`, cap.title)}
                      className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-stone-900">"{cap.hook}"</p>
                  <p className="text-xs text-stone-600 leading-relaxed">{cap.body}</p>
                  <p className="text-xs font-medium text-teal-900">👉 {cap.callToAction}</p>
                  <p className="text-[11px] text-stone-400 font-mono">{cap.hashtags.join(' ')}</p>
                </div>
              ))}
              {serviceCaptions.pidgin.map((cap, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800">{cap.title} (Nigerian Pidgin)</span>
                    <button
                      type="button"
                      onClick={() => onCopyText(`${cap.hook}\n\n${cap.body}\n\n${cap.callToAction}\n\n${cap.hashtags.join(' ')}`, cap.title)}
                      className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-stone-900">"{cap.hook}"</p>
                  <p className="text-xs text-stone-600 leading-relaxed">{cap.body}</p>
                  <p className="text-xs font-medium text-teal-900">👉 {cap.callToAction}</p>
                  <p className="text-[11px] text-stone-400 font-mono">{cap.hashtags.join(' ')}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 6. Promotional Offers & Customer Retention Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Promotional Offers */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-600" />
            <h5 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wide">
              Product & Service Promotional Offers
            </h5>
          </div>
          <div className="space-y-2">
            {promotionalOffers.map((offer, idx) => (
              <div
                key={idx}
                className="p-3 bg-stone-50 rounded-xl border border-stone-200/70 text-xs text-stone-800 leading-relaxed flex items-start gap-2"
              >
                <span className="font-bold text-emerald-700 shrink-0">#{idx + 1}</span>
                <span>{offer}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Retention Suggestions */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-amber-600" />
            <h5 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wide">
              Customer Retention & Repeat Business
            </h5>
          </div>
          <div className="space-y-2">
            {customerRetentionTactics.map((tactic, idx) => (
              <div
                key={idx}
                className="p-3 bg-stone-50 rounded-xl border border-stone-200/70 text-xs text-stone-800 leading-relaxed flex items-start gap-2"
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>{tactic}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
