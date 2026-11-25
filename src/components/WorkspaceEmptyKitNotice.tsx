import React from 'react';
import { Sparkles, Building2, FolderKanban, Palette, Megaphone } from 'lucide-react';

interface WorkspaceEmptyKitNoticeProps {
  section: 'brand-kit' | 'marketing-assets';
  onGoToCreate: () => void;
  onGoToImprove: () => void;
  onGoToProjects: () => void;
}

export const WorkspaceEmptyKitNotice: React.FC<WorkspaceEmptyKitNoticeProps> = ({
  section,
  onGoToCreate,
  onGoToImprove,
  onGoToProjects,
}) => {
  const isKit = section === 'brand-kit';

  return (
    <section className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 text-center space-y-5">
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mx-auto">
        {isKit ? <Palette className="w-7 h-7" /> : <Megaphone className="w-7 h-7" />}
      </div>

      <div className="space-y-2 max-w-xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900">
          {isKit ? 'No Active Brand Studio Kit Loaded' : 'No Active Marketing Assets Loaded'}
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          {isKit
            ? 'Generate a new brand identity or reopen a saved project from My Projects to view 5 brand names, your 6–8 psychological colour palette, positioning blueprint, and hybrid or service strategy.'
            : 'Generate a brand kit or reopen a saved project from My Projects to unlock bilingual English & Pidgin captions, Instagram/TikTok/WhatsApp campaigns, and the Promotional Flyer Studio.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onGoToCreate}
          className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Create New Brand</span>
        </button>

        <button
          type="button"
          onClick={onGoToImprove}
          className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
        >
          <Building2 className="w-4 h-4 text-emerald-700" />
          <span>Improve Existing Brand</span>
        </button>

        <button
          type="button"
          onClick={onGoToProjects}
          className="px-5 py-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
        >
          <FolderKanban className="w-4 h-4 text-stone-600" />
          <span>Open My Projects</span>
        </button>
      </div>
    </section>
  );
};
