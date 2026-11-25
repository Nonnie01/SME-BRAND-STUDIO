import React, { useState } from 'react';
import { MarketingCaptions, CaptionItem } from '../types';
import { MessageSquare, Copy, Check, Share2, Sparkles, Send, RefreshCw, Flame, Shield, Clock, AlertCircle } from 'lucide-react';

interface CaptionsSectionProps {
  captions: MarketingCaptions;
  brandName: string;
  productName: string;
  onCopyText: (text: string, label: string) => void;
  onRegenerateMore?: (theme: string) => Promise<void>;
  isRegenerating?: boolean;
  captionsError?: string | null;
  onDismissCaptionsError?: () => void;
}

const NAIJA_THEMES = [
  'General Flash Sale & Hype',
  'Payday Weekend Splurge',
  'Detty December / Holiday Season',
  'Valentine / Lovers Special',
  'Sallah / Easter Celebration',
  'Rainy Season / Daily Essential',
];

export const CaptionsSection: React.FC<CaptionsSectionProps> = ({
  captions,
  brandName,
  productName,
  onCopyText,
  onRegenerateMore,
  isRegenerating = false,
  captionsError = null,
  onDismissCaptionsError,
}) => {
  const [activeTab, setActiveTab] = useState<'pidgin' | 'english' | 'both'>('pidgin');
  const [selectedTheme, setSelectedTheme] = useState(NAIJA_THEMES[0]);

  const formatCaptionForSharing = (item: CaptionItem) => {
    return `${item.hook}\n\n${item.body}\n\n👉 ${item.callToAction}\n\n${item.hashtags.join(' ')}`;
  };

  const handleWhatsAppShare = (item: CaptionItem) => {
    const text = formatCaptionForSharing(item);
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const renderCaptionCard = (item: CaptionItem, index: number, lang: 'pidgin' | 'english') => {
    const fullText = formatCaptionForSharing(item);
    const isPidgin = lang === 'pidgin';

    return (
      <div
        key={`${lang}-${index}`}
        className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-all"
      >
        <div>
          {/* Header Tag */}
          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                isPidgin
                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {isPidgin ? <Flame className="w-3 h-3 text-amber-600" /> : <Sparkles className="w-3 h-3 text-emerald-600" />}
              {item.title}
            </span>

            <span className="text-xs font-semibold text-stone-400">
              {isPidgin ? '🇳🇬 Naija Pidgin' : '🇬🇧 Pro English'}
            </span>
          </div>

          {/* Hook */}
          <div className="mb-3">
            <p className="text-sm font-bold text-stone-900 leading-snug">
              {item.hook}
            </p>
          </div>

          {/* Body */}
          <div className="mb-4">
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed whitespace-pre-line">
              {item.body}
            </p>
          </div>

          {/* Call to action */}
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 mb-3 text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>CTA: {item.callToAction}</span>
          </div>

          {/* Hashtags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {item.hashtags.map((tag, tIdx) => (
              <span key={tIdx} className="text-[11px] text-stone-500 font-mono">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => handleWhatsAppShare(item)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
            title="Open in WhatsApp Status / Chat"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp Status</span>
          </button>

          <button
            type="button"
            onClick={() => onCopyText(fullText, `${item.title} Caption`)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 transition-colors cursor-pointer shadow-xs"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Caption</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            Bilingual Marketing Captions
          </h3>
          <p className="text-xs sm:text-sm text-stone-500">
            Engineered for high engagement across Instagram, TikTok, and WhatsApp business catalogs.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('pidgin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pidgin'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            🇳🇬 Pidgin ({captions.pidgin.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('english')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'english'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            🇬🇧 English ({captions.english.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('both')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'both'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Side-by-Side
          </button>
        </div>
      </div>

      {/* Captions Grid */}
      {activeTab === 'pidgin' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {captions.pidgin.map((item, idx) => renderCaptionCard(item, idx, 'pidgin'))}
        </div>
      )}

      {activeTab === 'english' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {captions.english.map((item, idx) => renderCaptionCard(item, idx, 'english'))}
        </div>
      )}

      {activeTab === 'both' && (
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-600" /> Authentic Nigerian Pidgin Captions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {captions.pidgin.map((item, idx) => renderCaptionCard(item, idx, 'pidgin'))}
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200">
            <h4 className="text-sm font-bold text-emerald-900 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" /> Polished Professional English Captions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {captions.english.map((item, idx) => renderCaptionCard(item, idx, 'english'))}
            </div>
          </div>
        </div>
      )}

      {captionsError && onRegenerateMore && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Could Not Generate "{selectedTheme}" Captions</p>
              <p className="text-[11px] text-rose-800 mt-0.5">
                {captionsError} Your existing captions above were preserved.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={() => onRegenerateMore(selectedTheme)}
              disabled={isRegenerating}
              className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>Retry Captions</span>
            </button>
            {onDismissCaptionsError && (
              <button
                type="button"
                onClick={onDismissCaptionsError}
                className="text-[11px] font-semibold text-rose-700 hover:underline cursor-pointer"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}

      {/* Theme Regenerator Bar */}
      {onRegenerateMore && (
        <div className="bg-stone-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 border border-stone-200/80">
          <div className="w-full sm:w-auto">
            <span className="text-xs font-bold text-stone-800 block mb-1">
              Need special campaign captions?
            </span>
            <div className="flex flex-wrap gap-1.5">
              {NAIJA_THEMES.map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => setSelectedTheme(theme)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    selectedTheme === theme
                      ? 'bg-emerald-800 text-white font-bold shadow-xs'
                      : 'bg-white text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={isRegenerating}
            onClick={() => onRegenerateMore(selectedTheme)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>Generate "{selectedTheme}" Captions</span>
          </button>
        </div>
      )}
    </div>
  );
};
