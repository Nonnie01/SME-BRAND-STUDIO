import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Building2,
  FolderOpen,
  Trash2,
  Edit3,
  Clock,
  MapPin,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Settings,
  ShieldCheck,
  Info,
  X,
  Save,
  Layers,
  Package,
  Briefcase,
  Wand2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BusinessType, SavedBrandProject } from '../types';
import { parseFriendlyFirestoreError, UpdateProjectInput } from '../services/projectService';
import { NigerianMarketRegionSelector } from './NigerianMarketRegionSelector';
import { formatRegionSummary } from '../data/nigerianRegions';

interface CustomerDashboardProps {
  projects: SavedBrandProject[];
  isLoadingProjects: boolean;
  projectsError: string | null;
  activeProjectId: string | null;
  onRetryLoadProjects: () => void;
  onCreateNewBrand: () => void;
  onImproveExistingBrand: () => void;
  onReopenProject: (project: SavedBrandProject) => void;
  onUpdateProjectDetails: (project: SavedBrandProject, updates: UpdateProjectInput) => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
  onCloseDashboard: () => void;
  onOpenAuthModal: (tab?: 'login' | 'signup' | 'reset') => void;
  onNotify: (msg: string) => void;
  embeddedInWorkspace?: boolean;
}

type DashboardFilter = 'all' | BusinessType;

