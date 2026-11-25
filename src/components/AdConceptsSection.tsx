import React from 'react';
import { AdvertisingConcepts } from '../types';
import { Video, Layers, MessageCircle, Megaphone, Copy, Music, Clock, Sparkles } from 'lucide-react';

interface AdConceptsSectionProps {
  concepts: AdvertisingConcepts;
  brandName: string;
  productName: string;
  onCopyText: (text: string, label: string) => void;
}

export const AdConceptsSection: React.FC<AdConceptsSectionProps> = ({
  concepts,
  brandName,
  productName,
  onCopyText,
}) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-emerald-600" />
          Social Media Promotional Advertising Concepts
        </h3>
        <p className="text-xs sm:text-sm text-stone-500">
          Battle-tested promotional storyboards for Instagram Carousels, TikTok Reels, and WhatsApp Status launches.
        </p>
      </div>

      {/* Instagram 4-Slide Carousel */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-stone-900">
                Instagram High-Conversion Carousel Storyboard
              </h4>
              <p className="text-xs text-stone-500">
                {concepts.instagramCarousel.title || '4-Slide Customer Transformation'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              onCopyText(
                `Instagram Carousel Concept: ${concepts.instagramCarousel.title}\n\n1. ${concepts.instagramCarousel.slide1Hook}\n\n2. ${concepts.instagramCarousel.slide2Value}\n\n3. ${concepts.instagramCarousel.slide3SocialProof}\n\n4. ${concepts.instagramCarousel.slide4CTA}`,
                'Instagram Carousel Plan'
              )
            }
            className="text-xs font-semibold px-3 py-1.5 rounded-lg text-stone-700 bg-stone-100 hover:bg-stone-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Plan</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                Slide 1 • The Stop-Scroll Hook
              </span>
              <p className="text-xs text-stone-700 font-medium mt-2.5 leading-relaxed">
                {concepts.instagramCarousel.slide1Hook}
              </p>
            </div>
            <p className="text-[10px] text-stone-400 mt-3 italic">High-contrast bold visual</p>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Slide 2 • The Craft & Value
              </span>
              <p className="text-xs text-stone-700 font-medium mt-2.5 leading-relaxed">
                {concepts.instagramCarousel.slide2Value}
              </p>
            </div>
            <p className="text-[10px] text-stone-400 mt-3 italic">Macro craftsmanship view</p>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Slide 3 • Nigerian Social Proof
              </span>
              <p className="text-xs text-stone-700 font-medium mt-2.5 leading-relaxed">
                {concepts.instagramCarousel.slide3SocialProof}
              </p>
            </div>
            <p className="text-[10px] text-stone-400 mt-3 italic">WhatsApp review screenshot</p>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Slide 4 • Urgent Price & CTA
              </span>
              <p className="text-xs text-stone-700 font-medium mt-2.5 leading-relaxed">
                {concepts.instagramCarousel.slide4CTA}
              </p>
            </div>
            <p className="text-[10px] text-stone-400 mt-3 italic">"Comment for Link" or DM</p>
          </div>
        </div>
      </div>

      {/* TikTok / Reels 15s Script & WhatsApp Sequence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* TikTok / Instagram Reel Concept */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">15-Second Viral Reel Concept</h4>
                  <p className="text-[11px] text-stone-500">TikTok & Instagram Reels format</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onCopyText(
                    `Reel Concept:\nHook: ${concepts.tiktokReelConcept.hookVisual}\nAudio: ${concepts.tiktokReelConcept.audioSuggestion}\nScript:\n${concepts.tiktokReelConcept.script15s}\nText Overlays: ${concepts.tiktokReelConcept.onScreenText}`,
                    'Reel Script'
                  )
                }
                className="text-stone-400 hover:text-stone-700 p-1"
                title="Copy Reel Script"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Hook & Sound recommendation */}
            <div className="space-y-3">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block mb-1">
                  First 3 Seconds Action (Stop-the-Scroll):
                </span>
                <p className="text-xs font-semibold text-stone-800">
                  {concepts.tiktokReelConcept.hookVisual}
                </p>
              </div>

              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/50 flex items-start gap-2">
                <Music className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                    Recommended Sound / Vibe:
                  </span>
                  <p className="text-xs text-amber-950 font-medium">
                    {concepts.tiktokReelConcept.audioSuggestion}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                  15-Second Visual Action & Voiceover Script:
                </span>
                <p className="text-xs text-stone-700 whitespace-pre-line leading-relaxed">
                  {concepts.tiktokReelConcept.script15s}
                </p>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-0.5">
                  On-Screen Text Badges:
                </span>
                <p className="text-xs text-emerald-950 font-mono font-semibold">
                  {concepts.tiktokReelConcept.onScreenText}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Status 3-Step Flash Campaign */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">WhatsApp Status 1-Day Flash Launch</h4>
                  <p className="text-[11px] text-stone-500">Scheduled sequence for Nigerian vendors</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onCopyText(
                    concepts.whatsappStatusSequence
                      .map((s) => `${s.part}:\n"${s.text}"\nTip: ${s.visualTip}`)
                      .join('\n\n'),
                    'WhatsApp Sequence'
                  )
                }
                className="text-stone-400 hover:text-stone-700 p-1"
                title="Copy Sequence"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {concepts.whatsappStatusSequence.map((step, sIdx) => (
                <div key={sIdx} className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      {step.part}
                    </span>
                    <button
                      type="button"
                      onClick={() => onCopyText(step.text, `Status: ${step.part}`)}
                      className="text-[10px] font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-0.5 cursor-pointer"
                    >
                      <Copy className="w-2.5 h-2.5" /> Copy
                    </button>
                  </div>
                  <p className="text-xs text-stone-800 font-medium leading-relaxed bg-white p-2 rounded-lg border border-stone-100 mb-1.5">
                    "{step.text}"
                  </p>
                  <p className="text-[11px] text-stone-500 italic">
                    📸 <span className="font-semibold text-stone-600">Visual Setup:</span> {step.visualTip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Nigerian Promotional Offer Angles */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-amber-200" />
          <h4 className="text-sm sm:text-base font-bold text-white">
            High-Converting Nigerian Promotional Campaign Angles
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {concepts.promoOfferIdeas.map((idea, idx) => (
            <div
              key={idx}
              className="bg-black/15 backdrop-blur-xs p-3.5 rounded-xl border border-white/20 text-xs sm:text-sm leading-relaxed"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200 block mb-1">
                Campaign Angle {idx + 1}
              </span>
              <p className="text-white font-medium">{idea}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
