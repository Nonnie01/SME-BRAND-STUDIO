export const DESKTOP_SIDEBAR_BREAKPOINT_PX = 1024;
export const DESKTOP_SIDEBAR_MEDIA_QUERY = `(min-width: ${DESKTOP_SIDEBAR_BREAKPOINT_PX}px)`;

export function isDesktopWidth(width: number): boolean {
  return Number.isFinite(width) && width >= DESKTOP_SIDEBAR_BREAKPOINT_PX;
}

export function shouldShowMobileDrawer({
  isMobileOpen,
  isDesktopViewport,
}: {
  isMobileOpen: boolean;
  isDesktopViewport: boolean;
}): boolean {
  return Boolean(isMobileOpen) && !Boolean(isDesktopViewport);
}

/**
 * Ensures stale mobile drawer states never remain open when switching between
 * narrow Preview panels, mobile screens, and fullscreen desktop views, while
 * ignoring height-only resizes (such as mobile browser URL bar show/hide).
 */
export function resolveMobileNavOnResize({
  isMobileOpen,
  prevWidth,
  nextWidth,
}: {
  isMobileOpen: boolean;
  prevWidth: number;
  nextWidth: number;
}): boolean {
  if (!isMobileOpen) return false;
  if (isDesktopWidth(nextWidth)) return false;
  if (prevWidth !== nextWidth) return false;
  return true;
}
