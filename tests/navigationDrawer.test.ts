import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import App from '../src/App';
import { AuthProvider } from '../src/context/AuthContext';
import {
  DESKTOP_SIDEBAR_BREAKPOINT_PX,
  DESKTOP_SIDEBAR_MEDIA_QUERY,
  isDesktopWidth,
  shouldShowMobileDrawer,
  resolveMobileNavOnResize,
} from '../src/utils/navigationDrawer';

test('desktop breakpoint constants and width helpers classify Preview vs desktop accurately', () => {
  assert.equal(DESKTOP_SIDEBAR_BREAKPOINT_PX, 1024);
  assert.equal(DESKTOP_SIDEBAR_MEDIA_QUERY, '(min-width: 1024px)');

  // Standard narrow Google AI Studio Preview and mobile widths
  assert.equal(isDesktopWidth(375), false);
  assert.equal(isDesktopWidth(600), false);
  assert.equal(isDesktopWidth(768), false);
  assert.equal(isDesktopWidth(1023), false);

  // Fullscreen desktop widths
  assert.equal(isDesktopWidth(1024), true);
  assert.equal(isDesktopWidth(1280), true);
  assert.equal(isDesktopWidth(1440), true);
});

test('shouldShowMobileDrawer stays closed by default on narrow Preview and always false on desktop', () => {
  // Default load in narrow Preview: closed -> no drawer
  assert.equal(shouldShowMobileDrawer({ isMobileOpen: false, isDesktopViewport: false }), false);

  // Default load in fullscreen desktop: closed -> no drawer
  assert.equal(shouldShowMobileDrawer({ isMobileOpen: false, isDesktopViewport: true }), false);

  // User clicks menu button in narrow Preview -> drawer shown
  assert.equal(shouldShowMobileDrawer({ isMobileOpen: true, isDesktopViewport: false }), true);

  // Even if stale isMobileOpen=true reached desktop breakpoint -> never show drawer
  assert.equal(shouldShowMobileDrawer({ isMobileOpen: true, isDesktopViewport: true }), false);
});

test('resolveMobileNavOnResize prevents stale overlays when resizing between Preview and fullscreen', () => {
  // Narrow Preview (open) -> Fullscreen desktop: closes drawer
  assert.equal(
    resolveMobileNavOnResize({ isMobileOpen: true, prevWidth: 680, nextWidth: 1280 }),
    false
  );

  // Fullscreen -> Narrow Preview: clears stale state rather than flashing open
  assert.equal(
    resolveMobileNavOnResize({ isMobileOpen: true, prevWidth: 1280, nextWidth: 680 }),
    false
  );

  // Resizing between narrow widths: closes drawer cleanly
  assert.equal(
    resolveMobileNavOnResize({ isMobileOpen: true, prevWidth: 480, nextWidth: 760 }),
    false
  );

  // Mobile height-only resize (URL bar collapse/expand keeps width unchanged): preserves open drawer
  assert.equal(
    resolveMobileNavOnResize({ isMobileOpen: true, prevWidth: 390, nextWidth: 390 }),
    true
  );

  // Closed stays closed on any resize
  assert.equal(
    resolveMobileNavOnResize({ isMobileOpen: false, prevWidth: 390, nextWidth: 760 }),
    false
  );
});

test('Initial App render at narrow Preview viewport has drawer CLOSED with zero backdrops or overlays', () => {
  const prevWindow = (globalThis as { window?: unknown }).window;
  try {
    // Simulate a narrow embedded Google AI Studio Preview viewport (e.g. 640px wide)
    (globalThis as { window?: unknown }).window = {
      innerWidth: 640,
      matchMedia: (query: string) => ({
        matches: false,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
      }),
    };

    const html = renderToStaticMarkup(
      React.createElement(AuthProvider, null, React.createElement(App))
    );

    // Drawer must be completely unmounted on initial load
    assert.equal(html.includes('id="mobile-workspace-drawer"'), false);

    // Zero modal/backdrop overlays should be present on initial load
    assert.equal(html.includes('fixed inset-0'), false);
    assert.equal(html.includes('bg-stone-950/'), false);
    assert.equal(html.includes('bg-stone-900/70'), false);

    // Hamburger menu trigger must be present, collapsed, and linked to mobile-workspace-drawer
    assert.equal(html.includes('aria-controls="mobile-workspace-drawer"'), true);
    assert.equal(html.includes('aria-expanded="false"'), true);
    assert.equal(html.includes('aria-label="Open workspace navigation"'), true);

    // Permanent desktop sidebar remains present (hidden below lg)
    assert.equal(html.includes('hidden lg:flex lg:flex-col w-64'), true);
  } finally {
    if (prevWindow === undefined) {
      delete (globalThis as { window?: unknown }).window;
    } else {
      (globalThis as { window?: unknown }).window = prevWindow;
    }
  }
});

test('WorkspaceSidebar, Header, and App remove dark/blurred backdrops while supporting X, hamburger toggle, Escape, and outside click', () => {
  const rootDir = process.cwd();
  const appSource = fs.readFileSync(path.join(rootDir, 'src/App.tsx'), 'utf8');
  const sidebarSource = fs.readFileSync(path.join(rootDir, 'src/components/WorkspaceSidebar.tsx'), 'utf8');
  const headerSource = fs.readFileSync(path.join(rootDir, 'src/components/Header.tsx'), 'utf8');

  // 1. App initializes mobile drawer closed and never auto-opens on mount/route/auth
  assert.match(appSource, /const \[isMobileNavOpen,\s*setIsMobileNavOpen\]\s*=\s*useState\(false\)/);
  assert.doesNotMatch(appSource, /setIsMobileNavOpen\(true\)/);
  assert.match(appSource, /onToggleMobileMenu=\{\(\)\s*=>\s*setIsMobileNavOpen\(\(prev\)\s*=>\s*!prev\)\}/);
  assert.match(appSource, /setIsMobileNavOpen\(false\);\s*\},\s*\[activeNav\]/);
  assert.match(appSource, /resolveMobileNavOnResize\(/);

  // 2. Header toggles drawer via accessible hamburger trigger
  assert.match(headerSource, /className=\{`lg:hidden[^`]*`\}/);
  assert.match(headerSource, /data-mobile-nav-trigger="true"/);
  assert.match(headerSource, /aria-expanded=\{isMobileMenuOpen\}/);
  assert.match(headerSource, /aria-controls="mobile-workspace-drawer"/);
  assert.match(headerSource, /onClick=\{onToggleMobileMenu\}/);

  // 3. WorkspaceSidebar has NO dark backdrop, NO backdrop-blur, and NO fixed inset-0 overlay
  assert.doesNotMatch(sidebarSource, /backdrop-blur/);
  assert.doesNotMatch(sidebarSource, /bg-stone-950/);
  assert.doesNotMatch(sidebarSource, /fixed inset-0/);

  // 4. WorkspaceSidebar keeps permanent desktop sidebar + distinct white drawer with border/shadow and close paths
  assert.match(sidebarSource, /<aside className="hidden lg:flex lg:flex-col w-64/);
  assert.match(sidebarSource, /\{showDrawer && \(/);
  assert.match(sidebarSource, /id="mobile-workspace-drawer"/);
  assert.match(sidebarSource, /bg-white border-r border-stone-200/);
  assert.match(sidebarSource, /aria-label="Close navigation menu"/);
  assert.match(sidebarSource, /event\.key === 'Escape'/);
  assert.match(sidebarSource, /document\.addEventListener\('pointerdown', handlePointerDown\)/);
  assert.match(sidebarSource, /onSelectNav\(id\);\s*onCloseMobile\(\);/);
});
