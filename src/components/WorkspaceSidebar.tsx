import React, { useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Building2,
  Palette,
  Megaphone,
  FolderKanban,
  X,
  LogIn,
  LogOut,
  UserCheck,
  ShieldAlert,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  DESKTOP_SIDEBAR_MEDIA_QUERY,
  isDesktopWidth,
  shouldShowMobileDrawer,
} from '../utils/navigationDrawer';

export type WorkspaceNavId =
  | 'dashboard'
  | 'create'
  | 'improve'
  | 'brand-kit'
  | 'marketing-assets'
  | 'projects';

interface WorkspaceSidebarProps {
  activeNav: WorkspaceNavId;
  onSelectNav: (nav: WorkspaceNavId) => void;
  hasResult: boolean;
  activeBrandName: string;
  savedProjectsCount: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenSummary: () => void;
  onOpenAuthModal: (tab?: 'login' | 'signup' | 'reset') => void;
  onLogoutSuccess?: () => void;
}

interface NavItemConfig {
  id: WorkspaceNavId;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Overview & quick launch',
    icon: LayoutDashboard,
  },
  {
    id: 'create',
    label: 'Create New Brand',
    description: 'Product, service & hybrid',
    icon: Sparkles,
  },
  {
    id: 'improve',
    label: 'Improve Existing Brand',
    description: 'Audit & elevate equity',
    icon: Building2,
  },
  {
    id: 'brand-kit',
    label: 'Brand Studio Kit',
    description: 'Names, palette & strategy',
    icon: Palette,
  },
  {
    id: 'marketing-assets',
    label: 'Marketing Assets',
    description: 'Captions, ads & flyers',
    icon: Megaphone,
  },
  {
    id: 'projects',
    label: 'My Projects',
    description: 'Saved cloud brand kits',
    icon: FolderKanban,
  },
];

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  activeNav,
  onSelectNav,
  hasResult,
  activeBrandName,
  savedProjectsCount,
  isMobileOpen,
  onCloseMobile,
  onOpenSummary,
  onOpenAuthModal,
  onLogoutSuccess,
}) => {
  const { user, authLoading, isAdmin, logOut } = useAuth();
  const drawerRef = useRef<HTMLElement>(null);
  const [isDesktopViewport, setIsDesktopViewport] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (typeof window.matchMedia === 'function') {
      return window.matchMedia(DESKTOP_SIDEBAR_MEDIA_QUERY).matches;
    }
    return isDesktopWidth(window.innerWidth);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia(DESKTOP_SIDEBAR_MEDIA_QUERY)
        : null;

    const syncViewport = () => {
      const desktop = mediaQuery ? mediaQuery.matches : isDesktopWidth(window.innerWidth);
      setIsDesktopViewport(desktop);
      if (desktop && isMobileOpen) {
        onCloseMobile();
      }
    };

    syncViewport();

    if (mediaQuery) {
      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', syncViewport);
      } else {
        mediaQuery.addListener(syncViewport);
      }
    }
    window.addEventListener('resize', syncViewport);

    return () => {
      if (mediaQuery) {
        if (typeof mediaQuery.removeEventListener === 'function') {
          mediaQuery.removeEventListener('change', syncViewport);
        } else {
          mediaQuery.removeListener(syncViewport);
        }
      }
      window.removeEventListener('resize', syncViewport);
    };
  }, [isMobileOpen, onCloseMobile]);

  const showDrawer = shouldShowMobileDrawer({ isMobileOpen, isDesktopViewport });

  useEffect(() => {
    if (!showDrawer || typeof window === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseMobile();
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (drawerRef.current?.contains(target)) return;
      if (target.closest('[data-mobile-nav-trigger="true"]')) return;
      onCloseMobile();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [showDrawer, onCloseMobile]);

  const handleNavClick = (id: WorkspaceNavId) => {
    onSelectNav(id);
    onCloseMobile();
  };

  const renderSidebarContent = (isDrawer: boolean) => (
    <div className="flex flex-col h-full bg-white text-stone-900">
      {/* Workspace Brand Identity (Desktop) or Compact Drawer Header (Narrow) */}
      {isDrawer ? (
        <div className="px-4 py-3 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-800 via-emerald-700 to-teal-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 truncate">
              Workspace Menu
            </span>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-200/70 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 cursor-pointer shrink-0"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="h-16 px-5 border-b border-stone-200 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 min-w-0 text-left cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-emerald-800 via-emerald-700 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-sm text-stone-900 tracking-tight truncate group-hover:text-emerald-800 transition-colors">
                SME <span className="text-emerald-700">Brand</span> Studio
              </div>
              <p className="text-[11px] text-stone-500 truncate">
                Nigerian MSME Workspace
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Primary Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Workspace navigation">
        <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-400">
          Workspace
        </p>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          const showKitReady =
            (item.id === 'brand-kit' || item.id === 'marketing-assets') && hasResult;
          const showProjectCount =
            item.id === 'projects' && user?.emailVerified && savedProjectsCount > 0;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-amber-300' : 'text-stone-500'
                  }`}
                />
                <div className="min-w-0">
                  <div className="text-xs sm:text-[13px] font-bold leading-tight whitespace-nowrap truncate">
                    {item.label}
                  </div>
                  <div
                    className={`text-[11px] leading-tight truncate mt-0.5 ${
                      isActive ? 'text-emerald-200' : 'text-stone-500'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              </div>

              {showKitReady && (
                <span
                  className={`text-[10px] font-bold shrink-0 ${
                    isActive ? 'text-amber-300' : 'text-emerald-700'
                  }`}
                >
                  Ready
                </span>
              )}

              {showProjectCount && (
                <span
                  className={`text-xs font-bold tabular-nums shrink-0 ${
                    isActive ? 'text-emerald-100' : 'text-stone-500'
                  }`}
                >
                  {savedProjectsCount}
                </span>
              )}
            </button>
          );
        })}

        {/* Active Brand Quick Card */}
        {hasResult && activeBrandName && (
          <div className="pt-4 mt-4 border-t border-stone-200">
            <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-3 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Active Brand Kit
              </div>
              <div className="text-sm font-extrabold text-stone-900 truncate" title={activeBrandName}>
                {activeBrandName}
              </div>
              <button
                type="button"
                onClick={() => {
                  onOpenSummary();
                  onCloseMobile();
                }}
                className="w-full py-1.5 px-2.5 rounded-lg bg-white hover:bg-emerald-100/70 border border-emerald-200 text-emerald-900 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-700" />
                <span>Full Brand Guide</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Account Footer */}
      <div className="p-3 border-t border-stone-200 bg-stone-50/80 shrink-0">
        {!authLoading &&
          (user ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white text-xs font-extrabold flex items-center justify-center shrink-0 uppercase">
                    {(user.displayName || user.email || 'U').charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-stone-900 truncate flex items-center gap-1">
                      <span className="truncate">
                        {user.displayName || user.email?.split('@')[0]}
                      </span>
                      {isAdmin && (
                        <span className="text-[10px] font-bold text-amber-700 shrink-0">
                          (Admin)
                        </span>
                      )}
                    </div>
                    {user.emailVerified ? (
                      <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 truncate">
                        <UserCheck className="w-3 h-3 shrink-0" />
                        <span className="truncate">Verified account</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenAuthModal('login');
                          onCloseMobile();
                        }}
                        className="text-[11px] text-amber-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <ShieldAlert className="w-3 h-3 shrink-0" />
                        <span>Verify email</span>
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await logOut();
                    onLogoutSuccess?.();
                    onCloseMobile();
                  }}
                  className="p-2 rounded-lg text-stone-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                  title="Log Out"
                  aria-label="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] text-stone-600 px-1 leading-snug">
                Sign in to save brand kits and run AI generation.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onOpenAuthModal('login');
                    onCloseMobile();
                  }}
                  className="py-2 px-3 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenAuthModal('signup');
                    onCloseMobile();
                  }}
                  className="py-2 px-3 rounded-lg bg-amber-100 hover:bg-amber-200 text-emerald-950 text-xs font-bold inline-flex items-center justify-center transition-colors cursor-pointer whitespace-nowrap"
                >
                  Sign Up
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar (no backdrop) */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-stone-200 bg-white sticky top-0 h-screen">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile & Narrow Preview Drawer (no dark/blurred backdrop; unmounted when closed or on desktop) */}
      {showDrawer && (
        <aside
          ref={drawerRef}
          id="mobile-workspace-drawer"
          role="dialog"
          aria-label="Workspace navigation"
          className="fixed top-16 bottom-0 left-0 z-40 lg:hidden w-72 max-w-[85vw] bg-white border-r border-stone-200 shadow-[8px_16px_36px_-10px_rgba(12,10,9,0.16)] flex flex-col"
        >
          {renderSidebarContent(true)}
        </aside>
      )}
    </>
  );
};
