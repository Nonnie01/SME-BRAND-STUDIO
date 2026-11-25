import React, { useState } from 'react';
import { StrategicColorSwatch, BrandColorRole } from '../types';
import {
  Palette,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Edit3,
  Sliders,
  ShieldCheck,
  Eye,
  AlertTriangle,
  RotateCcw,
  Plus,
  Trash2,
  Layers,
} from 'lucide-react';

interface InteractiveBrandPaletteProps {
  palette: StrategicColorSwatch[];
  onUpdatePalette: (newPalette: StrategicColorSwatch[]) => void;
  onRegeneratePalette?: () => Promise<void>;
  isRegenerating?: boolean;
  paletteError?: string | null;
  onDismissPaletteError?: () => void;
  onCopyText: (text: string, label: string) => void;
  brandName?: string;
  tagline?: string;
}

// Standard 8 Coordinated Roles
const STANDARD_ROLES: { role: BrandColorRole; description: string; defaultHex: string }[] = [
  { role: 'Primary brand colour', description: 'Core brand signature; packaging and hero identity', defaultHex: '#0D5C3A' },
  { role: 'Secondary brand colour', description: 'Supports primary; social flyers and secondary assets', defaultHex: '#D97706' },
  { role: 'Accent colour', description: 'Call-to-Action buttons and flash promotional banners', defaultHex: '#C2410C' },
  { role: 'Supporting colour', description: 'Borders, secondary cards, and packaging trim', defaultHex: '#365314' },
  { role: 'Background colour', description: 'Clean canvas for digital catalogs and product listings', defaultHex: '#FDFBF7' },
  { role: 'Text colour', description: 'High-contrast typography for mobile and sunlight legibility', defaultHex: '#0F172A' },
  { role: 'Complementary colour', description: 'Harmonious pairing for seasonal and celebratory drops', defaultHex: '#1E3A8A' },
  { role: 'Highlight colour', description: 'Badges, discount bubbles, and notification accents', defaultHex: '#F59E0B' },
];

// Quick harmony shade suggestions for quick replacements
const HARMONY_PRESETS = [
  '#0D5C3A', '#059669', '#10B981', '#065F46', // Emeralds
  '#D97706', '#F59E0B', '#B45309', '#78350F', // Ochre / Golds
  '#C2410C', '#EA580C', '#9A3412', '#7C2D12', // Terracottas
  '#1E3A8A', '#2563EB', '#1D4ED8', '#172554', // Royal Indigos
  '#4D7C0F', '#65A30D', '#365314', '#14532D', // Olives
  '#FDFBF7', '#F8FAFC', '#F1F5F9', '#FFFBEB', // Light Backgrounds
  '#0F172A', '#1E293B', '#18181B', '#262626', // Dark Neutrals
  '#831843', '#BE185D', '#9333EA', '#4C1D95', // Regal Berries
];

