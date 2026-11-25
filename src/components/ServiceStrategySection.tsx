import React from 'react';
import { ServiceStrategy } from '../types';
import {
  Briefcase,
  MessageCircle,
  ShieldCheck,
  PackageCheck,
  Sparkles,
  Copy,
  Clock,
  Layers,
  Repeat,
  Send,
  Users,
  CheckCircle2,
  DollarSign,
  BookmarkCheck,
} from 'lucide-react';

interface ServiceStrategySectionProps {
  strategy?: ServiceStrategy;
  brandName: string;
  onCopyText: (text: string, label: string) => void;
}

export const ServiceStrategySection: React.FC<ServiceStrategySectionProps> = ({
  strategy,
  brandName,
  onCopyText,
}) => {
  if (!strategy) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center shadow-xs">
        <Briefcase className="w-10 h-10 text-stone-300 mx-auto mb-2" />
        <h4 className="font-bold text-stone-700">Service Strategy Not Available</h4>
        <p className="text-xs text-stone-500 mt-1">
          Generate a brand kit for a service-based business to view tailored booking workflows and packages.
        </p>
      </div>
    );
  }

  const {
    clientOnboardingAndExperience,
    trustAndDepositPolicy,
    retentionAndReferralTactics,
    servicePackages,
    whatsAppBookingFlow,
  } = strategy;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-stone-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-emerald-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Briefcase className="w-3.5 h-3.5" />
              Service SME Client Acquisition Engine
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              {brandName}: Service Packages, Booking Flow & Trust Blueprint
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl">
              Engineered specifically to overcome Nigerian client hesitations: upfront deposit compliance, punctuality standards, high-converting WhatsApp scripts, and client retention.
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-xl bg-amber-400 text-emerald-950 font-bold shrink-0 self-start sm:self-auto shadow-xs">
            🇳🇬 Nigerian SME Standard
          </span>
        </div>
      </div>

      {/* 1. Tiered Service Packages */}
      {servicePackages && servicePackages.length > 0 && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div>
              <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-emerald-600" />
                Tiered Service Packages & Pricing Structure
              </h4>
              <p className="text-xs text-stone-500">
                Strategic 3-tier menu designed to anchor value, upsell high-ticket clients, and provide steady retainer income.
              </p>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Value Anchored
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {servicePackages.map((pkg, idx) => {
              const isSignature = idx === 1;
              const packageName = pkg.tierName || pkg.name || `Package Tier ${idx + 1}`;
              const packagePrice = pkg.recommendedPricing || pkg.pricingAdvice || 'Custom Quote';
              const packageDuration = pkg.turnaroundOrDuration || 'Standard Booking';
              const deliverablesList = Array.isArray(pkg.deliverables)
                ? pkg.deliverables
                : typeof pkg.deliverables === 'string'
                ? (pkg.deliverables as string).split(',').map((s) => s.trim())
                : [];

              return (
                <div
                  key={idx}
                  className={`rounded-2xl p-5 flex flex-col justify-between transition-all relative border-2 ${
                    isSignature
                      ? 'bg-gradient-to-b from-emerald-900 via-emerald-950 to-teal-950 text-white border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                      : 'bg-stone-50/70 hover:bg-stone-50 text-stone-900 border-stone-200'
                  }`}
                >
                  {isSignature && (
                    <div className="absolute -top-3 right-4 bg-amber-400 text-emerald-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs tracking-wider">
                      Most Popular ★
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="border-b pb-3 border-stone-200/40">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider block ${
                          isSignature ? 'text-emerald-300' : 'text-emerald-700'
                        }`}
                      >
                        Package Tier {idx + 1}
                      </span>
                      <h5 className="text-base sm:text-lg font-black tracking-tight mt-0.5">
                        {packageName}
                      </h5>
                      <p
                        className={`text-xs mt-1 leading-relaxed ${
                          isSignature ? 'text-stone-300' : 'text-stone-600'
                        }`}
                      >
                        <span className="font-semibold">Target Client:</span> {pkg.targetClient}
                      </p>
                    </div>

                    {/* Price and turnaround */}
                    <div
                      className={`p-3 rounded-xl space-y-1 ${
                        isSignature ? 'bg-white/10 border border-white/10' : 'bg-white border border-stone-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[11px] font-medium ${
                            isSignature ? 'text-stone-300' : 'text-stone-500'
                          }`}
                        >
                          Recommended Rate:
                        </span>
                        <span
                          className={`font-black text-sm sm:text-base ${
                            isSignature ? 'text-amber-300' : 'text-emerald-800'
                          }`}
                        >
                          {packagePrice}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>Timeline: {packageDuration}</span>
                      </div>
                    </div>

                    {/* Deliverables */}
                    <div className="space-y-1.5">
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider block ${
                          isSignature ? 'text-emerald-300' : 'text-stone-700'
                        }`}
                      >
                        Scope & Deliverables:
                      </span>
                      <ul className="space-y-1">
                        {deliverablesList.map((item, dIdx) => (
                          <li
                            key={dIdx}
                            className={`text-xs flex items-start gap-1.5 leading-snug ${
                              isSignature ? 'text-stone-200' : 'text-stone-700'
                            }`}
                          >
                            <CheckCircle2
                              className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                                isSignature ? 'text-emerald-400' : 'text-emerald-600'
                              }`}
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Copy Button */}
                  <div className="pt-4 mt-4 border-t border-stone-200/30">
                    <button
                      type="button"
                      onClick={() => {
                        const text = `*${brandName} - ${packageName}*\n💰 Pricing: ${packagePrice}\n⏱ Timeline: ${packageDuration}\n\n*Included:*\n${deliverablesList.map((d) => `• ${d}`).join('\n')}\n\nMessage us to lock your slot today!`;
                        onCopyText(text, `${packageName} rate card`);
                      }}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        isSignature
                          ? 'bg-amber-400 hover:bg-amber-300 text-emerald-950'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
                      }`}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy Rate Card Snippet
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. WhatsApp Business Booking & Inquiry Scripts */}
      {whatsAppBookingFlow && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div>
              <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                WhatsApp Business Conversion Scripts
              </h4>
              <p className="text-xs text-stone-500">
                Word-for-word scripts to eliminate back-and-forth, qualify clients politely, and secure commitment deposits.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              Ready to Paste in WhatsApp
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 1: Greeting & Qualification */}
            <div className="bg-stone-50/80 rounded-2xl p-4 border border-stone-200 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                    1. Instant Greeting & Qualification
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">Response within 5 mins</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-800 whitespace-pre-line leading-relaxed font-sans shadow-2xs">
                  {whatsAppBookingFlow.greetingAndQualification ||
                    whatsAppBookingFlow.inquiryGreeting ||
                    'Hello! Welcome to our studio.'}
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onCopyText(
                    whatsAppBookingFlow.greetingAndQualification ||
                      whatsAppBookingFlow.inquiryGreeting ||
                      '',
                    'WhatsApp Greeting message'
                  )
                }
                className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Greeting Script
              </button>
            </div>

            {/* Step 2: Rate Card Presentation */}
            <div className="bg-stone-50/80 rounded-2xl p-4 border border-stone-200 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                    2. Transparent Rate Card Message
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">Zero Hidden Fees</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-800 whitespace-pre-line leading-relaxed font-sans shadow-2xs">
                  {whatsAppBookingFlow.rateCardMessage ||
                    (whatsAppBookingFlow.qualifyingQuestions
                      ? whatsAppBookingFlow.qualifyingQuestions.join('\n')
                      : 'Please view our attached packages.')}
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onCopyText(
                    whatsAppBookingFlow.rateCardMessage ||
                      (whatsAppBookingFlow.qualifyingQuestions
                        ? whatsAppBookingFlow.qualifyingQuestions.join('\n')
                        : ''),
                    'WhatsApp Rate Card message'
                  )
                }
                className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Rate Card Script
              </button>
            </div>

            {/* Step 3: Deposit Confirmation Notice */}
            <div className="bg-stone-50/80 rounded-2xl p-4 border border-stone-200 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                    3. Slot Locked / Deposit Receipt
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">Enforces 50% Upfront</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-800 whitespace-pre-line leading-relaxed font-sans shadow-2xs">
                  {whatsAppBookingFlow.depositConfirmationNotice}
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onCopyText(
                    whatsAppBookingFlow.depositConfirmationNotice,
                    'WhatsApp Deposit Confirmation script'
                  )
                }
                className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Deposit Notice
              </button>
            </div>

            {/* Step 4: Post-Service Review Request */}
            <div className="bg-stone-50/80 rounded-2xl p-4 border border-stone-200 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                    4. Post-Service Review & Referral
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">Sent 24h Post Delivery</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-800 whitespace-pre-line leading-relaxed font-sans shadow-2xs">
                  {whatsAppBookingFlow.postServiceReviewRequest ||
                    whatsAppBookingFlow.postServiceReviewPrompt ||
                    'Thank you for booking with us! Please share your feedback.'}
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onCopyText(
                    whatsAppBookingFlow.postServiceReviewRequest ||
                      whatsAppBookingFlow.postServiceReviewPrompt ||
                      '',
                    'WhatsApp Review Request script'
                  )
                }
                className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Review Script
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Client Onboarding Journey & Trust Policy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Client Onboarding Journey */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <h5 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wide">
              Client Onboarding & Journey Standards
            </h5>
          </div>
          <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200/80">
            {clientOnboardingAndExperience}
          </p>
        </div>

        {/* Booking Deposit & Trust Policy */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h5 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wide">
              Booking Deposit & Client Trust Policy
            </h5>
          </div>
          <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200/80">
            {trustAndDepositPolicy}
          </p>
        </div>
      </div>

      {/* 4. Retention & Referral Tactics */}
      {retentionAndReferralTactics && retentionAndReferralTactics.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50/60 rounded-2xl p-5 border border-amber-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs sm:text-sm font-bold text-amber-950 uppercase tracking-wide flex items-center gap-2">
              <Repeat className="w-4 h-4 text-amber-700" />
              Repeat Booking & Referral Systems
            </h5>
            <span className="text-[11px] font-semibold text-amber-800">
              Boost Lifetime Value
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {retentionAndReferralTactics.map((tactic, idx) => (
              <div
                key={idx}
                className="bg-white/90 p-3.5 rounded-xl border border-amber-200/70 text-xs text-stone-800 leading-relaxed shadow-2xs"
              >
                <div className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                  <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Tactic {idx + 1}</span>
                </div>
                {tactic}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
