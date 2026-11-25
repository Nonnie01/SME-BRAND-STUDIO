import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { BrandStudioResult, StrategicColorSwatch } from '../types';

export interface GeneratedPromoImage {
  fileName: string;
  dataUrl: string;
}

export interface BrandExportContext {
  productName?: string;
  serviceName?: string;
}

let fontCachePromise: Promise<{ regular: string; bold: string }> | null = null;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

async function loadUnicodeFonts(): Promise<{ regular: string; bold: string }> {
  if (!fontCachePromise) {
    fontCachePromise = (async () => {
      const [regResp, boldResp] = await Promise.all([
        fetch('/fonts/DejaVuSans.ttf'),
        fetch('/fonts/DejaVuSans-Bold.ttf'),
      ]);

      if (!regResp.ok || !boldResp.ok) {
        throw new Error('Could not load Unicode PDF fonts for Naira symbol support.');
      }

      const [regBuf, boldBuf] = await Promise.all([
        regResp.arrayBuffer(),
        boldResp.arrayBuffer(),
      ]);

      return {
        regular: arrayBufferToBase64(regBuf),
        bold: arrayBufferToBase64(boldBuf),
      };
    })().catch((err) => {
      fontCachePromise = null;
      throw err;
    });
  }
  return fontCachePromise;
}

/**
 * Removes unsupported pictograph/emoji characters while strictly preserving
 * standard text, punctuation, accents, bullets, arrows, and the Naira symbol (₦).
 */
export function sanitizePdfText(input: string | undefined | null): string {
  if (!input) return '';
  return input
    // Remove emoji pictographs, regional indicator flags, variation selectors, ZWJ, keycap combining
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}]/gu, '')
    // Normalize any curly spaces / multiple spaces on a line (preserving newlines)
    .replace(/[^\S\r\n]+/g, ' ')
    .replace(/^ +| +$/gm, '')
    .trim();
}

export function sanitizeFolderName(name: string): string {
  const cleaned = (name || 'SME Brand')
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || 'SME Brand';
}

export function sanitizeSlug(name: string): string {
  const slug = (name || 'sme-brand')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'sme-brand';
}

function hexToRgb(hex: string | undefined): [number, number, number] {
  const clean = (hex || '').replace('#', '').trim();
  if (/^[0-9a-fA-F]{6}$/.test(clean)) {
    return [
      parseInt(clean.slice(0, 2), 16),
      parseInt(clean.slice(2, 4), 16),
      parseInt(clean.slice(4, 6), 16),
    ];
  }
  if (/^[0-9a-fA-F]{3}$/.test(clean)) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ];
  }
  return [6, 78, 59]; // Deep emerald default
}

function getLuminance([r, g, b]: [number, number, number]): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function triggerBlobDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * Builds a professionally formatted multi-page PDF containing the generated Brand Guide.
 * Uses DejaVuSans Unicode TTF so the Nigerian Naira symbol (₦) renders crisply.
 */