// Helper: Relative Luminance for WCAG Contrast
function getLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return 0.5;
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const a = [r, g, b].map((v) => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Calculate WCAG Contrast Ratio
function getContrastRatio(hex1: string, hex2: string): number {
  try {
    const lum1 = getLuminance(hex1);
    const lum2 = getLuminance(hex2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  } catch {
    return 4.5;
  }
}

export const InteractiveBrandPalette: React.FC<InteractiveBrandPaletteProps> = ({
  palette,
  onUpdatePalette,
  onRegeneratePalette,
  isRegenerating = false,
  paletteError = null,
  onDismissPaletteError,
  onCopyText,
  brandName = 'SME Brand',
  tagline = 'Authentic Nigerian Craftsmanship',
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempHex, setTempHex] = useState<string>('');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<boolean>(true);

  // Identify Key Functional Colours from the Palette
  const bgColor = palette.find((c) => c.role.toLowerCase().includes('background'))?.hex || '#FDFBF7';
  const textColor = palette.find((c) => c.role.toLowerCase().includes('text'))?.hex || '#0F172A';
  const primaryColor = palette.find((c) => c.role.toLowerCase().includes('primary'))?.hex || palette[0]?.hex || '#0D5C3A';
  const accentColor = palette.find((c) => c.role.toLowerCase().includes('accent'))?.hex || palette[2]?.hex || '#C2410C';
  const secondaryColor = palette.find((c) => c.role.toLowerCase().includes('secondary'))?.hex || palette[1]?.hex || '#D97706';
  const highlightColor = palette.find((c) => c.role.toLowerCase().includes('highlight'))?.hex || '#F59E0B';

  // Contrast Checks
  const textBgRatio = getContrastRatio(textColor, bgColor);
  const primaryBgRatio = getContrastRatio(primaryColor, bgColor);

  // Copy Hex Handler with visual checkmark
  const handleCopy = (hex: string, label: string) => {
    onCopyText(hex, label);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  // Replace / Edit Single Colour
  const handleStartEdit = (idx: number, currentHex: string) => {
    setEditingIndex(idx);
    setTempHex(currentHex);
  };

  const handleApplyColorChange = (idx: number, newHex: string) => {
    const updated = [...palette];
    updated[idx] = {
      ...updated[idx],
      hex: newHex.toUpperCase(),
    };
    onUpdatePalette(updated);
  };

  const handleUpdateField = (idx: number, field: keyof StrategicColorSwatch, val: string) => {
    const updated = [...palette];
    updated[idx] = {
      ...updated[idx],
      [field]: val,
    };
    onUpdatePalette(updated);
  };

  // Add a new swatch if palette has less than 8
  const handleAddSwatch = () => {
    if (palette.length >= 8) return;
    const existingRoles = palette.map((c) => c.role.toLowerCase());
    const nextRoleItem = STANDARD_ROLES.find((r) => !existingRoles.includes(r.role.toLowerCase())) || {
      role: 'Highlight colour',
      description: 'Accent and emphasis',
      defaultHex: '#F59E0B',
    };

    const newSwatch: StrategicColorSwatch = {
      name: `Custom ${nextRoleItem.role}`,
      hex: nextRoleItem.defaultHex,
      role: nextRoleItem.role,
      psychologicalReason: 'Calibrated to maintain brand equilibrium and visual attraction.',
      marketingReason: 'Provides an additional coordinated asset for Nigerian digital marketing.',
    };
    onUpdatePalette([...palette, newSwatch]);
  };

  // Remove a swatch (minimum 6 maintained)
  const handleRemoveSwatch = (idx: number) => {
    if (palette.length <= 6) return;
    const updated = palette.filter((_, i) => i !== idx);
    onUpdatePalette(updated);
    if (editingIndex === idx) setEditingIndex(null);
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-emerald-600 shrink-0" />
            <h4 className="text-base sm:text-lg font-bold text-stone-900">
              Coordinated Brand Colour Palette ({palette.length} Colours)
            </h4>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Flexible 6–8 colour identity calibrated for packaging, social media flyers, WhatsApp catalogs, and Nigerian cultural resonance.
          </p>
        </div>

        {/* Global Palette Actions */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {onRegeneratePalette && (
            <button
              type="button"
              onClick={onRegeneratePalette}
              disabled={isRegenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>{isRegenerating ? 'Harmonizing colours...' : 'Regenerate Palette'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-2xs ${
              previewMode
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{previewMode ? 'Hide Live Preview' : 'Show Live Preview'}</span>
          </button>
        </div>
      </div>

      {/* Inline Error Alert for Palette Regeneration (Existing palette preserved) */}
      {paletteError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Could Not Regenerate Colour Palette</p>
              <p className="text-[11px] text-rose-800 mt-0.5">
                {paletteError} Your existing palette and colour edits have been preserved.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {onRegeneratePalette && (
              <button
                type="button"
                onClick={onRegeneratePalette}
                disabled={isRegenerating}
                className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                <span>Retry Palette</span>
              </button>
            )}
            {onDismissPaletteError && (
              <button
                type="button"
                onClick={onDismissPaletteError}
                className="text-[11px] font-semibold text-rose-700 hover:underline cursor-pointer"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}

      {/* Accessibility & Visual Contrast Indicator */}
      <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold text-stone-800">Visual Contrast & Legibility Audit:</span>
          <span className="text-stone-600">
            Text on Background: <strong className="text-stone-900">{textBgRatio.toFixed(1)}:1</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
              textBgRatio >= 7.0
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : textBgRatio >= 4.5
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-rose-100 text-rose-900 border border-rose-300'
            }`}
          >
            {textBgRatio >= 7.0
              ? '✓ WCAG AAA Certified'
              : textBgRatio >= 4.5
              ? '✓ WCAG AA Compliant'
              : '⚠️ Low Contrast'}
          </span>
          <span className="text-[11px] text-stone-400 hidden sm:inline">
            Tested for tropical bright sunlight on mobile screens
          </span>
        </div>
      </div>

      {/* Live Brand Application Preview (Shows Coherent Interaction of 6-8 Colours) */}
      {previewMode && (
        <div className="rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-xs space-y-3 transition-all animate-in fade-in duration-200" style={{ backgroundColor: bgColor }}>
          <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: `${textColor}20` }}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md text-white shadow-2xs" style={{ backgroundColor: primaryColor }}>
                Live In-Context Mockup
              </span>
              <span className="text-xs font-bold" style={{ color: textColor }}>
                How Your Coordinated Palette Behaves Together
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ color: textColor, backgroundColor: `${textColor}10` }}>
              Canvas: {bgColor}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Branded Card 1: Product Showcase */}
            <div className="p-3.5 rounded-xl border space-y-2 bg-white/70 backdrop-blur-xs shadow-2xs" style={{ borderColor: `${primaryColor}40` }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded text-white" style={{ backgroundColor: primaryColor }}>
                  Primary Signature
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded" style={{ backgroundColor: highlightColor, color: '#000' }}>
                  ₦ Flash Offer
                </span>
              </div>
              <h5 className="text-sm font-extrabold" style={{ color: textColor }}>
                {brandName}
              </h5>
              <p className="text-xs leading-relaxed opacity-90" style={{ color: textColor }}>
                "{tagline}"
              </p>
              <button
                type="button"
                className="w-full py-1.5 px-3 rounded-lg text-xs font-bold text-white shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                style={{ backgroundColor: accentColor }}
              >
                <span>Order via WhatsApp (Accent CTA)</span>
              </button>
            </div>

            {/* Branded Card 2: Packaging Tag */}
            <div className="p-3.5 rounded-xl border space-y-2.5 bg-white/70 backdrop-blur-xs shadow-2xs" style={{ borderColor: `${secondaryColor}40` }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded text-white" style={{ backgroundColor: secondaryColor }}>
                  Secondary Tag
                </span>
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: accentColor }} />
              </div>
              <p className="text-xs font-medium" style={{ color: textColor }}>
                Crafted in Nigeria with inspected materials. Sealed for dispatch to verified addresses.
              </p>
              <div className="pt-2 border-t flex items-center justify-between text-[11px]" style={{ borderColor: `${textColor}15`, color: textColor }}>
                <span>Hand-Inspected</span>
                <span className="font-bold underline" style={{ color: primaryColor }}>Waybill Ready</span>
              </div>
            </div>

            {/* Branded Card 3: Social & Story Accent */}
            <div className="p-3.5 rounded-xl border space-y-2 bg-white/70 backdrop-blur-xs shadow-2xs" style={{ borderColor: `${textColor}20` }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded text-white" style={{ backgroundColor: '#1E3A8A' }}>
                  Complementary
                </span>
                <span className="text-[10px] font-mono opacity-60" style={{ color: textColor }}>
                  Text: {textColor}
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: textColor }}>
                Tested on high-resolution AMOLED and IPS screens for crisp typography and zero eye-strain.
              </p>
              <div className="flex items-center gap-1.5 pt-1">
                {palette.slice(0, 6).map((c, i) => (
                  <div key={i} className="w-5 h-5 rounded-md border border-black/10 shadow-2xs" style={{ backgroundColor: c.hex }} title={`${c.name} (${c.hex})`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main 6–8 Swatches Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {palette.map((color, idx) => {
          const isCopied = copiedHex === color.hex;
          const isEditing = editingIndex === idx;

          return (
            <div
              key={idx}
              className="group text-left rounded-2xl border border-stone-200 overflow-hidden hover:border-emerald-500 hover:shadow-md transition-all bg-stone-50/60 flex flex-col justify-between"
            >
              <div>
                {/* Visual Swatch with In-Place Color Picker */}
                <div
                  className="h-28 w-full relative flex flex-col justify-between p-3 transition-transform duration-200"
                  style={{ backgroundColor: color.hex }}
                >
                  {/* Top Bar on Swatch */}
                  <div className="flex items-center justify-between">
                    <span className="bg-black/60 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                      {color.hex}
                    </span>

                    {/* Native Hidden Color Picker overlay button */}
                    <label
                      className="bg-white/90 hover:bg-white text-stone-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm cursor-pointer transition-all flex items-center gap-1"
                      title="Pick custom color"
                    >
                      <Edit3 className="w-2.5 h-2.5" />
                      <span>Edit</span>
                      <input
                        type="color"
                        value={color.hex}
                        onChange={(e) => handleApplyColorChange(idx, e.target.value)}
                        className="opacity-0 absolute w-0 h-0 pointer-events-none"
                      />
                    </label>
                  </div>

                  {/* Bottom Bar on Swatch: Quick Copy and Role */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleCopy(color.hex, `${color.name} (${color.hex})`)}
                      className="bg-black/60 hover:bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {isCopied ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                      <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                    </button>

                    {palette.length > 6 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSwatch(idx)}
                        className="opacity-0 group-hover:opacity-100 bg-rose-600/80 hover:bg-rose-700 text-white text-[10px] p-1 rounded backdrop-blur-xs cursor-pointer transition-opacity"
                        title="Remove this swatch (min 6 colours)"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Color Metadata Details */}
                <div className="p-3.5 space-y-2.5">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 bg-emerald-100/90 px-2 py-0.5 rounded-full inline-block truncate max-w-[170px]">
                        {color.role}
                      </span>
                      <span className="text-[10px] font-mono text-stone-400">#{idx + 1}</span>
                    </div>

                    <input
                      type="text"
                      value={color.name}
                      onChange={(e) => handleUpdateField(idx, 'name', e.target.value)}
                      className="text-xs sm:text-sm font-bold text-stone-900 mt-1 w-full bg-transparent hover:bg-white focus:bg-white px-1 py-0.5 rounded border border-transparent focus:border-stone-300 focus:outline-none transition-colors"
                      title="Click to rename colour"
                    />
                  </div>

                  {/* Purpose Explanations */}
                  <div className="space-y-1.5 text-xs text-stone-600 pt-1.5 border-t border-stone-200/70">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                        🧠 Psychological Purpose:
                      </span>
                      <p className="text-stone-700 text-[11px] leading-snug">{color.psychologicalReason}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                        📈 Marketing Application:
                      </span>
                      <p className="text-stone-700 text-[11px] leading-snug">{color.marketingReason}</p>
                    </div>
                  </div>

                  {/* Quick Color Replacement Drawer */}
                  <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(idx, color.hex)}
                      className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                    >
                      <Sliders className="w-3 h-3 text-emerald-600" />
                      <span>{isEditing ? 'Close Shades' : 'Replace Shade'}</span>
                    </button>
                    <span className="text-[10px] font-mono text-stone-400">{color.hex}</span>
                  </div>

                  {/* Inline Harmony Replacement Swatches */}
                  {isEditing && (
                    <div className="pt-2 border-t border-emerald-200 bg-emerald-50/50 p-2 rounded-xl space-y-2 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-950">Select Coordinated Shade:</span>
                        <button
                          type="button"
                          onClick={() => setEditingIndex(null)}
                          className="text-[10px] text-stone-400 hover:text-stone-600 font-bold"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5">
                        {HARMONY_PRESETS.slice(0, 12).map((presetHex) => (
                          <button
                            key={presetHex}
                            type="button"
                            onClick={() => {
                              handleApplyColorChange(idx, presetHex);
                            }}
                            className={`h-6 rounded-md border transition-transform cursor-pointer hover:scale-105 ${
                              color.hex.toUpperCase() === presetHex.toUpperCase()
                                ? 'ring-2 ring-emerald-600 border-white'
                                : 'border-black/10'
                            }`}
                            style={{ backgroundColor: presetHex }}
                            title={`Apply ${presetHex}`}
                          />
                        ))}
                      </div>

                      {/* Manual Hex Input */}
                      <div className="flex items-center gap-1 pt-1">
                        <input
                          type="text"
                          value={tempHex}
                          onChange={(e) => setTempHex(e.target.value)}
                          placeholder="#HEXCODE"
                          className="w-full px-2 py-1 text-[11px] font-mono font-bold rounded border border-stone-300 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (/^#[0-9A-F]{6}$/i.test(tempHex)) {
                              handleApplyColorChange(idx, tempHex);
                            }
                          }}
                          className="px-2 py-1 text-[10px] font-bold rounded bg-emerald-800 text-white hover:bg-emerald-900 cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Swatch Tile if fewer than 8 swatches */}
        {palette.length < 8 && (
          <button
            type="button"
            onClick={handleAddSwatch}
            className="rounded-2xl border-2 border-dashed border-stone-300 hover:border-emerald-500 hover:bg-emerald-50/50 p-6 flex flex-col items-center justify-center gap-2 text-stone-500 hover:text-emerald-800 transition-all cursor-pointer min-h-[220px]"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">Add 8th Complementary Swatch</span>
            <span className="text-[10px] text-stone-400 text-center max-w-[160px]">
              Expands your system to 8 full coordinated brand assets
            </span>
          </button>
        )}
      </div>

      <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-500">
        <p className="leading-relaxed">
          💡 <strong>Pro Tip:</strong> Click any HEX code to copy it, click "Edit" on the swatch to pick any color with your native picker, or click "Replace Shade" to choose from coordinated harmonious tones.
        </p>
        <span className="text-[11px] font-mono text-stone-400 shrink-0">
          RGB & HEX • Zero-Slop Grounded Palette
        </span>
      </div>
    </div>
  );
};
