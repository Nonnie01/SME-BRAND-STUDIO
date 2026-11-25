import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Sparkles, X, ShieldCheck, Wand2, Eye } from 'lucide-react';

interface PhotoStudioProps {
  imagePreview: string | null;
  onImageChange: (base64: string | null, file?: File) => void;
  selectedBadge: string;
  onBadgeChange: (badge: string) => void;
  backdropTheme: string;
  onBackdropChange: (theme: string) => void;
  isAnalyzingImage?: boolean;
  recognitionConfirmed?: boolean;
}

export const BACKDROPS = [
  { id: 'natural', name: 'Original Photo', class: 'bg-stone-100' },
  { id: 'terracotta', name: 'Warm Terracotta', class: 'bg-gradient-to-br from-amber-700/80 via-orange-800 to-stone-900' },
  { id: 'lagos-emerald', name: 'Lagos Emerald', class: 'bg-gradient-to-br from-emerald-900 via-teal-950 to-stone-950' },
  { id: 'botanical', name: 'Tropical Botanical', class: 'bg-gradient-to-br from-emerald-800/80 via-stone-900 to-amber-900/60' },
  { id: 'luxury-cream', name: 'Ivory Studio', class: 'bg-gradient-to-br from-stone-50 via-amber-50 to-stone-200' },
  { id: 'midnight', name: 'Luxe Onyx Black', class: 'bg-gradient-to-br from-stone-900 via-neutral-900 to-black' },
];

export const BADGES = [
  { id: 'naija-made', label: '🇳🇬 100% Made in Nigeria' },
  { id: 'organic', label: '🌿 Pure Organic Quality' },
  { id: 'handcrafted', label: '🧵 Master Artisan Handcrafted' },
  { id: 'lagos-verified', label: '✨ Verified Lagos SME' },
  { id: 'no-counterfeit', label: '💯 Original No-Counterfeit' },
  { id: 'none', label: '🚫 No Badge' },
];

export const PhotoStudio: React.FC<PhotoStudioProps> = ({
  imagePreview,
  onImageChange,
  selectedBadge,
  onBadgeChange,
  backdropTheme,
  onBackdropChange,
  isAnalyzingImage = false,
  recognitionConfirmed = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onImageChange(reader.result as string, file);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const currentBackdrop = BACKDROPS.find((b) => b.id === backdropTheme) || BACKDROPS[0];
  const currentBadge = BADGES.find((b) => b.id === selectedBadge && b.id !== 'none');

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-emerald-600" />
            1. Product Photo & Studio Stager
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Upload your ordinary mobile photo to inspect textures and test studio staging
          </p>
        </div>

        {imagePreview && (
          <button
            type="button"
            onClick={() => onImageChange(null)}
            className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> Remove Photo
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {!imagePreview ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/50'
              : 'border-stone-300 hover:border-emerald-400 hover:bg-stone-50/60'
          }`}
        >
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
            <Upload className="w-7 h-7" />
          </div>
          <p className="font-semibold text-stone-800 text-sm sm:text-base">
            Click to upload or drag & drop product photo
          </p>
          <p className="text-xs text-stone-500 mt-1">
            Fashion clothes, skincare jars, food packs, drink bottles, handmade bags, crafts (PNG, JPG, WebP)
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            AI will analyze colors, textures & packaging appeal
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Main Studio Viewport */}
          <div
            className={`lg:col-span-5 relative rounded-xl overflow-hidden aspect-[4/3] max-h-72 flex items-center justify-center p-5 transition-all duration-300 ${currentBackdrop.class}`}
          >
            {/* Soft Studio Vignette */}
            <div className="absolute inset-0 pointer-events-none bg-radial from-transparent via-transparent to-black/25"></div>

            {/* Product Image Frame */}
            <div className="relative max-h-full max-w-full flex items-center justify-center group">
              <img
                src={imagePreview}
                alt="Product Preview"
                className="max-h-56 sm:max-h-60 w-auto object-contain rounded-lg shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
              />

              {/* Active Scanner Line Animation when Analyzing */}
              {isAnalyzingImage && (
                <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none border border-emerald-400/60 bg-emerald-950/20 backdrop-blur-[1px]">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-400 animate-pulse absolute top-1/2 -translate-y-1/2"></div>
                  <div className="absolute top-2 left-2 bg-emerald-900/90 text-emerald-200 text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-300 animate-spin" />
                    Scanning Product Taxonomy...
                  </div>
                </div>
              )}

              {/* Watermark / Quality Badge */}
              {currentBadge && !isAnalyzingImage && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-stone-900/90 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg border border-amber-400/40 backdrop-blur-md flex items-center gap-1.5 whitespace-nowrap">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  {currentBadge.label}
                </div>
              )}
            </div>

            {/* Change Photo Overlay Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute top-3 right-3 bg-white/90 hover:bg-white text-stone-800 text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm border border-stone-200 transition-colors cursor-pointer flex items-center gap-1.5 backdrop-blur-xs"
            >
              <Wand2 className="w-3.5 h-3.5 text-emerald-600" />
              Change Photo
            </button>
          </div>

          {/* Interactive Studio Controls */}
          <div className="lg:col-span-7 space-y-4">
            {/* Backdrop Moods */}
            <div>
              <label className="text-xs font-semibold text-stone-600 mb-1.5 block">
                Studio Backdrop Mood
              </label>
              <div className="flex flex-wrap gap-1.5">
                {BACKDROPS.map((bd) => (
                  <button
                    key={bd.id}
                    type="button"
                    onClick={() => onBackdropChange(bd.id)}
                    className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                      backdropTheme === bd.id
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {bd.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Stamp / Trust Badge */}
            <div>
              <label className="text-xs font-semibold text-stone-600 mb-1.5 block">
                Product Trust Badge Stamp
              </label>
              <div className="flex flex-wrap gap-1.5">
                {BADGES.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onBadgeChange(b.id)}
                    className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                      selectedBadge === b.id
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