export async function generateBrandGuidePdf(
  result: BrandStudioResult,
  context: BrandExportContext = {}
): Promise<{ blob: Blob; fileName: string }> {
  if (!result || !result.brandIdentity) {
    throw new Error('No brand guide data is available to export.');
  }

  const fonts = await loadUnicodeFonts();

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  doc.addFileToVFS('DejaVuSans.ttf', fonts.regular);
  doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');
  doc.addFileToVFS('DejaVuSans-Bold.ttf', fonts.bold);
  doc.addFont('DejaVuSans-Bold.ttf', 'DejaVuSans', 'bold');

  const PAGE_W = 210;
  const PAGE_H = 297;
  const MARGIN_X = 16;
  const CONTENT_W = PAGE_W - MARGIN_X * 2;
  const TOP_Y = 22;
  const BOTTOM_Y = 276;

  const { brandIdentity, brandNames, marketingCaptions, advertisingConcepts, visualAnalysis, serviceStrategy, hybridMarketingKit } =
    result;
  const { positioning, marketStrategy, qualityAudit, typographyRecommendation, idealCustomerPersona, colorPalette } =
    brandIdentity;

  const brandName = sanitizePdfText(brandIdentity.selectedName) || 'SME Brand';
  const tagline = sanitizePdfText(brandIdentity.selectedTagline);
  const businessTypeLabel =
    result.businessType === 'hybrid'
      ? 'Hybrid Business (Products + Services)'
      : result.businessType === 'service'
      ? 'Service-Based Business'
      : 'Product-Based Business';

  const primarySwatch = colorPalette?.[0];
  const primaryRgb = hexToRgb(primarySwatch?.hex);
  const headerBgRgb: [number, number, number] =
    getLuminance(primaryRgb) < 0.45 ? primaryRgb : [6, 78, 59];
  const accentSwatch = colorPalette?.[2] || colorPalette?.[1];
  const accentRgb = hexToRgb(accentSwatch?.hex || '#D97706');

  let y = TOP_Y;

  const drawRunningHeader = () => {
    doc.setFont('DejaVuSans', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(120, 113, 108);
    doc.text(`${brandName} — Brand Strategy Guide`, MARGIN_X, 12);
    doc.setFont('DejaVuSans', 'normal');
    doc.text(businessTypeLabel, PAGE_W - MARGIN_X, 12, { align: 'right' });
    doc.setDrawColor(231, 229, 228);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_X, 15, PAGE_W - MARGIN_X, 15);
  };

  const addNewPage = () => {
    doc.addPage();
    drawRunningHeader();
    y = TOP_Y;
  };

  const ensureSpace = (neededMm: number) => {
    if (y + neededMm > BOTTOM_Y) {
      addNewPage();
    }
  };

  const drawWrappedText = (
    rawText: string,
    x: number,
    maxWidth: number,
    fontSize = 9.5,
    fontStyle: 'normal' | 'bold' = 'normal',
    color: [number, number, number] = [41, 37, 36],
    lineHeightMm = 4.6
  ) => {
    const clean = sanitizePdfText(rawText);
    if (!clean) return;
    doc.setFont('DejaVuSans', fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);

    const paragraphs = clean.split('\n');
    for (const para of paragraphs) {
      if (!para.trim()) {
        y += lineHeightMm * 0.5;
        continue;
      }
      const lines: string[] = doc.splitTextToSize(para, maxWidth);
      for (const line of lines) {
        if (y + lineHeightMm > BOTTOM_Y) {
          addNewPage();
          doc.setFont('DejaVuSans', fontStyle);
          doc.setFontSize(fontSize);
          doc.setTextColor(...color);
        }
        doc.text(line, x, y);
        y += lineHeightMm;
      }
    }
  };

  const drawSectionHeading = (title: string, subtitle?: string) => {
    ensureSpace(subtitle ? 18 : 13);
    y += 2;
    doc.setFillColor(...headerBgRgb);
    doc.roundedRect(MARGIN_X, y - 4, 2.5, 6.5, 1, 1, 'F');

    doc.setFont('DejaVuSans', 'bold');
    doc.setFontSize(12.5);
    doc.setTextColor(28, 25, 23);
    doc.text(sanitizePdfText(title), MARGIN_X + 5.5, y + 1);
    y += 5;

    if (subtitle) {
      doc.setFont('DejaVuSans', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(120, 113, 108);
      doc.text(sanitizePdfText(subtitle), MARGIN_X + 5.5, y + 0.5);
      y += 4;
    }

    doc.setDrawColor(231, 229, 228);
    doc.setLineWidth(0.35);
    doc.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
    y += 5;
  };

  const drawLabeledBlock = (label: string, value: string | undefined | null) => {
    const cleanVal = sanitizePdfText(value);
    if (!cleanVal) return;
    ensureSpace(12);
    doc.setFont('DejaVuSans', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...headerBgRgb);
    doc.text(sanitizePdfText(label).toUpperCase(), MARGIN_X, y);
    y += 4.3;
    drawWrappedText(cleanVal, MARGIN_X, CONTENT_W, 9.5, 'normal', [41, 37, 36], 4.6);
    y += 2.2;
  };

  const drawBulletSection = (label: string, items: string[] | undefined) => {
    if (!items || items.length === 0) return;
    ensureSpace(12);
    doc.setFont('DejaVuSans', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...headerBgRgb);
    doc.text(sanitizePdfText(label).toUpperCase(), MARGIN_X, y);
    y += 4.5;

    for (const item of items) {
      const clean = sanitizePdfText(item);
      if (!clean) continue;
      const lines: string[] = doc.splitTextToSize(clean, CONTENT_W - 6);
      ensureSpace(Math.min(lines.length * 4.5 + 1.5, 24));
      doc.setFont('DejaVuSans', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...headerBgRgb);
      doc.text('•', MARGIN_X + 1, y);

      doc.setFont('DejaVuSans', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(41, 37, 36);
      for (let i = 0; i < lines.length; i++) {
        if (i > 0 && y + 4.5 > BOTTOM_Y) {
          addNewPage();
          doc.setFont('DejaVuSans', 'normal');
          doc.setFontSize(9.5);
          doc.setTextColor(41, 37, 36);
        }
        doc.text(lines[i], MARGIN_X + 5.5, y);
        y += 4.5;
      }
      y += 1.2;
    }
    y += 2;
  };

  // =========================================================
  // COVER HEADER BANNER (Page 1)
  // =========================================================
  const titleLines = doc.splitTextToSize(brandName, CONTENT_W - 8);
  const taglineLines = tagline ? doc.splitTextToSize(`"${tagline}"`, CONTENT_W - 8) : [];
  const bannerHeight = 24 + titleLines.length * 8 + taglineLines.length * 5 + 10;

  doc.setFillColor(...headerBgRgb);
  doc.rect(0, 0, PAGE_W, bannerHeight, 'F');
  doc.setFillColor(...accentRgb);
  doc.rect(0, bannerHeight - 2, PAGE_W, 2, 'F');

  doc.setFont('DejaVuSans', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text('SME BRAND STUDIO — STRATEGIC BRAND GUIDE', MARGIN_X, 13);

  doc.setFont('DejaVuSans', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  let headerY = 23;
  for (const tLine of titleLines) {
    doc.text(tLine, MARGIN_X, headerY);
    headerY += 8;
  }

  if (taglineLines.length > 0) {
    doc.setFont('DejaVuSans', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(253, 230, 138);
    for (const tagLine of taglineLines) {
      doc.text(tagLine, MARGIN_X, headerY);
      headerY += 5;
    }
  }

  const offeringSummary = [
    businessTypeLabel,
    context.productName ? `Focus: ${sanitizePdfText(context.productName)}` : '',
    `Exported ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`,
  ]
    .filter(Boolean)
    .join('  |  ');

  doc.setFont('DejaVuSans', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(offeringSummary, MARGIN_X, bannerHeight - 5.5);

  y = bannerHeight + 10;

  // =========================================================
  // 1. EXECUTIVE SUMMARY & STRATEGIC AUDIT
  // =========================================================
  if (visualAnalysis || qualityAudit) {
    drawSectionHeading('1. Executive Summary & Strategist Audit', 'Grounded visual review, cohesion score & operational guardrails');
    if (visualAnalysis) {
      drawLabeledBlock('Brand Overview & Visual Assessment', visualAnalysis);
    }
    if (qualityAudit) {
      if (typeof qualityAudit.cohesionScore === 'number') {
        drawLabeledBlock(
          'Brand Cohesion Rating',
          `${qualityAudit.cohesionScore}% — ${sanitizePdfText(qualityAudit.consistencyReview)}`
        );
      } else if (qualityAudit.consistencyReview) {
        drawLabeledBlock('Consistency Review', qualityAudit.consistencyReview);
      }
      drawLabeledBlock('Visual & Photo Observations', qualityAudit.photoObservations);
      drawLabeledBlock('Merchant Brief Summary', qualityAudit.userSuppliedData);
      drawLabeledBlock('Packaging & Presentation Guidelines', qualityAudit.packagingAndDisplayAdvice);
      drawBulletSection('Critical Pitfalls to Avoid', qualityAudit.pitfallsToAvoid);
    }
  }

  // =========================================================
  // 2. BRAND NAMING & STRATEGIC RATIONALE
  // =========================================================
  if (brandNames && brandNames.length > 0) {
    drawSectionHeading('2. Brand Naming & Rationale', 'Recommended official identity and evaluated name options');
    if (brandIdentity.strongestNameRationale) {
      drawLabeledBlock('Primary Name Strategic Rationale', brandIdentity.strongestNameRationale);
    }

    for (let i = 0; i < brandNames.length; i++) {
      const opt = brandNames[i];
      const badge = opt.isRecommended ? ' [SELECTED OFFICIAL BRAND]' : '';
      const heading = `${i + 1}. ${sanitizePdfText(opt.name)}${badge}`;
      const details = [
        opt.tagline ? `Tagline: "${sanitizePdfText(opt.tagline)}"` : '',
        opt.targetVibe ? `Brand Vibe: ${sanitizePdfText(opt.targetVibe)}` : '',
        opt.meaning ? `Meaning & Context: ${sanitizePdfText(opt.meaning)}` : '',
        opt.recommendationRationale ? `Commercial Rationale: ${sanitizePdfText(opt.recommendationRationale)}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      ensureSpace(20);
      doc.setFont('DejaVuSans', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(opt.isRecommended ? headerBgRgb[0] : 28, opt.isRecommended ? headerBgRgb[1] : 25, opt.isRecommended ? headerBgRgb[2] : 23);
      doc.text(heading, MARGIN_X, y);
      y += 4.5;
      drawWrappedText(details, MARGIN_X + 3, CONTENT_W - 3, 9, 'normal', [68, 64, 60], 4.3);
      y += 2.5;
    }
  }

  // =========================================================
  // 3. STRATEGIC BRAND COLOUR PALETTE (Visual Swatches + HEX)
  // =========================================================
  if (colorPalette && colorPalette.length > 0) {
    drawSectionHeading('3. Brand Colour Palette & HEX System', 'Coordinated colour architecture with psychological & marketing rationale');

    const colGap = 6;
    const cardW = (CONTENT_W - colGap) / 2;

    for (let i = 0; i < colorPalette.length; i += 2) {
      const pair: StrategicColorSwatch[] = colorPalette.slice(i, i + 2);

      // Pre-measure tallest card in row so nothing overlaps or clips
      const measuredCards = pair.map((swatch) => {
        const textW = cardW - 8;
        const roleLines = doc.splitTextToSize(sanitizePdfText(swatch.role), textW);
        const psychLines = doc.splitTextToSize(`Psych: ${sanitizePdfText(swatch.psychologicalReason)}`, textW);
        const mktLines = doc.splitTextToSize(`Mktg: ${sanitizePdfText(swatch.marketingReason)}`, textW);
        const h = 19 + roleLines.length * 3.8 + psychLines.length * 3.8 + mktLines.length * 3.8 + 5;
        return { swatch, roleLines, psychLines, mktLines, h };
      });

      const rowH = Math.max(...measuredCards.map((c) => c.h));
      ensureSpace(rowH + 4);

      measuredCards.forEach((card, colIdx) => {
        const cardX = MARGIN_X + colIdx * (cardW + colGap);
        const cardY = y;
        const [r, g, b] = hexToRgb(card.swatch.hex);

        // Card container
        doc.setFillColor(250, 250, 249);
        doc.setDrawColor(231, 229, 228);
        doc.setLineWidth(0.3);
        doc.roundedRect(cardX, cardY, cardW, rowH, 2.5, 2.5, 'FD');

        // Colour swatch bar
        doc.setFillColor(r, g, b);
        doc.setDrawColor(214, 211, 209);
        doc.roundedRect(cardX + 3.5, cardY + 3.5, 11, 11, 1.5, 1.5, 'FD');

        // Name + HEX
        doc.setFont('DejaVuSans', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(28, 25, 23);
        const nameText = doc.splitTextToSize(sanitizePdfText(card.swatch.name), cardW - 20)[0] || '';
        doc.text(nameText, cardX + 17, cardY + 8);

        doc.setFont('DejaVuSans', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(87, 83, 78);
        doc.text((card.swatch.hex || '').toUpperCase(), cardX + 17, cardY + 13);

        // Role & Reasons
        let cy = cardY + 19;
        doc.setFont('DejaVuSans', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...headerBgRgb);
        for (const rl of card.roleLines) {
          doc.text(rl, cardX + 4, cy);
          cy += 3.8;
        }

        doc.setFont('DejaVuSans', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(68, 64, 60);
        for (const pl of card.psychLines) {
          doc.text(pl, cardX + 4, cy);
          cy += 3.8;
        }
        for (const ml of card.mktLines) {
          doc.text(ml, cardX + 4, cy);
          cy += 3.8;
        }
      });

      y += rowH + 4;
    }
    y += 2;
  }

  // =========================================================
  // 4. TYPOGRAPHY & IDEAL CUSTOMER PROFILE
  // =========================================================
  if (typographyRecommendation || idealCustomerPersona) {
    drawSectionHeading('4. Typography & Ideal Customer Profile');

    if (typographyRecommendation) {
      drawLabeledBlock(
        'Recommended Font Pairing',
        `Headline Font: ${sanitizePdfText(typographyRecommendation.headerFont)}  |  Body Font: ${sanitizePdfText(typographyRecommendation.bodyFont)}\n${sanitizePdfText(typographyRecommendation.styleNote)}`
      );
    }

    if (idealCustomerPersona) {
      drawLabeledBlock(
        'Primary Customer Persona',
        `${sanitizePdfText(idealCustomerPersona.name)} (${sanitizePdfText(idealCustomerPersona.ageRange)}, ${sanitizePdfText(idealCustomerPersona.location)})\nCore Pain Point: ${sanitizePdfText(idealCustomerPersona.painPoint)}\nWhy They Buy: ${sanitizePdfText(idealCustomerPersona.whyTheyBuy)}`
      );
    }
  }

  // =========================================================
  // 5. BRAND POSITIONING & VOICE
  // =========================================================
  if (positioning) {
    drawSectionHeading('5. Brand Positioning & Voice Architecture');
    drawLabeledBlock('Target Audience', positioning.targetAudience);
    drawLabeledBlock('Customer Needs & Purchasing Motivations', positioning.customerNeedsAndMotivations);
    drawLabeledBlock('Unique Selling Proposition (USP)', positioning.uniqueSellingProposition);
    drawLabeledBlock('Market Differentiation', positioning.marketDifferentiation);
    drawLabeledBlock('Brand Promise', positioning.brandPromise);

    if (positioning.brandPersonality?.length > 0) {
      drawBulletSection(
        'Brand Personality Traits',
        positioning.brandPersonality.map((p) => `${p.trait}: ${p.rationale}`)
      );
    }

    if (positioning.brandVoice) {
      drawLabeledBlock('Brand Voice Tone', positioning.brandVoice.tone);
      if (positioning.brandVoice.vocabulary?.length > 0) {
        drawLabeledBlock('Core Brand Vocabulary', positioning.brandVoice.vocabulary.join(', '));
      }
      drawBulletSection('Communication DOs', positioning.brandVoice.communicationDos);
      drawBulletSection('Communication DON\'Ts', positioning.brandVoice.communicationDonts);
    }
  }

  // =========================================================
  // 6. NIGERIAN MARKET STRATEGY & REGIONAL TACTICS
  // =========================================================
  if (marketStrategy) {
    drawSectionHeading('6. Market Relevance & Regional Strategy');
    drawLabeledBlock('Price Tier & Economic Analysis', marketStrategy.priceTierAnalysis);
    drawLabeledBlock('Sales Channel & Logistics Strategy', marketStrategy.channelStrategy);
    drawBulletSection('Buyer Trust-Building Tactics', marketStrategy.trustBuildingTactics);

    if (marketStrategy.locationSpecificTactics && marketStrategy.locationSpecificTactics.length > 0) {
      drawBulletSection(
        'Regional & State Execution Tactics',
        marketStrategy.locationSpecificTactics.map((loc) => `${loc.region}: ${loc.tactics}`)
      );
    }
  }

  // =========================================================
  // 7. SERVICE STRATEGY & PACKAGES (if applicable)
  // =========================================================
  if (serviceStrategy) {
    drawSectionHeading('7. Service Delivery, Packages & Booking Policy');
    drawLabeledBlock('Client Onboarding & Experience', serviceStrategy.clientOnboardingAndExperience);
    drawLabeledBlock('Trust & Deposit Policy', serviceStrategy.trustAndDepositPolicy || serviceStrategy.trustDepositPolicy);

    if (serviceStrategy.servicePackages?.length > 0) {
      for (const pkg of serviceStrategy.servicePackages) {
        const deliverables = Array.isArray(pkg.deliverables) ? pkg.deliverables.join('; ') : pkg.deliverables;
        drawLabeledBlock(
          `${pkg.tierName || pkg.name || 'Service Package'} (${pkg.recommendedPricing || pkg.pricingAdvice || 'Custom'})`,
          `Target Client: ${pkg.targetClient}\nDuration/Turnaround: ${pkg.turnaroundOrDuration || 'Standard'}\nDeliverables: ${deliverables}`
        );
      }
    }
    drawBulletSection('Client Retention & Referral Systems', serviceStrategy.retentionAndReferralTactics);
  }

  // =========================================================
  // 8. HYBRID SYNERGY & BUNDLE CAMPAIGNS (if applicable)
  // =========================================================
  if (hybridMarketingKit) {
    drawSectionHeading('8. Hybrid Product-Service Synergy & Cross-Selling');
    drawLabeledBlock('Unified Brand Tagline', hybridMarketingKit.unifiedTagline);
    drawLabeledBlock('Unified Elevator Pitch', hybridMarketingKit.unifiedElevatorPitch);

    if (hybridMarketingKit.crossSellingOpportunities?.length > 0) {
      drawBulletSection(
        'Cross-Selling Triggers',
        hybridMarketingKit.crossSellingOpportunities.map(
          (c) => `[Trigger: ${c.trigger}] -> ${c.recommendation} (Benefit: ${c.benefit})`
        )
      );
    }

    if (hybridMarketingKit.combinedCampaigns?.length > 0) {
      drawBulletSection(
        'Combined Bundle Campaigns',
        hybridMarketingKit.combinedCampaigns.map(
          (b) => `${b.title} (${b.theme}): ${b.bundleOffer} — "${b.hook}" CTA: ${b.callToAction}`
        )
      );
    }

    drawBulletSection('Hybrid Promotional Offers', hybridMarketingKit.promotionalOffers);
    drawBulletSection('Hybrid Customer Retention Tactics', hybridMarketingKit.customerRetentionTactics);
  }

  // =========================================================
  // 9. MARKETING CAPTIONS & CAMPAIGN CONCEPTS SUMMARY
  // =========================================================
  const hasMarketing =
    (marketingCaptions?.english?.length || 0) > 0 ||
    (marketingCaptions?.pidgin?.length || 0) > 0 ||
    !!advertisingConcepts;

  if (hasMarketing) {
    drawSectionHeading('9. Marketing Captions & Campaign Blueprints');

    if (marketingCaptions?.english?.length > 0) {
      drawBulletSection(
        'English Social Captions',
        marketingCaptions.english.map(
          (c) => `[${c.title}] ${c.hook}\n${c.body}\nCTA: ${c.callToAction} (${c.hashtags.join(' ')})`
        )
      );
    }

    if (marketingCaptions?.pidgin?.length > 0) {
      drawBulletSection(
        'Nigerian Pidgin Captions',
        marketingCaptions.pidgin.map(
          (c) => `[${c.title}] ${c.hook}\n${c.body}\nCTA: ${c.callToAction} (${c.hashtags.join(' ')})`
        )
      );
    }

    if (advertisingConcepts?.instagramCarousel) {
      const car = advertisingConcepts.instagramCarousel;
      drawLabeledBlock(
        `Instagram Carousel: ${car.title}`,
        `1. ${car.slide1Hook}\n2. ${car.slide2Value}\n3. ${car.slide3SocialProof}\n4. ${car.slide4CTA}`
      );
    }

    if (advertisingConcepts?.tiktokReelConcept) {
      const reel = advertisingConcepts.tiktokReelConcept;
      drawLabeledBlock(
        'TikTok / Reels 15s Script',
        `Visual Hook: ${reel.hookVisual}\nAudio: ${reel.audioSuggestion}\nOn-Screen Text: ${reel.onScreenText}\nScript:\n${reel.script15s}`
      );
    }

    if (advertisingConcepts?.whatsappStatusSequence?.length > 0) {
      drawBulletSection(
        'WhatsApp Status Campaign Sequence',
        advertisingConcepts.whatsappStatusSequence.map(
          (s) => `${s.part}: "${s.text}" (Visual Tip: ${s.visualTip})`
        )
      );
    }

    if (advertisingConcepts?.promoOfferIdeas?.length > 0) {
      drawBulletSection('Promotional Offer Hooks', advertisingConcepts.promoOfferIdeas);
    }
  }

  // =========================================================
  // FOOTER & PAGE NUMBERS PASS ON ALL PAGES
  // =========================================================
  const totalPages = doc.getNumberOfPages();
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    doc.setPage(pageNum);
    doc.setDrawColor(231, 229, 228);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_X, PAGE_H - 14, PAGE_W - MARGIN_X, PAGE_H - 14);

    doc.setFont('DejaVuSans', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 113, 108);
    doc.text(`${brandName}  •  SME Brand Studio`, MARGIN_X, PAGE_H - 9);
    doc.text(`Page ${pageNum} of ${totalPages}`, PAGE_W - MARGIN_X, PAGE_H - 9, {
      align: 'right',
    });
  }

  const blob = doc.output('blob');
  const fileName = `${sanitizeSlug(brandIdentity.selectedName)}-brand-guide.pdf`;
  return { blob, fileName };
}

export async function downloadBrandGuidePdf(
  result: BrandStudioResult,
  context: BrandExportContext = {}
): Promise<string> {
  const { blob, fileName } = await generateBrandGuidePdf(result, context);
  triggerBlobDownload(blob, fileName);
  return fileName;
}

/**
 * Formats existing generated marketing captions, ad concepts, and hybrid campaign text
 * into a structured .txt document. Returns null if no marketing content exists.
 */
export function buildMarketingContentText(
  result: BrandStudioResult,
  context: BrandExportContext = {}
): string | null {
  const sections: string[] = [];
  const brandName = result.brandIdentity?.selectedName || 'SME Brand';
  const tagline = result.brandIdentity?.selectedTagline || '';

  const { marketingCaptions, advertisingConcepts, hybridMarketingKit } = result;

  if (marketingCaptions?.english?.length) {
    sections.push(
      `1. SOCIAL MEDIA CAPTIONS (PROFESSIONAL ENGLISH)\n------------------------------------------------\n` +
        marketingCaptions.english
          .map(
            (c, i) =>
              `[${i + 1}] ${c.title}\nHook: ${c.hook}\n${c.body}\nCTA: ${c.callToAction}\nHashtags: ${c.hashtags.join(' ')}`
          )
          .join('\n\n')
    );
  }

  if (marketingCaptions?.pidgin?.length) {
    sections.push(
      `2. SOCIAL MEDIA CAPTIONS (NIGERIAN PIDGIN)\n------------------------------------------------\n` +
        marketingCaptions.pidgin
          .map(
            (c, i) =>
              `[${i + 1}] ${c.title}\nHook: ${c.hook}\n${c.body}\nCTA: ${c.callToAction}\nHashtags: ${c.hashtags.join(' ')}`
          )
          .join('\n\n')
    );
  }

  if (advertisingConcepts?.instagramCarousel) {
    const car = advertisingConcepts.instagramCarousel;
    sections.push(
      `3. INSTAGRAM CAROUSEL STORYBOARD\n------------------------------------------------\n` +
        `Title: ${car.title}\n` +
        `Slide 1 (Hook): ${car.slide1Hook}\n` +
        `Slide 2 (Value): ${car.slide2Value}\n` +
        `Slide 3 (Social Proof): ${car.slide3SocialProof}\n` +
        `Slide 4 (CTA): ${car.slide4CTA}`
    );
  }

  if (advertisingConcepts?.tiktokReelConcept) {
    const reel = advertisingConcepts.tiktokReelConcept;
    sections.push(
      `4. TIKTOK / INSTAGRAM REELS 15-SECOND SCRIPT\n------------------------------------------------\n` +
        `Visual Hook: ${reel.hookVisual}\n` +
        `Audio Suggestion: ${reel.audioSuggestion}\n` +
        `On-Screen Text: ${reel.onScreenText}\n\nScript:\n${reel.script15s}`
    );
  }

  if (advertisingConcepts?.promoOfferIdeas?.length) {
    sections.push(
      `5. PROMOTIONAL OFFER IDEAS\n------------------------------------------------\n` +
        advertisingConcepts.promoOfferIdeas.map((p, i) => `${i + 1}. ${p}`).join('\n')
    );
  }

  if (hybridMarketingKit) {
    const hybridParts: string[] = [];
    if (hybridMarketingKit.unifiedTagline) {
      hybridParts.push(`Unified Tagline: "${hybridMarketingKit.unifiedTagline}"`);
    }
    if (hybridMarketingKit.unifiedElevatorPitch) {
      hybridParts.push(`Unified 30s Pitch:\n${hybridMarketingKit.unifiedElevatorPitch}`);
    }
    if (hybridMarketingKit.productCaptions?.english?.length) {
      hybridParts.push(
        `Hybrid Product Captions (English):\n` +
          hybridMarketingKit.productCaptions.english
            .map((c, i) => `  ${i + 1}. ${c.title}: ${c.hook}\n     ${c.body}\n     CTA: ${c.callToAction}`)
            .join('\n\n')
      );
    }
    if (hybridMarketingKit.productCaptions?.pidgin?.length) {
      hybridParts.push(
        `Hybrid Product Captions (Pidgin):\n` +
          hybridMarketingKit.productCaptions.pidgin
            .map((c, i) => `  ${i + 1}. ${c.title}: ${c.hook}\n     ${c.body}\n     CTA: ${c.callToAction}`)
            .join('\n\n')
      );
    }
    if (hybridMarketingKit.serviceCaptions?.english?.length) {
      hybridParts.push(
        `Hybrid Service Booking Captions (English):\n` +
          hybridMarketingKit.serviceCaptions.english
            .map((c, i) => `  ${i + 1}. ${c.title}: ${c.hook}\n     ${c.body}\n     CTA: ${c.callToAction}`)
            .join('\n\n')
      );
    }
    if (hybridMarketingKit.serviceCaptions?.pidgin?.length) {
      hybridParts.push(
        `Hybrid Service Booking Captions (Pidgin):\n` +
          hybridMarketingKit.serviceCaptions.pidgin
            .map((c, i) => `  ${i + 1}. ${c.title}: ${c.hook}\n     ${c.body}\n     CTA: ${c.callToAction}`)
            .join('\n\n')
      );
    }
    if (hybridMarketingKit.combinedCampaigns?.length) {
      hybridParts.push(
        `Combined Bundle Campaigns:\n` +
          hybridMarketingKit.combinedCampaigns
            .map((b, i) => `  ${i + 1}. ${b.title} [${b.theme}]\n     Hook: ${b.hook}\n     Bundle: ${b.bundleOffer}\n     CTA: ${b.callToAction}`)
            .join('\n\n')
      );
    }
    if (hybridMarketingKit.adCopyInstagramFacebook?.length) {
      hybridParts.push(
        `Instagram & Facebook Ad Copy:\n` +
          hybridMarketingKit.adCopyInstagramFacebook
            .map((a, i) => `  Ad ${i + 1} (${a.creativeAngle}): ${a.headline}\n  ${a.primaryText}\n  CTA: ${a.callToAction}`)
            .join('\n\n')
      );
    }
    if (hybridMarketingKit.promotionalOffers?.length) {
      hybridParts.push(
        `Hybrid Promo Offers:\n` +
          hybridMarketingKit.promotionalOffers.map((o, i) => `  ${i + 1}. ${o}`).join('\n')
      );
    }

    if (hybridParts.length > 0) {
      sections.push(
        `6. HYBRID BUSINESS MARKETING & BUNDLE CAMPAIGNS\n------------------------------------------------\n` +
          hybridParts.join('\n\n')
      );
    }
  }

  if (sections.length === 0) return null;

  return `================================================
MARKETING CONTENT PACK — ${brandName}
${tagline ? `Tagline: "${tagline}"\n` : ''}${context.productName ? `Offering: ${context.productName}\n` : ''}================================================

${sections.join('\n\n')}

================================================
Exported from SME Brand Studio
================================================`;
}

/**
 * Formats existing generated WhatsApp status sequences, booking scripts,
 * and hybrid omnichannel flows into a structured .txt document. Returns null if none exist.
 */
export function buildWhatsAppCampaignText(result: BrandStudioResult): string | null {
  const sections: string[] = [];
  const brandName = result.brandIdentity?.selectedName || 'SME Brand';

  const statusSeq = result.advertisingConcepts?.whatsappStatusSequence;
  if (statusSeq && statusSeq.length > 0) {
    sections.push(
      `1. WHATSAPP STATUS SALES SEQUENCE\n------------------------------------------------\n` +
        statusSeq
          .map(
            (s, idx) =>
              `[Part ${idx + 1}: ${s.part}]\nMessage:\n"${s.text}"\n\nVisual / Media Tip:\n${s.visualTip}`
          )
          .join('\n\n')
    );
  }

  const bookingFlow = result.serviceStrategy?.whatsAppBookingFlow;
  if (bookingFlow) {
    const flowLines: string[] = [];
    const greeting = bookingFlow.greetingAndQualification || bookingFlow.inquiryGreeting;
    if (greeting) flowLines.push(`A. Inquiry Greeting & Qualification:\n"${greeting}"`);
    const rateCard =
      bookingFlow.rateCardMessage ||
      (bookingFlow.qualifyingQuestions ? bookingFlow.qualifyingQuestions.join('; ') : '');
    if (rateCard) flowLines.push(`B. Rate Card & Qualification Script:\n"${rateCard}"`);
    if (bookingFlow.depositConfirmationNotice) {
      flowLines.push(`C. Deposit Confirmation Notice:\n"${bookingFlow.depositConfirmationNotice}"`);
    }
    const reviewReq = bookingFlow.postServiceReviewRequest || bookingFlow.postServiceReviewPrompt;
    if (reviewReq) flowLines.push(`D. Post-Service Review Request:\n"${reviewReq}"`);

    if (flowLines.length > 0) {
      sections.push(
        `2. WHATSAPP CLIENT BOOKING & ONBOARDING FLOW\n------------------------------------------------\n` +
          flowLines.join('\n\n')
      );
    }
  }

  const omniFlow = result.hybridMarketingKit?.whatsAppOmnichannelFlow;
  if (omniFlow) {
    const omniLines: string[] = [];
    if (omniFlow.productInquiryToServiceUpsell) {
      omniLines.push(`A. Product Inquiry -> Service Booking Upsell:\n"${omniFlow.productInquiryToServiceUpsell}"`);
    }
    if (omniFlow.serviceClientToProductAddon) {
      omniLines.push(`B. Completed Service -> Take-Home Product Add-on:\n"${omniFlow.serviceClientToProductAddon}"`);
    }
    if (omniFlow.vipComboBroadcast) {
      omniLines.push(`C. VIP Combo Broadcast Message:\n"${omniFlow.vipComboBroadcast}"`);
    }

    if (omniLines.length > 0) {
      sections.push(
        `3. HYBRID WHATSAPP OMNICHANNEL SCRIPTS\n------------------------------------------------\n` +
          omniLines.join('\n\n')
      );
    }
  }

  if (sections.length === 0) return null;

  return `================================================
WHATSAPP CAMPAIGN SCRIPTS — ${brandName}
================================================

${sections.join('\n\n')}

================================================
Exported from SME Brand Studio
================================================`;
}

/**
 * Bundles the Brand Guide PDF, existing Marketing Content, existing WhatsApp Campaign,
 * and any actually generated promotional images into a single organized ZIP archive.
 */
export async function exportCompleteBrandKitZip(
  result: BrandStudioResult,
  options: {
    context?: BrandExportContext;
    promoImages?: GeneratedPromoImage[];
  } = {}
): Promise<{ zipFileName: string; includedFiles: string[] }> {
  if (!result || !result.brandIdentity) {
    throw new Error('No generated brand kit found to export.');
  }

  const brandName = result.brandIdentity.selectedName || 'SME Brand';
  const folderName = `${sanitizeFolderName(brandName)} - Brand Kit`;
  const zipSlug = sanitizeSlug(brandName);

  const zip = new JSZip();
  const rootFolder = zip.folder(folderName);
  if (!rootFolder) {
    throw new Error('Failed to create ZIP directory structure.');
  }

  const includedFiles: string[] = [];

  // 1. Brand Guide.pdf
  const { blob: pdfBlob } = await generateBrandGuidePdf(result, options.context);
  rootFolder.file('Brand Guide.pdf', pdfBlob);
  includedFiles.push('Brand Guide.pdf');

  // 2. Marketing Content.txt (only if exists)
  const marketingTxt = buildMarketingContentText(result, options.context);
  if (marketingTxt) {
    rootFolder.file('Marketing Content.txt', marketingTxt);
    includedFiles.push('Marketing Content.txt');
  }

  // 3. WhatsApp Campaign.txt (only if exists)
  const whatsappTxt = buildWhatsAppCampaignText(result);
  if (whatsappTxt) {
    rootFolder.file('WhatsApp Campaign.txt', whatsappTxt);
    includedFiles.push('WhatsApp Campaign.txt');
  }

  // 4. Promotional images actually generated by the app (only if any exist)
  const validImages = (options.promoImages || []).filter(
    (img) => img && typeof img.dataUrl === 'string' && img.dataUrl.startsWith('data:image/')
  );

  if (validImages.length > 0) {
    const imgFolder = rootFolder.folder('Promotional Images');
    validImages.forEach((img, index) => {
      const base64Match = img.dataUrl.match(/^data:image\/(\w+);base64,(.+)$/s);
      if (base64Match && imgFolder) {
        const ext = base64Match[1] === 'jpeg' ? 'jpg' : base64Match[1];
        const safeName = sanitizeFolderName(img.fileName || `${zipSlug}-promo-${index + 1}.${ext}`);
        imgFolder.file(safeName, base64Match[2], { base64: true });
        includedFiles.push(`Promotional Images/${safeName}`);
      }
    });
  }

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const zipFileName = `${zipSlug}-complete-brand-kit.zip`;
  triggerBlobDownload(zipBlob, zipFileName);

  return { zipFileName, includedFiles };
}
