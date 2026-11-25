import React from 'react';
import {
  Sparkles,
  Building2,
  FolderOpen,
  Palette,
  Megaphone,
  ArrowRight,
  Package,
  Briefcase,
  Wand2,
  MapPin,
  Clock,
  ShoppingBag,
  Layers,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BusinessType, SavedBrandProject, SampleProduct, BrandStudioResult } from '../types';
import { SAMPLE_PRODUCTS } from '../data/sampleProducts';
import { formatRegionSummary } from '../data/nigerianRegions';

interface DashboardHomeProps {
  result: BrandStudioResult | null;
  activeBrandName: string;
  activeTagline: string;
  selectedRegions: string[];
  savedProjects: SavedBrandProject[];
  isLoadingProjects: boolean;
  onStartCreateBrand: (preferredBusinessType?: BusinessType) => void;
  onStartImproveBrand: () => void;
  onOpenBrandKit: () => void;
  onOpenMarketingAssets: () => void;
  onOpenMyProjects: () => void;
  onReopenProject: (project: SavedBrandProject) => void;
  onLoadSampleAndCreate: (sample: SampleProduct) => void;
  onLoadDemo: () => void;
  onOpenAuthModal: (tab?: 'login' | 'signup' | 'reset') => void;
}

function formatShortDate(ms?: number): string {
  if (!ms) return 'Recently updated';
  try {
    return new Intl.DateTimeFormat('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(ms));
  } catch {
    return 'Saved';
  }
}

function getBusinessTypeName(type: BusinessType): string {
  if (type === 'service') return 'Service-Based';
  if (type === 'hybrid') return 'Hybrid';
  return 'Product-Based';
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  result,
  activeBrandName,
  activeTagline,
  selectedRegions,
  savedProjects,
  isLoadingProjects,
  onStartCreateBrand,
  onStartImproveBrand,
  onOpenBrandKit,
  onOpenMarketingAssets,
  onOpenMyProjects,
  onReopenProject,
  onLoadSampleAndCreate,
  onLoadDemo,
  onOpenAuthModal,
}) => {
  const { user } = useAuth();

  const recentKits = savedProjects.slice(0, 3);
  const marketSummary =
    selectedRegions.length === 37
      ? 'All 36 States + FCT Abuja'
      : selectedRegions.length > 0
      ? formatRegionSummary(selectedRegions)
      : 'Lagos';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Executive Welcome Banner & Primary Actions */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 sm:p-8 lg:p-10 border border-emerald-800/50">
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              SME Brand Studio Workspace
            </p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Welcome to Your Creative Studio
            </h1>
            <p className="text-sm text-stone-200 leading-relaxed">
              Transform your business ideas into compelling brands. Create distinctive brand identities, develop strategic marketing campaigns, and bring your products and services to life with AI-powered creativity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onStartCreateBrand()}
              className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-sm font-extrabold inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create New Brand</span>
            </button>

            <button
              type="button"
              onClick={onStartImproveBrand}
              className="px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/25 text-sm font-bold inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Building2 className="w-4 h-4" />
              <span>Improve Existing Brand</span>
            </button>

            <button
              type="button"
              onClick={onLoadDemo}
              className="px-4 py-3 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/70 text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <ShoppingBag className="w-4 h-4 text-amber-300" />
              <span>Load Sample</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Workspace Summary Strip (Single-Elevation Cards) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Studio Kit */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-xs font-semibold text-stone-500">
              <span>Active Brand Studio Kit</span>
              <Palette className="w-4 h-4 text-emerald-700" />
            </div>
            {result ? (
              <>
                <div className="text-lg font-extrabold text-stone-900 truncate">
                  {activeBrandName || result.brandIdentity.selectedName}
                </div>
                <p className="text-xs text-stone-600 line-clamp-1">
                  {activeTagline || result.brandIdentity.selectedTagline}
                </p>
              </>
            ) : (
              <>
                <div className="text-lg font-extrabold text-stone-900">
                  No Active Kit Yet
                </div>
                <p className="text-xs text-stone-600">
                  Generate a new brand kit or reopen one from My Projects.
                </p>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-stone-100 text-xs font-bold">
            {result ? (
              <>
                <button
                  type="button"
                  onClick={onOpenBrandKit}
                  className="text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <span>Open Brand Kit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onOpenMarketingAssets}
                  className="text-stone-600 hover:text-stone-900 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Marketing Assets</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => onStartCreateBrand('product')}
                className="text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <span>Start Building</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Saved Projects Count */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-xs font-semibold text-stone-500">
              <span>Saved Cloud Projects</span>
              <Layers className="w-4 h-4 text-emerald-700" />
            </div>
            {user && user.emailVerified ? (
              <>
                <div className="text-2xl font-black text-stone-900 tabular-nums">
                  {isLoadingProjects ? '...' : savedProjects.length}
                </div>
                <p className="text-xs text-stone-600">
                  Synced privately to your verified SME account
                </p>
              </>
            ) : (
              <>
                <div className="text-lg font-extrabold text-stone-900">
                  {user ? 'Verify Email to Sync' : 'Cloud Sync Available'}
                </div>
                <p className="text-xs text-stone-600">
                  {user
                    ? 'Confirm your email address to save and reopen projects.'
                    : 'Log in to save brand strategies and reopen them anytime.'}
                </p>
              </>
            )}
          </div>

          <div className="pt-2 border-t border-stone-100 text-xs font-bold">
            {user && user.emailVerified ? (
              <button
                type="button"
                onClick={onOpenMyProjects}
                className="text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <span>Open My Projects</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuthModal('login')}
                className="text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <span>{user ? 'Verify Email Address' : 'Log In / Create Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Target Market Reach */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-xs font-semibold text-stone-500">
              <span>Target Market Regions</span>
              <MapPin className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-black text-stone-900 tabular-nums">
              {selectedRegions.length || 1}{' '}
              <span className="text-sm font-bold text-stone-500">/ 37 States & FCT</span>
            </div>
            <p className="text-xs text-stone-600 line-clamp-1" title={marketSummary}>
              Active selection: {marketSummary}
            </p>
          </div>

          <div className="pt-2 border-t border-stone-100 text-xs font-bold">
            <button
              type="button"
              onClick={() => onStartCreateBrand()}
              className="text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <span>Configure Target States</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Primary Brand Studio Workflows */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-extrabold text-stone-900">
            Choose Your Workspace Workflow
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Launch a new Nigerian brand identity from scratch or audit and elevate an established business.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Create New Brand Workflow Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col justify-between gap-5">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-stone-900">
                    Create a New Brand
                  </h3>
                  <p className="text-xs text-stone-500">
                    Names, colour palettes, positioning, bilingual captions & flyers
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Built for physical product sellers, service providers, and hybrid Nigerian businesses. Includes AI product photo recognition, all 36 states + FCT market targeting, and full brand kit exports.
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-stone-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onStartCreateBrand('product')}
                  className="px-3 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Product Brand</span>
                </button>
                <button
                  type="button"
                  onClick={() => onStartCreateBrand('service')}
                  className="px-3 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Briefcase className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Service Brand</span>
                </button>
                <button
                  type="button"
                  onClick={() => onStartCreateBrand('hybrid')}
                  className="px-3 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Wand2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Hybrid Brand</span>
                </button>
              </div>
            </div>
          </div>

          {/* Improve Existing Brand Workflow Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col justify-between gap-5">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-stone-900">
                    Improve Existing Brand
                  </h3>
                  <p className="text-xs text-stone-500">
                    6-pillar brand audit preserving your established business equity
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Keep the business name and customer loyalty you have already built while upgrading visual consistency, colour harmony, messaging, packaging perception, and WhatsApp conversion campaigns.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100">
              <div className="flex items-center gap-1.5 text-xs text-stone-500">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Preserves existing brand name by default</span>
              </div>

              <button
                type="button"
                onClick={onStartImproveBrand}
                className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Start Brand Audit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Recent Saved Projects OR Quick Sample Starters */}
      {user && user.emailVerified ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-extrabold text-stone-900">
                Recent Saved Brand Kits
              </h2>
              <p className="text-xs sm:text-sm text-stone-500">
                Reopen saved brand strategies and marketing suites directly in the workspace
              </p>
            </div>

            {savedProjects.length > 0 && (
              <button
                type="button"
                onClick={onOpenMyProjects}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <span>View All Projects</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {isLoadingProjects ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
              <Loader2 className="w-6 h-6 text-emerald-700 animate-spin mx-auto mb-2" />
              <p className="text-xs font-semibold text-stone-600">
                Loading your saved brand projects...
              </p>
            </div>
          ) : recentKits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentKits.map((project) => {
                const palette = project.brandResult?.brandIdentity?.colorPalette || [];
                const tagline = project.brandResult?.brandIdentity?.selectedTagline || '';
                return (
                  <article
                    key={project.id}
                    className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col justify-between gap-4 hover:border-emerald-300 transition-colors"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2 text-xs text-stone-500">
                        <span className="font-semibold text-emerald-800">
                          {getBusinessTypeName(project.businessType)}
                        </span>
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <Clock className="w-3 h-3 text-stone-400" />
                          {formatShortDate(project.updatedAtMs)}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-extrabold text-stone-900 truncate">
                          {project.businessName}
                        </h3>
                        {tagline && (
                          <p className="text-xs text-stone-600 italic line-clamp-2 mt-0.5">
                            &ldquo;{tagline}&rdquo;
                          </p>
                        )}
                      </div>

                      {palette.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-1">
                          {palette.slice(0, 6).map((swatch, idx) => (
                            <span
                              key={`${swatch.hex}-${idx}`}
                              className="w-5 h-5 rounded border border-stone-200"
                              style={{ backgroundColor: swatch.hex }}
                              title={`${swatch.name} (${swatch.hex})`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onReopenProject(project)}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Reopen Brand Kit</span>
                    </button>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-extrabold text-stone-900">
                  Your saved library is ready for your first brand kit
                </h3>
                <p className="text-xs text-stone-600">
                  Generate a brand kit for a product, service, or hybrid business and click Save Project to keep it here.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onStartCreateBrand('product')}
                className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create First Brand</span>
              </button>
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-extrabold text-stone-900">
                Sample Nigerian SME Templates
              </h2>
              <p className="text-xs sm:text-sm text-stone-500">
                Click any sample to prefill the studio form and test brand generation right away
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenAuthModal('login')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <span>Log In to Save Projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SAMPLE_PRODUCTS.slice(0, 3).map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => onLoadSampleAndCreate(sample)}
                className="bg-white rounded-2xl border border-stone-200 hover:border-emerald-400 p-4 text-left flex items-start gap-3.5 transition-colors cursor-pointer group"
              >
                <img
                  src={sample.imageUrl}
                  alt={sample.productName}
                  className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0"
                />
                <div className="min-w-0 space-y-1">
                  <div className="text-xs font-semibold text-emerald-800 truncate">
                    {sample.categoryLabel}
                  </div>
                  <div className="text-sm font-extrabold text-stone-900 truncate group-hover:text-emerald-800">
                    {sample.productName}
                  </div>
                  <div className="text-xs text-stone-500 tabular-nums">
                    {sample.priceRange} · {sample.targetLocation}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
