import { FlyerAspectRatio } from '../types';

export interface FlyerOptions {
  brandName: string;
  tagline: string;
  productName: string;
  price: string;
  contactInfo?: string;
  primaryColor: string;
  accentColor: string;
  badgeText?: string;
  callToAction?: string;
  aspectRatio?: FlyerAspectRatio;
  imageElement?: HTMLImageElement | null;
  secondaryImageElement?: HTMLImageElement | null;
  secondaryLabel?: string;
  secondaryPrice?: string;
  isIllustrativeVisual?: boolean;
}

export function triggerDataUrlDownload(dataUrl: string, fileName: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Loads an image URL (data URI, local /samples/ path, or CORS-enabled HTTP URL)
 * into an HTMLImageElement ready for canvas drawing.
 */
export async function loadCanvasImage(src: string): Promise<HTMLImageElement | null> {
  if (!src) return null;
  return new Promise((resolve) => {
    const img = new Image();
    if (!src.startsWith('data:') && !src.startsWith('/')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines = 2
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = words[0];

  for (let i = 1; i < words.length; i++) {
    const candidate = `${current} ${words[i]}`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = words[i];
      if (lines.length >= maxLines - 1) break;
    }
  }
  lines.push(current);

  if (lines.length > maxLines) {
    return lines.slice(0, maxLines);
  }
  return lines;
}

function drawRoundedImageContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number,
  radius: number,
  frameFill = '#0F172A'
) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 14;

  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, radius);
  ctx.fillStyle = frameFill;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, radius);
  ctx.clip();

  // Subtle soft inner backing
  ctx.fillStyle = frameFill;
  ctx.fillRect(boxX, boxY, boxW, boxH);

  const iw = img.naturalWidth || boxW;
  const ih = img.naturalHeight || boxH;
  const scale = Math.min(boxW / iw, boxH / ih);
  const drawW = iw * scale;
  const drawH = ih * scale;
  const drawX = boxX + (boxW - drawW) / 2;
  const drawY = boxY + (boxH - drawH) / 2;
  ctx.drawImage(img, drawX, drawY, drawW, drawH);

  // Clean border highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 3;
  ctx.strokeRect(boxX + 1.5, boxY + 1.5, boxW - 3, boxH - 3);
  ctx.restore();
}

/**
 * Renders a crisp promotional flyer (1:1 Instagram/WhatsApp, 9:16 Status/Story, or 16:9 Facebook Landscape)
 * preserving 100% visual accuracy of the verified/enhanced product or service photograph without inventing claims.
 */