function formatProjectDate(ms?: number): string {
  if (!ms) return 'Just now';
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

function getBusinessTypeLabel(type: BusinessType): string {
  if (type === 'service') return 'Service-Based';
  if (type === 'hybrid') return 'Hybrid (Products + Services)';
  return 'Product-Based';
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  projects,
  isLoadingProjects,
  projectsError,
  activeProjectId,
  onRetryLoadProjects,
  onCreateNewBrand,
  onImproveExistingBrand,
  onReopenProject,
  onUpdateProjectDetails,
  onDeleteProject,
  onCloseDashboard,
  onOpenAuthModal,
  onNotify,
  embeddedInWorkspace = false,
}) => {
  const {
    user,
    profile,
    resendVerificationEmail,
    refreshVerificationStatus,
    updateCustomerProfile,
  } = useAuth();

  // Project filtering & search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<DashboardFilter>('all');

  // Verification actions state
  const [verifyingAction, setVerifyingAction] = useState(false);
  const [verifyFeedback, setVerifyFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit Project Info Modal state
  const [editingProject, setEditingProject] = useState<SavedBrandProject | null>(null);
  const [editBusinessName, setEditBusinessName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTagline, setEditTagline] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editSelectedRegions, setEditSelectedRegions] = useState<string[]>([]);
  const [editTone, setEditTone] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete Confirmation Modal state
  const [deletingProject, setDeletingProject] = useState<SavedBrandProject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Account Settings state
  const [settingsDisplayName, setSettingsDisplayName] = useState('');
  const [settingsBusinessName, setSettingsBusinessName] = useState('');
  const [settingsLocation, setSettingsLocation] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setSettingsDisplayName(profile?.displayName || user?.displayName || '');
    setSettingsBusinessName(profile?.defaultBusinessName || '');
    setSettingsLocation(profile?.defaultLocation || '');
  }, [profile, user]);

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return projects.filter((proj) => {
      if (typeFilter !== 'all' && proj.businessType !== typeFilter) return false;
      if (!q) return true;
      const hay = [
        proj.businessName,
        proj.businessCategory,
        proj.targetLocation,
        proj.brandResult?.brandIdentity?.selectedTagline,
        proj.productDescription,
        proj.serviceDescription,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [projects, typeFilter, searchQuery]);

  const recentBrandKits = useMemo(() => {
    return projects
      .filter((p) => p.brandResult && p.brandResult.brandIdentity)
      .slice(0, 3);
  }, [projects]);

  const openEditModal = (project: SavedBrandProject) => {
    const initialRegions = Array.isArray(project.formSnapshot?.selectedRegions)
      ? project.formSnapshot.selectedRegions
      : Array.isArray(project.selectedRegions)
      ? project.selectedRegions
      : [];
    setEditingProject(project);
    setEditBusinessName(project.businessName || project.brandResult?.brandIdentity?.selectedName || '');
    setEditCategory(project.businessCategory || '');
    setEditTagline(project.brandResult?.brandIdentity?.selectedTagline || '');
    setEditSelectedRegions(initialRegions);
    setEditLocation(
      project.targetLocation || (initialRegions.length > 0 ? formatRegionSummary(initialRegions) : '')
    );
    setEditTone(project.brandTone || '');
    setEditDescription(
      project.businessType === 'service'
        ? project.serviceDescription || ''
        : project.productDescription || project.serviceDescription || ''
    );
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    const cleanName = editBusinessName.trim();
    if (!cleanName) {
      setEditError('Business name cannot be empty.');
      return;
    }

    setIsSavingEdit(true);
    setEditError(null);

    try {
      const updatedBrandNames = Array.isArray(editingProject.brandResult?.brandNames)
        ? editingProject.brandResult.brandNames.map((opt, idx) =>
            idx === 0 || opt.name === editingProject.businessName
              ? { ...opt, name: cleanName, tagline: editTagline.trim() || opt.tagline }
              : opt
          )
        : [];

      const updatedBrandResult = {
        ...editingProject.brandResult,
        brandNames: updatedBrandNames,
        brandIdentity: {
          ...editingProject.brandResult.brandIdentity,
          selectedName: cleanName,
          selectedTagline:
            editTagline.trim() || editingProject.brandResult.brandIdentity.selectedTagline,
        },
      };

      const resolvedLocationSummary =
        editLocation.trim() ||
        (editSelectedRegions.length > 0 ? formatRegionSummary(editSelectedRegions) : '');

      const nextSnapshot = {
        ...(editingProject.formSnapshot || {}),
        customBrandName: cleanName,
        selectedRegions: editSelectedRegions,
        targetLocation: resolvedLocationSummary,
        brandTone: editTone.trim(),
        ...(editingProject.businessType === 'service'
          ? { serviceDescription: editDescription.trim() }
          : { description: editDescription.trim() }),
      };

      const updates: UpdateProjectInput = {
        businessName: cleanName,
        businessCategory: editCategory.trim() || editingProject.businessCategory,
        selectedRegions: editSelectedRegions,
        targetLocation: resolvedLocationSummary,
        brandTone: editTone.trim(),
        ...(editingProject.businessType === 'service'
          ? { serviceDescription: editDescription.trim() }
          : { productDescription: editDescription.trim() }),
        formSnapshot: nextSnapshot,
        brandResult: updatedBrandResult,
      };

      await onUpdateProjectDetails(editingProject, updates);
      setEditingProject(null);
      onNotify(`Saved changes to "${cleanName}".`);
    } catch (err) {
      setEditError(parseFriendlyFirestoreError(err, 'Could not update project details.'));
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProject) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await onDeleteProject(deletingProject.id);
      onNotify(`Deleted project "${deletingProject.businessName}".`);
      setDeletingProject(null);
    } catch (err) {
      setDeleteError(parseFriendlyFirestoreError(err, 'Could not delete project.'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveAccountSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsFeedback(null);
    if (!settingsDisplayName.trim()) {
      setSettingsFeedback({ type: 'error', text: 'Display name is required.' });
      return;
    }

    setIsSavingSettings(true);
    try {
      await updateCustomerProfile({
        displayName: settingsDisplayName,
        defaultBusinessName: settingsBusinessName,
        defaultLocation: settingsLocation,
      });
      setSettingsFeedback({
        type: 'success',
        text: 'Account settings saved to your private cloud profile.',
      });
      onNotify('Account settings updated!');
    } catch (err) {
      setSettingsFeedback({
        type: 'error',
        text: parseFriendlyFirestoreError(err, 'Failed to update account settings.'),
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleResendVerification = async () => {
    setVerifyingAction(true);
    setVerifyFeedback(null);
    try {
      await resendVerificationEmail();
      setVerifyFeedback({
        type: 'success',
        text: `Verification link re-sent to ${user?.email}. Please check your inbox and spam folder.`,
      });
    } catch (err: any) {
      setVerifyFeedback({
        type: 'error',
        text: err?.message || 'Could not send verification email right now.',
      });
    } finally {
      setVerifyingAction(false);
    }
  };

  const handleRefreshVerification = async () => {
    setVerifyingAction(true);
    setVerifyFeedback(null);
    try {
      const ok = await refreshVerificationStatus();
      if (ok) {
        setVerifyFeedback({
          type: 'success',
          text: 'Email verified! Loading your saved projects...',
        });
        onRetryLoadProjects();
      } else {
        setVerifyFeedback({
          type: 'error',
          text: 'Email is not verified yet. Open the link sent to your inbox first, then click Refresh Status.',
        });
      }
    } catch (err: any) {
      setVerifyFeedback({
        type: 'error',
        text: err?.message || 'Could not refresh verification status.',
      });
    } finally {
      setVerifyingAction(false);
    }
  };

  if (!user) {
    return (
      <section className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
          <FolderOpen className="w-6 h-6" />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900">
          Log in to access My Projects
        </h2>
        <p className="text-sm text-stone-600 max-w-md mx-auto">
          Save your Nigerian SME brand strategies, palettes, captions, and WhatsApp campaigns securely across devices in Cloud Firestore.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onOpenAuthModal('login')}
            className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-bold cursor-pointer whitespace-nowrap"
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => onOpenAuthModal('signup')}
            className="px-5 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-emerald-950 text-sm font-bold cursor-pointer whitespace-nowrap"
          >
            Create Free Account
          </button>
        </div>
      </section>
    );
  }

  const displayOwnerName =
    profile?.displayName || user.displayName || user.email?.split('@')[0] || 'Business Owner';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {embeddedInWorkspace ? (
        /* Focused SaaS Page Header for My Projects */
        <section className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900">
              My Projects
            </h1>
            <p className="text-xs sm:text-sm text-stone-600">
              {user.email} ·{' '}
              <span className="tabular-nums font-semibold text-stone-800">
                {projects.length} {projects.length === 1 ? 'saved project' : 'saved projects'}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onCreateNewBrand}
              className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Brand</span>
            </button>
            <button
              type="button"
              onClick={onImproveExistingBrand}
              className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>Improve Existing Brand</span>
            </button>
          </div>
        </section>
      ) : (
        <>
          {/* Top Return Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onCloseDashboard}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Brand Studio</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span>{user.email}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                {projects.length} {projects.length === 1 ? 'saved project' : 'saved projects'}
              </span>
            </div>
          </div>

          {/* 1. Welcome Banner & Quick Actions */}
          <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-emerald-800/40">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <p className="text-xs font-semibold text-emerald-300 tracking-wide">
                  Customer Workspace
                </p>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Welcome back, {displayOwnerName}
                </h1>
                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                  {profile?.defaultBusinessName
                    ? `Managing brand assets for ${profile.defaultBusinessName}. Start a new brand identity, upgrade an existing business, or reopen any saved project below.`
                    : 'Start a fresh brand identity for your products or services, audit an established business, or reopen your saved brand kits anytime.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={onCreateNewBrand}
                  className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-sm font-extrabold inline-flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Brand</span>
                </button>

                <button
                  type="button"
                  onClick={onImproveExistingBrand}
                  className="px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Improve Existing Brand</span>
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Email Verification Gate (Required by Firestore Security Rules) */}
      {!user.emailVerified && (
        <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h2 className="text-base font-extrabold text-amber-950">
                Verify your email address to unlock Cloud Firestore project saving
              </h2>
              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                You are signed in as <strong>{user.email}</strong>. Our database security rules require email verification before reading or saving brand projects in your account.
              </p>
            </div>
          </div>

          {verifyFeedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                verifyFeedback.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {verifyFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              )}
              <span>{verifyFeedback.text}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleRefreshVerification}
              disabled={verifyingAction}
              className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {verifyingAction ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>I Verified My Email — Refresh Status</span>
            </button>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={verifyingAction}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-amber-100 border border-amber-300 text-amber-950 text-xs sm:text-sm font-bold cursor-pointer disabled:opacity-60"
            >
              Resend Verification Link
            </button>
          </div>
        </section>
      )}

      {/* Honest Cloud Storage Notice */}
      <div className="bg-stone-100/90 border border-stone-200 rounded-2xl p-4 flex items-start gap-3 text-xs sm:text-sm text-stone-700">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-stone-900">What is saved in your cloud account:</strong> Business details, Nigerian market regions, brand strategy, colour palettes, English/Pidgin captions, and WhatsApp campaigns are saved in Cloud Firestore. Uploaded product photographs and generated promotional PNG flyers are <strong>not</strong> stored permanently in cloud file storage yet — please download your flyers as PNG or use <strong>Export Complete Brand Kit (ZIP)</strong> to keep local copies.
        </p>
      </div>

      {/* 2. Recent Brand Kits */}
      {user.emailVerified && recentBrandKits.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-stone-900">
                Recent Brand Kits
              </h2>
              <p className="text-xs text-stone-500">
                Quickly jump back into your most recently updated brand suites
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentBrandKits.map((kit) => {
              const palette = kit.brandResult?.brandIdentity?.colorPalette || [];
              const tagline = kit.brandResult?.brandIdentity?.selectedTagline || '';
              return (
                <div
                  key={kit.id}
                  className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col justify-between gap-4 hover:border-emerald-300 transition-colors"
                >
                  <div className="space-y-2.5">
                    <div className="text-xs text-stone-500 flex items-center gap-1.5 flex-wrap">
                      <span>{getBusinessTypeLabel(kit.businessType)}</span>
                      <span aria-hidden="true">·</span>
                      <span>Updated {formatProjectDate(kit.updatedAtMs)}</span>
                    </div>

                    <h3 className="text-base font-extrabold text-stone-900 line-clamp-1">
                      {kit.businessName}
                    </h3>

                    {tagline && (
                      <p className="text-xs text-stone-600 italic line-clamp-2">
                        &ldquo;{tagline}&rdquo;
                      </p>
                    )}

                    {/* Brand Palette Swatches */}
                    {palette.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1" aria-label="Brand colour palette">
                        {palette.slice(0, 6).map((swatch, idx) => (
                          <span
                            key={`${swatch.hex}-${idx}`}
                            className="w-6 h-6 rounded-md border border-stone-200 shadow-2xs"
                            style={{ backgroundColor: swatch.hex }}
                            title={`${swatch.name} (${swatch.hex})`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onReopenProject(kit)}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Open Brand Kit</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. My Saved Projects */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-stone-900">
              My Saved Projects
            </h2>
            <p className="text-xs text-stone-500">
              Reopen, edit details, export PDFs, or manage your saved SME projects
            </p>
          </div>

          <button
            type="button"
            onClick={onRetryLoadProjects}
            disabled={isLoadingProjects || !user.emailVerified}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-xs font-bold text-stone-700 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingProjects ? 'animate-spin' : ''}`} />
            <span>Refresh List</span>
          </button>
        </div>

        {/* Search + Segmented Business Type Filter */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by business name, category, or state..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-white border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl overflow-x-auto">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'product', label: 'Product' },
                { id: 'service', label: 'Service' },
                { id: 'hybrid', label: 'Hybrid' },
              ] as { id: DashboardFilter; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTypeFilter(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  typeFilter === tab.id
                    ? 'bg-white text-emerald-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoadingProjects && (
          <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-700 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-stone-700">
              Loading your saved brand projects from Cloud Firestore...
            </p>
          </div>
        )}

        {/* Error State */}
        {!isLoadingProjects && projectsError && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-rose-950">
                  Could not load saved projects
                </h3>
                <p className="text-xs text-rose-900 leading-relaxed">{projectsError}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onRetryLoadProjects}
              className="self-start sm:self-center px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold cursor-pointer shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingProjects && !projectsError && user.emailVerified && projects.length === 0 && (
          <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg font-extrabold text-stone-900">
                No saved brand projects yet
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Generate a Product, Service, Hybrid, or Existing Brand upgrade in the studio, then click <strong>Save Project</strong> to store it safely in your dashboard.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onCreateNewBrand}
                className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Brand</span>
              </button>
              <button
                type="button"
                onClick={onImproveExistingBrand}
                className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-bold cursor-pointer"
              >
                Improve Existing Brand
              </button>
            </div>
          </div>
        )}

        {/* Search Filter No Matches */}
        {!isLoadingProjects &&
          !projectsError &&
          projects.length > 0 &&
          filteredProjects.length === 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-2">
              <p className="text-sm font-bold text-stone-800">
                No projects match your current search or filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('all');
                }}
                className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          )}

        {/* Saved Projects List */}
        {!isLoadingProjects && filteredProjects.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredProjects.map((project) => {
              const palette = project.brandResult?.brandIdentity?.colorPalette || [];
              const tagline = project.brandResult?.brandIdentity?.selectedTagline || '';
              const isActiveInWorkspace = activeProjectId === project.id;
              const regionsPreview =
                project.selectedRegions && project.selectedRegions.length > 0
                  ? project.selectedRegions.slice(0, 3).join(', ') +
                    (project.selectedRegions.length > 3
                      ? ` +${project.selectedRegions.length - 3} more`
                      : '')
                  : project.targetLocation || 'Nigeria';

              const descriptionPreview =
                project.businessType === 'service'
                  ? project.serviceDescription
                  : project.productDescription || project.serviceDescription;

              return (
                <article
                  key={project.id}
                  className={`bg-white rounded-2xl border p-5 sm:p-6 flex flex-col justify-between gap-4 transition-colors ${
                    isActiveInWorkspace
                      ? 'border-emerald-500 ring-1 ring-emerald-500/20'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Unboxed Metadata Line */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                          {project.businessType === 'hybrid' ? (
                            <Wand2 className="w-3.5 h-3.5" />
                          ) : project.businessType === 'service' ? (
                            <Briefcase className="w-3.5 h-3.5" />
                          ) : (
                            <Package className="w-3.5 h-3.5" />
                          )}
                          {getBusinessTypeLabel(project.businessType)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{project.businessCategory || 'General SME'}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {project.studioMode === 'improve' ? 'Brand Upgrade' : 'New Brand'}
                        </span>
                      </div>

                      {isActiveInWorkspace && (
                        <span className="text-[11px] font-bold text-emerald-700">
                          Loaded in Studio
                        </span>
                      )}
                    </div>

                    {/* Title & Tagline */}
                    <div>
                      <h3 className="text-lg font-extrabold text-stone-900">
                        {project.businessName}
                      </h3>
                      {tagline && (
                        <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                          {tagline}
                        </p>
                      )}
                    </div>

                    {descriptionPreview && (
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {descriptionPreview}
                      </p>
                    )}

                    {/* Market & Timestamps */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-500 pt-1">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        {regionsPreview}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        Created {formatProjectDate(project.createdAtMs)}
                      </span>
                      <span>Updated {formatProjectDate(project.updatedAtMs)}</span>
                    </div>

                    {/* Palette & Session Flyer Metadata */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      {palette.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          {palette.slice(0, 8).map((swatch, idx) => (
                            <span
                              key={`${swatch.hex}-${idx}`}
                              className="w-5 h-5 rounded border border-stone-200"
                              style={{ backgroundColor: swatch.hex }}
                              title={`${swatch.name} (${swatch.hex})`}
                            />
                          ))}
                        </div>
                      )}
                      {project.promoImageRefs && project.promoImageRefs.length > 0 && (
                        <span className="text-[11px] text-stone-500">
                          {project.promoImageRefs.length} flyer{' '}
                          {project.promoImageRefs.length === 1 ? 'record' : 'records'} noted
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onReopenProject(project)}
                      className="flex-1 min-w-[140px] py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Reopen in Studio</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditModal(project)}
                      className="py-2.5 px-3.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Info</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError(null);
                        setDeletingProject(project);
                      }}
                      className="py-2.5 px-3.5 rounded-xl text-rose-700 hover:bg-rose-50 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      aria-label={`Delete ${project.businessName}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Account Settings */}
      <section className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-stone-900">Account Settings</h2>
            <p className="text-xs text-stone-500">
              Manage your SME profile defaults stored privately under your verified account
            </p>
          </div>
        </div>

        {settingsFeedback && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-start gap-2 ${
              settingsFeedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {settingsFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            )}
            <span>{settingsFeedback.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveAccountSettings} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Display Name *
            </label>
            <input
              type="text"
              required
              maxLength={120}
              value={settingsDisplayName}
              onChange={(e) => setSettingsDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Default Business Name
            </label>
            <input
              type="text"
              maxLength={160}
              value={settingsBusinessName}
              onChange={(e) => setSettingsBusinessName(e.target.value)}
              placeholder="e.g. Zuri Atelier Lagos"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Default Market Location
            </label>
            <input
              type="text"
              maxLength={160}
              value={settingsLocation}
              onChange={(e) => setSettingsLocation(e.target.value)}
              placeholder="e.g. Lagos, Abuja & Port Harcourt"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="md:col-span-3 flex flex-wrap items-center justify-between gap-3 pt-1">
            <span className="text-xs text-stone-500">
              Account email: <strong>{user.email}</strong>
            </span>
            <button
              type="submit"
              disabled={isSavingSettings || !user.emailVerified}
              className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSavingSettings ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isSavingSettings ? 'Saving Settings...' : 'Save Account Settings'}</span>
            </button>
          </div>
        </form>
      </section>

      {/* Edit Project Info Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto">
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-stone-900">
                  Edit Saved Project Info
                </h3>
                <p className="text-xs text-stone-500">
                  Update project metadata directly in Cloud Firestore
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 cursor-pointer"
                aria-label="Close edit modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{editError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  maxLength={160}
                  value={editBusinessName}
                  onChange={(e) => setEditBusinessName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Business Category
                  </label>
                  <input
                    type="text"
                    maxLength={120}
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Brand Tone
                  </label>
                  <input
                    type="text"
                    maxLength={120}
                    value={editTone}
                    onChange={(e) => setEditTone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Brand Tagline
                </label>
                <input
                  type="text"
                  maxLength={240}
                  value={editTagline}
                  onChange={(e) => setEditTagline(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-2.5">
                <NigerianMarketRegionSelector
                  selectedRegions={editSelectedRegions}
                  onChange={(regions) => {
                    setEditSelectedRegions(regions);
                    setEditLocation(regions.length > 0 ? formatRegionSummary(regions) : '');
                  }}
                />
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Target Location Summary
                  </label>
                  <input
                    type="text"
                    maxLength={300}
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="Auto-filled from selected states or custom summary"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Business / Offering Description
                </label>
                <textarea
                  rows={3}
                  maxLength={4000}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSavingEdit ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>{isSavingEdit ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-stone-900">
                Delete saved project?
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                This will permanently remove <strong>{deletingProject.businessName}</strong> and its saved strategy, palette, and marketing content from Cloud Firestore. This action cannot be undone.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProject(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-bold cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
