import React from 'react';
import {
  RefreshCw,
  FileText,
  ShoppingBag,
  LogIn,
  LogOut,
  UserCheck,
  ShieldAlert,
  Menu,
  FolderKanban,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { WorkspaceNavId } from './WorkspaceSidebar';

interface HeaderProps {
  activeNav: WorkspaceNavId;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu: () => void;
  onLoadDemo: () => void;
  onReset: () => void;
  onOpenSummary: () => void;
  hasResult: boolean;
  activeBrandName?: string;
  onOpenAuthModal: (tab?: 'login' | 'signup' | 'reset') => void;
  onOpenProjects?: () => void;
  onLogoutSuccess?: () => void;
}

const NAV_TITLES: Record<WorkspaceNavId, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Overview, quick actions & recent brand kits',
  },
  create: {
    title: 'Create New Brand',
    subtitle: 'Product, service & hybrid Nigerian SME branding',
  },
  improve: {
    title: 'Improve Existing Brand',
    subtitle: '6-pillar audit preserving your established brand equity',
  },
  'brand-kit': {
    title: 'Brand Studio Kit',
    subtitle: 'Names, 6–8 colour palette, positioning & strategy',
  },
  'marketing-assets': {
    title: 'Marketing Assets',
    subtitle: 'English & Pidgin captions, ad storyboards & promo flyers',
  },
  projects: {
    title: 'My Projects',
    subtitle: 'Saved cloud brand kits & account preferences',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activeNav,
  isMobileMenuOpen = false,
  onToggleMobileMenu,
  onLoadDemo,
  onReset,
  onOpenSummary,
  hasResult,
  activeBrandName,
  onOpenAuthModal,
  onOpenProjects,
  onLogoutSuccess,
}) => {
  const { user, authLoading, isAdmin, logOut } = useAuth();
  const currentSection = NAV_TITLES[activeNav] || NAV_TITLES.dashboard;

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/95 backdrop-blur-md border-b border-stone-200 shrink-0">
      <div className="h-full w-full px-4 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-between gap-3">
        {/* Left: Mobile Drawer Trigger & Contextual Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            data-mobile-nav-trigger="true"
            onClick={onToggleMobileMenu}
            className={`lg:hidden inline-flex items-center justify-center w-9 h-9 -ml-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 transition-colors cursor-pointer shrink-0 ${
              isMobileMenuOpen
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
            }`}
            aria-label={isMobileMenuOpen ? 'Close workspace navigation' : 'Open workspace navigation'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-workspace-drawer"
            aria-haspopup="dialog"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="hidden sm:inline text-xs font-semibold text-stone-400 whitespace-nowrap">
                SME Brand Studio
              </span>
              <span className="hidden sm:inline text-stone-300" aria-hidden="true">
                /
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-stone-900 truncate">
                {currentSection.title}
              </h2>
              {hasResult && activeBrandName && (
                <>
                  <span className="hidden xl:inline text-stone-300" aria-hidden="true">
                    ·
                  </span>
                  <span className="hidden xl:inline text-xs font-bold text-emerald-800 truncate max-w-[200px]">
                    {activeBrandName}
                  </span>
                </>
              )}
            </div>
            <p className="hidden md:block text-[11px] text-stone-500 truncate">
              {currentSection.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Quick Workspace Actions & Account */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onLoadDemo}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-bold rounded-lg text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="Load a sample Nigerian SME product, service, or existing brand"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Try Demo</span>
          </button>

          {hasResult && (
            <>
              <button
                onClick={onOpenSummary}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-bold rounded-lg text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <FileText className="w-3.5 h-3.5 text-stone-600" />
                <span className="hidden sm:inline">Brand Guide</span>
                <span className="sm:hidden">Guide</span>
              </button>

              <button
                onClick={onReset}
                type="button"
                className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Reset active workspace & start fresh"
                aria-label="Reset studio"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Compact Account Controls */}
          {!authLoading &&
            (user ? (
              <div className="flex items-center gap-1.5 pl-2 border-l border-stone-200 shrink-0">
                {onOpenProjects && activeNav !== 'projects' && (
                  <button
                    type="button"
                    onClick={onOpenProjects}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors cursor-pointer whitespace-nowrap"
                    title="Open My Projects"
                  >
                    <FolderKanban className="w-3.5 h-3.5 text-emerald-700" />
                    <span>My Projects</span>
                  </button>
                )}

                {!user.emailVerified ? (
                  <button
                    type="button"
                    onClick={() => onOpenAuthModal('login')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold cursor-pointer whitespace-nowrap"
                    title="Verify your email address"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Verify Email</span>
                  </button>
                ) : (
                  <div
                    className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold whitespace-nowrap"
                    title={user.email || ''}
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="max-w-[110px] truncate">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                    {isAdmin && (
                      <span className="text-[10px] font-bold text-amber-700">
                        · Admin
                      </span>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={async () => {
                    await logOut();
                    onLogoutSuccess?.();
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg text-stone-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer whitespace-nowrap"
                  title="Log Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Log Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 pl-2 border-l border-stone-200 shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenAuthModal('login')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-bold rounded-lg text-white bg-emerald-800 hover:bg-emerald-900 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuthModal('signup')}
                  className="hidden sm:inline-flex items-center px-3 py-1.5 sm:py-2 text-xs font-bold rounded-lg text-emerald-950 bg-amber-100 hover:bg-amber-200 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Sign Up
                </button>
              </div>
            ))}
        </div>
      </div>
    </header>
  );
};