export async function generateAndDownloadFlyer(
  canvas: HTMLCanvasElement,
  options: FlyerOptions,
  fileName = 'sme-brand-promo.png',
  skipDownload = false
): Promise<string> {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not initialize 2D canvas context for flyer export.');
  }

  const ratio: FlyerAspectRatio = options.aspectRatio || '1:1';
  const width = ratio === '16:9' ? 1280 : 1080;
  const height = ratio === '9:16' ? 1920 : ratio === '16:9' ? 720 : 1080;

  canvas.width = width;
  canvas.height = height;

  const primary = options.primaryColor || '#0D5C3A';
  const accent = options.accentColor || '#D97706';

  // Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0F172A');
  bgGrad.addColorStop(0.45, primary);
  bgGrad.addColorStop(1, '#090D16');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle decorative circles
  ctx.save();
  ctx.beginPath();
  ctx.arc(width * 0.88, height * 0.12, width * 0.25, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(width * 0.12, height * 0.88, width * 0.28, 0, Math.PI * 2);
  ctx.fillStyle = `${accent}18`;
  ctx.fill();
  ctx.restore();

  const hasDualImages =
    !!options.imageElement &&
    options.imageElement.naturalWidth > 0 &&
    !!options.secondaryImageElement &&
    options.secondaryImageElement.naturalWidth > 0;

  if (ratio === '16:9') {
    // LANDSCAPE FACEBOOK / WEB LAYOUT (1280 x 720)
    const padX = 56;
    const photoAreaW = hasDualImages ? 600 : 500;
    const photoAreaH = 520;
    const photoX = width - padX - photoAreaW;
    const photoY = (height - photoAreaH) / 2;

    // Left Column Text
    ctx.save();
    ctx.textAlign = 'left';
    const textMaxW = width - photoAreaW - padX * 2 - 36;

    // Badge above headline if provided
    let cursorY = 120;
    if (options.badgeText && options.badgeText.trim()) {
      ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
      const badgeW = Math.min(textMaxW, ctx.measureText(options.badgeText.toUpperCase()).width + 38);
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.roundRect(padX, cursorY - 28, badgeW, 38, 19);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(options.badgeText.toUpperCase(), padX + 19, cursorY - 3);
      cursorY += 58;
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 46px "Plus Jakarta Sans", sans-serif';
    const brandLines = wrapCanvasText(ctx, options.brandName.toUpperCase(), textMaxW, 2);
    brandLines.forEach((line) => {
      ctx.fillText(line, padX, cursorY);
      cursorY += 54;
    });

    if (options.tagline && options.tagline.trim()) {
      ctx.fillStyle = '#E2E8F0';
      ctx.font = '22px "Plus Jakarta Sans", sans-serif';
      const tagLines = wrapCanvasText(ctx, options.tagline, textMaxW, 2);
      tagLines.forEach((line) => {
        ctx.fillText(line, padX, cursorY);
        cursorY += 30;
      });
      cursorY += 16;
    }

    // Product / Offer Name
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
    const prodLines = wrapCanvasText(ctx, options.productName, textMaxW, 2);
    prodLines.forEach((line) => {
      ctx.fillText(line, padX, cursorY);
      cursorY += 38;
    });

    if (options.secondaryLabel && options.secondaryLabel.trim()) {
      ctx.fillStyle = '#CBD5E1';
      ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
      const secLines = wrapCanvasText(ctx, `+ ${options.secondaryLabel}`, textMaxW, 2);
      secLines.forEach((line) => {
        ctx.fillText(line, padX, cursorY);
        cursorY += 30;
      });
    }

    if (options.price && options.price.trim()) {
      cursorY += 12;
      ctx.fillStyle = accent;
      ctx.font = '800 44px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(options.price.trim(), padX, cursorY);
      cursorY += 48;
    }

    if (options.callToAction && options.callToAction.trim()) {
      cursorY = Math.max(cursorY + 12, height - 150);
      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      const btnW = Math.min(textMaxW, Math.max(260, ctx.measureText(options.callToAction).width + 64));
      ctx.fillStyle = '#16A34A';
      ctx.beginPath();
      ctx.roundRect(padX, cursorY, btnW, 56, 28);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(options.callToAction.trim(), padX + 32, cursorY + 36);
    }

    if (options.contactInfo && options.contactInfo.trim()) {
      ctx.fillStyle = '#CBD5E1';
      ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(options.contactInfo.trim(), padX, height - 42);
    }

    if (options.isIllustrativeVisual) {
      ctx.fillStyle = 'rgba(226, 232, 240, 0.78)';
      ctx.font = '15px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(
        'Illustrative Service Visual (Not Actual Business Photo)',
        width - padX,
        height - 28
      );
    }
    ctx.restore();

    // Right Column Photos
    if (hasDualImages && options.imageElement && options.secondaryImageElement) {
      const gap = 18;
      const singleW = (photoAreaW - gap) / 2;
      drawRoundedImageContain(ctx, options.imageElement, photoX, photoY + 40, singleW, 440, 22, '#0B1220');
      drawRoundedImageContain(
        ctx,
        options.secondaryImageElement,
        photoX + singleW + gap,
        photoY + 40,
        singleW,
        440,
        22,
        '#0B1220'
      );
    } else if (options.imageElement && options.imageElement.naturalWidth > 0) {
      drawRoundedImageContain(ctx, options.imageElement, photoX, photoY, photoAreaW, photoAreaH, 26, '#0B1220');
    }
  } else {
    // VERTICAL / SQUARE LAYOUTS (1:1 1080x1080 or 9:16 1080x1920)
    const isStory = ratio === '9:16';
    const topStart = isStory ? 160 : 88;
    const photoAreaH = isStory ? 760 : 510;
    const photoAreaW = hasDualImages ? 920 : isStory ? 840 : 540;
    const photoY = isStory ? 350 : 178;

    // Header
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${isStory ? 54 : 44}px "Plus Jakarta Sans", sans-serif`;
    const brandLines = wrapCanvasText(ctx, options.brandName.toUpperCase(), width - 110, 2);
    let headerY = topStart;
    brandLines.forEach((line) => {
      ctx.fillText(line, width / 2, headerY);
      headerY += isStory ? 62 : 48;
    });

    if (options.tagline && options.tagline.trim()) {
      ctx.fillStyle = '#CBD5E1';
      ctx.font = `${isStory ? 26 : 22}px "Plus Jakarta Sans", sans-serif`;
      const tagLines = wrapCanvasText(ctx, options.tagline, width - 130, 2);
      tagLines.forEach((line) => {
        ctx.fillText(line, width / 2, headerY);
        headerY += 32;
      });
    }
    ctx.restore();

    // Photo Box(es)
    const effectivePhotoY = Math.max(photoY, headerY + 20);
    if (hasDualImages && options.imageElement && options.secondaryImageElement) {
      const gap = 24;
      const singleW = (photoAreaW - gap) / 2;
      const startX = (width - photoAreaW) / 2;
      drawRoundedImageContain(ctx, options.imageElement, startX, effectivePhotoY, singleW, photoAreaH, 26, '#0B1220');
      drawRoundedImageContain(
        ctx,
        options.secondaryImageElement,
        startX + singleW + gap,
        effectivePhotoY,
        singleW,
        photoAreaH,
        26,
        '#0B1220'
      );
    } else if (options.imageElement && options.imageElement.naturalWidth > 0) {
      const photoX = (width - photoAreaW) / 2;
      drawRoundedImageContain(ctx, options.imageElement, photoX, effectivePhotoY, photoAreaW, photoAreaH, 28, '#0B1220');
    }

    // Optional User Badge
    let afterPhotoY = effectivePhotoY + photoAreaH + (isStory ? 64 : 46);
    if (options.badgeText && options.badgeText.trim()) {
      ctx.save();
      ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
      const badgeLabel = options.badgeText.trim().toUpperCase();
      const badgeW = Math.min(width - 140, Math.max(240, ctx.measureText(badgeLabel).width + 52));
      const badgeH = 46;
      const badgeX = (width - badgeW) / 2;
      const badgeY = effectivePhotoY + photoAreaH - 23;

      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 23);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText(badgeLabel, width / 2, badgeY + 30);
      ctx.restore();
      afterPhotoY += 20;
    }

    // Offer Details (strictly user/verified facts, zero invented claims)
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${isStory ? 46 : 38}px "Plus Jakarta Sans", sans-serif`;
    const prodLines = wrapCanvasText(ctx, options.productName, width - 120, 2);
    prodLines.forEach((line) => {
      ctx.fillText(line, width / 2, afterPhotoY);
      afterPhotoY += isStory ? 54 : 44;
    });

    if (options.secondaryLabel && options.secondaryLabel.trim()) {
      ctx.fillStyle = '#E2E8F0';
      ctx.font = `600 ${isStory ? 30 : 24}px "Plus Jakarta Sans", sans-serif`;
      const secLines = wrapCanvasText(ctx, `+ ${options.secondaryLabel}`, width - 140, 2);
      secLines.forEach((line) => {
        ctx.fillText(line, width / 2, afterPhotoY);
        afterPhotoY += isStory ? 38 : 30;
      });
    }

    if (options.price && options.price.trim()) {
      afterPhotoY += 8;
      ctx.fillStyle = accent;
      ctx.font = `800 ${isStory ? 60 : 48}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText(options.price.trim(), width / 2, afterPhotoY);
      afterPhotoY += isStory ? 68 : 54;
    } else {
      afterPhotoY += 12;
    }

    if (options.callToAction && options.callToAction.trim()) {
      const btnW = Math.min(width - 160, isStory ? 560 : 460);
      const btnH = isStory ? 84 : 68;
      const btnX = (width - btnW) / 2;
      const btnY = Math.min(height - (isStory ? 220 : 120), afterPhotoY);

      ctx.fillStyle = '#16A34A';
      ctx.beginPath();
      ctx.roundRect(btnX, btnY, btnW, btnH, btnH / 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${isStory ? 30 : 25}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText(options.callToAction.trim(), width / 2, btnY + btnH * 0.64);
      afterPhotoY = btnY + btnH + 36;
    }

    if (options.contactInfo && options.contactInfo.trim()) {
      ctx.fillStyle = '#CBD5E1';
      ctx.font = `600 ${isStory ? 24 : 19}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText(
        options.contactInfo.trim(),
        width / 2,
        Math.min(height - (options.isIllustrativeVisual ? 58 : 34), afterPhotoY)
      );
    }

    if (options.isIllustrativeVisual) {
      ctx.fillStyle = 'rgba(226, 232, 240, 0.78)';
      ctx.font = '16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(
        'Illustrative Service Visual (Not Actual Business Photo)',
        width / 2,
        height - 22
      );
    }
    ctx.restore();
  }

  const dataUrl = canvas.toDataURL('image/png');
  if (!skipDownload) {
    triggerDataUrlDownload(dataUrl, fileName);
  }
  return dataUrl;
}
