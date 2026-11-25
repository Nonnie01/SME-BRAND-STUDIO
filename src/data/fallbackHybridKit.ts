import { BrandStudioResult } from '../types';

export const DEFAULT_HYBRID_FALLBACK_KIT: BrandStudioResult = {
  businessType: 'hybrid',
  visualAnalysis:
    'Hybrid brand audit indicates high commercial synergy between handcrafted physical inventory and expert client service delivery, establishing credibility and cross-sell readiness for the Nigerian market.',
  brandNames: [
    {
      name: 'DivaLuxe Atelier & Co.',
      tagline: 'Artisanal Care, Bespoke Mastery',
      meaning:
        'Fuses "Diva" (celebrating the bold, regal beauty of modern Nigerian women) with "Atelier" (artisan workshop devotion to formulation and styling mastery).',
      targetVibe: 'Afro-Luxury & Regal',
      isRecommended: true,
      recommendationRationale:
        'STRATEGIST TOP PICK: Seamlessly unites both physical product jars on retail shelves and luxury service appointments, preventing brand dilution.',
    },
    {
      name: 'Aura Bloom Studio & Organics',
      tagline: 'Pure Radiance From Within',
      meaning: 'Emphasizes holistic transformation combining physical botanicals with specialist touch.',
      targetVibe: 'Warm, Trusted & Natural',
      isRecommended: false,
    },
    {
      name: 'Apex Crown Heritage',
      tagline: 'Where Craftsmanship Meets Distinction',
      meaning: 'Projects high-standard durability and cultural authority for discerning Nigerian clients.',
      targetVibe: 'Elite Professional & Polished',
      isRecommended: false,
    },
    {
      name: 'Zari Essence & Lounge',
      tagline: 'Tailored for Your Everyday Glow',
      meaning: 'Approachable, warm urban aesthetic ideal for social-first commerce and walk-in clients.',
      targetVibe: 'Creative & Vibrant',
      isRecommended: false,
    },
    {
      name: 'Kora Dual Craft Lab',
      tagline: 'Formulated to Perform, Styled to Impress',
      meaning: 'Direct, modern positioning highlighting scientific formulation and hands-on artistry.',
      targetVibe: 'Modern & Practical',
      isRecommended: false,
    },
  ],
  brandIdentity: {
    selectedName: 'DivaLuxe Atelier & Co.',
    selectedTagline: 'Artisanal Care, Bespoke Mastery',
    strongestNameRationale:
      'Recommended because it bridges product retail margins with recurring service booking deposits, establishing an authoritative Nigerian lifestyle brand that customers trust both in-person and online.',
    colorPalette: [
      {
        name: 'Royal Lekki Emerald',
        hex: '#064E3B',
        role: 'Primary brand colour',
        psychologicalReason: 'Signals prestige, grounded prosperity, and certified formulation purity.',
        marketingReason:
          'Hero colour for product packaging labels, shopping bags, and client service booking headers.',
      },
      {
        name: 'Warm Niger Ochre',
        hex: '#B45309',
        role: 'Secondary brand colour',
        psychologicalReason: 'Radiates hospitality, warm African sunlight, and hospitable client reception.',
        marketingReason:
          'Applied to WhatsApp profile branding, Instagram highlights, and product ingredient cards.',
      },
      {
        name: 'Abuja Terracotta Sunset',
        hex: '#C2410C',
        role: 'Accent colour',
        psychologicalReason: 'Drives prompt decisive action, vibrant energy, and high conversion.',
        marketingReason:
          'Triggers instant clicks on "Order Product + Book Session" bundles and flash promo banners.',
      },
      {
        name: 'Deep Forest Pine',
        hex: '#14532D',
        role: 'Supporting colour',
        psychologicalReason: 'Reinforces organic botanical authenticity and meticulous craftsmanship.',
        marketingReason: 'Used for product package border trims, receipt headers, and price tag badges.',
      },
      {
        name: 'Linen Shell Neutral',
        hex: '#FAFAF9',
        role: 'Background colour',
        psychologicalReason: 'Provides an airy, clean editorial canvas that avoids harsh white glare on mobile.',
        marketingReason: 'Maximizes contrast for online catalogs, e-commerce cards, and lookbook spreads.',
      },
      {
        name: 'Midnight Coal Slate',
        hex: '#0F172A',
        role: 'Text colour',
        psychologicalReason: 'Projects unshakable corporate competence and crisp editorial elegance.',
        marketingReason: 'Guarantees WCAG AAA contrast for product ingredient labels and booking contracts.',
      },
      {
        name: 'Heritage Indigo Gold',
        hex: '#1E3A8A',
        role: 'Complementary colour',
        psychologicalReason: 'Denotes royal ceremonial prestige and milestone celebration pride.',
        marketingReason: 'Accents VIP combo retainer packages and holiday gift bundle sets.',
      },
      {
        name: 'Sunlit Amber Glow',
        hex: '#F59E0B',
        role: 'Highlight colour',
        psychologicalReason: 'Evokes celebration, luxury gold accents, and joyful Nigerian hospitality.',
        marketingReason: 'Highlights "Buy 1, Get 20% Off Service" stickers and free delivery tags.',
      },
    ],
    positioning: {
      targetAudience:
        'Discerning Nigerian working women, corporate professionals, brides, and diaspora visitors (aged 24–45) in Lagos, Abuja, Port Harcourt, and major urban centers who demand salon-grade results and authentic take-home products.',
      customerNeedsAndMotivations:
        'Tired of buying random unverified products online that damage their hair or skin, and equally exhausted by service providers who use cheap harsh chemicals during appointments. They seek an integrated brand where the stylist who performs the service is the same master who formulates the care products.',
      brandPersonality: [
        {
          trait: 'Integrated Authority',
          rationale: 'Possesses deep dual expertise in physical formulation and master hands-on service execution.',
        },
        {
          trait: 'Warmly Attentive & Hospitable',
          rationale: 'Delivers royal VIP treatment without condescension or hidden charges.',
        },
        {
          trait: 'Proudly African & Grounded',
          rationale: 'Celebrates indigenous botanical extracts (Chebe, shea butter, palm kernel, castor oil) with modern lab refinement.',
        },
        {
          trait: 'Dependable & Transparent',
          rationale: 'States upfront pricing in Naira with zero "DM for price" friction and guaranteed on-time appointments.',
        },
      ],
      uniqueSellingProposition:
        'The Complete Beauty Ecosystem: We don’t just install your look and leave you guessing; we craft bespoke transformations and formulate the exact take-home organic care remedies to keep your results glowing for months.',
      marketDifferentiation:
        'Sharp contrast against ordinary hairdressers/tailors who sell third-party unvetted items at markup, and distinct from pure e-commerce product vendors who have zero practical styling or consultation experience.',
      brandPromise:
        'Master-crafted service execution combined with scientifically backed take-home care products delivered right to your doorstep with zero stories.',
      brandVoice: {
        tone: 'Regal, warmly professional, encouraging, culturally confident, and clear.',
        vocabulary: [
          'Mastery',
          'Complete Care',
          'Bespoke Artistry',
          'Pure Formulation',
          'Naija Pride',
          'Verified Results',
          'Restorative',
          'Zero Stories',
        ],
        communicationDos: [
          'Display prices for both product retail and service sessions upfront in Naira (₦)',
          'Provide clear aftercare usage instructions whenever delivering a service',
          'Offer bundle incentives (e.g., "Take home our elixir at 25% off during your styling visit")',
          'Share real customer before-and-after photos and video unboxing clips',
        ],
        communicationDonts: [
          'Never use "DM for price" on either product items or service menus',
          'Never disparage client concerns about product ingredients or service timelines',
          'Avoid delivering physical products in flimsy unbranded plastic bags',
        ],
      },
    },
    marketStrategy: {
      priceTierAnalysis:
        'Upper-Accessible Hybrid. Physical product retail generates steady daily cash flow, while high-ticket bespoke service appointments yield healthy lump-sum profits and lock in customer loyalty.',
      trustBuildingTactics: [
        'Send pre-appointment WhatsApp confirmation notes with exact service address and complimentary product perks.',
        'Include tamper-evident holographic safety seals and clear NAFDAC compliance notices on all product jars.',
        'Provide a 48-hour satisfaction guarantee with complimentary product touch-up support.',
      ],
      channelStrategy:
        'Instagram Reels for ASMR behind-the-scenes transformations and product packaging; TikTok for educational ingredient demos; WhatsApp Business Catalog for combined product ordering and calendar appointment booking.',
      locationSpecificTactics: [
        {
          region: 'Lagos (Island & Mainland)',
          tactics:
            'Offer same-day dispatch via trusted motorcycle couriers for physical products, paired with VIP weekend in-studio slots in Lekki/Ikeja and mobile home service surcharges stated transparently.',
        },
        {
          region: 'Federal Capital Territory (Abuja)',
          tactics:
            'Focus on corporate working hours, weekend wedding bundles, and premium packaging suited for ministerial and private sector clients in Wuse 2, Maitama, and Garki.',
        },
        {
          region: 'Rivers & Niger Delta',
          tactics:
            'Leverage consolidated interstate waybills (GIGM/Peace Mass) with 24-48hr tracking for retail products, supported by seasonal pop-up styling masterclasses in Port Harcourt.',
        },
        {
          region: 'Nationwide & Diaspora',
          tactics:
            'Offer DHL/FedEx worldwide delivery for shelf-stable product elixirs, with virtual 1-on-1 WhatsApp video styling consultations for overseas clients visiting Nigeria for weddings.',
        },
      ],
    },
    qualityAudit: {
      photoObservations:
        'Product photograph and service presentation display high craftsmanship, consistent labeling, and professional styling aesthetics.',
      userSuppliedData:
        'Hybrid SME overview supplied by merchant, integrating physical inventory with scheduled client services.',
      groundedClaimsPolicy:
        'AUDIT VERIFIED: Recommendations strictly reflect authentic merchant capabilities without inventing unverified clinical certifications or false medical cures.',
      cohesionScore: 98,
      consistencyReview:
        'Perfect harmony between product formulation palette, retail packaging, and on-site service appointment decor.',
      pitfallsToAvoid: [
        'Treating products and services as two separate disconnected businesses—always cross-sell naturally.',
        'Hiding prices behind "DM for price" which drives 60%+ of Nigerian social buyers to competitors.',
        'Neglecting product inventory stockouts when booking service clients who expect to purchase immediately.',
      ],
      packagingAndDisplayAdvice:
        'Dual Touchpoint Standard: Package retail products in rigid amber glass bottles with gold foil labels and custom-stamped kraft unboxing boxes. For services, provide a branded appointment itinerary PDF and a complimentary travel-size care sample bag upon completion.',
    },
    typographyRecommendation: {
      headerFont: 'Plus Jakarta Sans Bold',
      bodyFont: 'Plus Jakarta Sans Regular',
      styleNote:
        'Balanced modern geometric sans-serif projecting international polish while retaining authentic African warmth and legibility on mobile screens.',
    },
    idealCustomerPersona: {
      name: 'Adanna Okafor',
      ageRange: '27 - 42 years old',
      location: 'Lagos / Abuja / Port Harcourt',
      painPoint:
        'Spent thousands on unverified vendors who ruined her hair and skin; frustrated by having to buy products from one vendor and visit an unrelated stylist who uses conflicting chemicals.',
      whyTheyBuy:
        'Loves the all-in-one convenience and peace of mind of having an integrated expert who both styles her flawlessly and supplies the authentic products to sustain the look at home.',
    },
  },
  serviceStrategy: {
    clientOnboardingAndExperience:
      '3-Touchpoint Seamless Journey: (1) WhatsApp consultation & product preference check, (2) 50% commitment deposit lock with digital receipt, (3) In-studio/home appointment execution concluding with a complimentary product aftercare travel kit.',
    trustAndDepositPolicy:
      'Clear 50% commitment deposit required to lock dates; 100% transferable if rescheduled 48 hours in advance. Guaranteed punctual arrival with 10% refund credit if specialist arrives more than 20 minutes late.',
    retentionAndReferralTactics: [
      'The "Complete Care" VIP Refill Club: 15% discount on all physical product purchases for active service clients.',
      'Wedding Host Referral Incentive: ₦10,000 cash credit or free styling session for every bridal party referral booked.',
      'Birthday Pamper Box: Free full-size product elixir gift sent to loyalty clients on their birthday month.',
    ],
    servicePackages: [
      {
        name: 'The Essential Glow Session',
        tierName: 'The Essential Glow Session',
        targetClient: 'First-time clients seeking immediate revitalisation and routine product guidance.',
        deliverables: [
          'Full consultation & scalp/skin audit',
          'Precision service styling',
          'Mini take-home aftercare elixir (30ml)',
          '7-day post-service WhatsApp follow-up',
        ],
        pricingAdvice: 'Accessible introductory tier that converts new clients into lifelong product subscribers.',
        recommendedPricing: '₦28,500',
        turnaroundOrDuration: '90 minutes',
      },
      {
        name: 'The Signature Royalty Transformation',
        tierName: 'The Signature Royalty Transformation',
        targetClient: 'Milestone celebrations, weddings, executive photoshoots, or full restorative care.',
        deliverables: [
          'Complete VIP service execution',
          'Full-size DivaLuxe Herbal Hair Elixir (100ml)',
          'Silk protection sleep bonnet',
          'Priority calendar booking & extended touch-ups',
        ],
        pricingAdvice: 'Highest-margin bundle combining high-ticket service fee with premium retail products.',
        recommendedPricing: '₦65,000',
        turnaroundOrDuration: '2.5 - 3 hours',
      },
      {
        name: 'The Monthly Retainer VIP Membership',
        tierName: 'The Monthly Retainer VIP Membership',
        targetClient: 'Busy executives, brides-to-be, and content creators needing bi-weekly maintenance.',
        deliverables: [
          'Two full styling/treatment appointments per month',
          'Unlimited product replenishment at 20% off',
          'Dedicated direct line with lead specialist',
          'Complimentary emergency same-day dispatch',
        ],
        pricingAdvice: 'Provides stable, recurring cash flow while guaranteeing steady product consumption.',
        recommendedPricing: '₦95,000 / month',
        turnaroundOrDuration: 'Bi-weekly ongoing',
      },
    ],
    whatsAppBookingFlow: {
      greetingAndQualification:
        'Hello and welcome to DivaLuxe Atelier & Co.! 🌿✨ We are delighted to assist you with our luxury services and handcrafted care products.\n\nAre you looking to (1) Book a styling appointment, (2) Order our organic care products, or (3) Enjoy our Signature Combo Bundle?\n\nPlease let us know your preferred date or delivery location!',
      inquiryGreeting:
        'Hello and welcome to DivaLuxe Atelier & Co.! 🌿✨ How may we delight you today with our services or organic care products?',
      qualifyingQuestions: [
        'What specific service or product bundle are you interested in?',
        'What is your preferred appointment date or product delivery address in Nigeria?',
        'Do you have any specific styling needs or hair/skin sensitivities we should note?',
      ],
      rateCardMessage:
        'Here is our official 2026 DivaLuxe Menu & Product Catalog:\n\n🛍️ *RETAIL PRODUCTS:*\n• Herbal Growth Elixir (100ml) — ₦8,500\n• Restorative Chebe Butter — ₦7,500\n• Pure Silk Sleep Bonnet — ₦4,500\n\n💆‍♀️ *SERVICE PACKAGES:*\n• Essential Glow Session — ₦28,500\n• Signature Royalty Transformation (+ Free Elixir) — ₦65,000\n• Monthly VIP Retainer Membership — ₦95,000\n\nReply with your choice to lock in your slot or delivery today!',
      depositConfirmationNotice:
        '🎉 Booking Confirmed! We have successfully received your 50% commitment deposit. Your appointment date and time slot are officially locked. Our specialist will be ready for you at [Time] on [Date]. Your complimentary product gift bag is already set aside for you!',
      postServiceReviewRequest:
        'Thank you so much for visiting DivaLuxe Atelier & Co. today! 💖 We hope you felt completely pampered. Don’t forget to apply your Herbal Elixir every night as demonstrated. Could you kindly take 1 minute to leave us a quick review? Your feedback helps our Nigerian SME grow! ⭐⭐⭐⭐⭐',
      postServiceReviewPrompt:
        'Thank you so much for visiting DivaLuxe Atelier & Co. today! 💖 Could you kindly take 1 minute to leave us a quick review?',
    },
  },
  hybridMarketingKit: {
    unifiedTagline: 'Flawless Styling, Master-Formulated Daily Care',
    unifiedElevatorPitch:
      'DivaLuxe Atelier & Co. is Nigeria’s premier integrated beauty house, pairing master salon artistry with cold-pressed organic hair remedies so your look stays vibrant and your natural hairline flourishes long after you leave the studio.',
    productCaptions: {
      english: [
        {
          title: 'The Take-Home Secret (Product Spotlight)',
          hook: 'Ever wonder why our salon clients’ hair stays full and shiny weeks after their appointment? ✨🌿',
          body: 'The secret is finally out! Our DivaLuxe Herbal Hair Growth Elixir is hand-pressed with authentic Chebe and Nigerian castor oil to lock in deep moisture and stop shedding in its tracks. No harsh chemicals, no greasy residue—just pure botanical nourishment.',
          callToAction: 'Tap the link in bio to order yours today! Nationwide waybill and same-day Lagos dispatch available.',
          hashtags: ['#DivaLuxeHair', '#ChebeOil', '#NigerianHaircare', '#HairGrowthJourney', '#LagosVendor'],
        },
        {
          title: 'Edge Recovery ASMR Dropper Drop',
          hook: 'Say goodbye to thin edges and itchy scalp for good! 💧🇳🇬',
          body: 'Two drops every night along your hairline is all it takes. Formulated specifically for Nigerian women wearing protective styles, braids, and wigs. Real results in 21 days or your money back.',
          callToAction: 'Send us a DM or click our WhatsApp link to secure your bottle before this week’s batch sells out!',
          hashtags: ['#HealthyHairNG', '#NaijaBrands', '#EdgeControl', '#OrganicBeautyNG'],
        },
      ],
      pidgin: [
        {
          title: 'Street Hype ("Better Product")',
          hook: 'Omo, see oil wey dey work wonder! Who tell you say natural hair must dey pain you? 🔥🇳🇬',
          body: 'No be jazz, na correct original Nigerian castor oil mixed with Chebe! If your front hair don dey chop or your scalp dey scratch, this DivaLuxe elixir go put everything back for balance sharp sharp. No story, na pure quality!',
          callToAction: 'DM us now make we waybill your own today-today!',
          hashtags: ['#NoCarryLast', '#OriginalHairOil', '#NaijaMarket', '#LagosVendor'],
        },
        {
          title: 'Real Talk ("No Fake Life")',
          hook: 'Stop buying cheap oil wey go finish your hairline abeg! 💆‍♀️💯',
          body: 'Better thing no dey hide! That same oil wey our salon clients dey rush na im we pack inside this bottle for you. Use am morning and night, you go see the difference yourself!',
          callToAction: 'Chat our WhatsApp catalog make delivery rider bring am come your doorstep!',
          hashtags: ['#PureQuality', '#NaijaHustle', '#OriginalVendor'],
        },
      ],
    },
    serviceCaptions: {
      english: [
        {
          title: 'The Royalty Experience (Service Spotlight)',
          hook: 'Tired of sitting for hours in hot salons with stylists who handle your hair like rough paper? 👑✨',
          body: 'At DivaLuxe Atelier & Co., your peace of mind comes first. From gentle knot-bleaching to custom wand curls and a soothing scalp massage, we deliver perfection with zero stress and guaranteed on-time start.',
          callToAction: 'Limited weekend slots available! Click link in bio to book your appointment now.',
          hashtags: ['#LagosSalon', '#FrontalInstall', '#AbujaHairStylist', '#BespokeGlam', '#LuxuryService'],
        },
      ],
      pidgin: [
        {
          title: 'Zero Headache ("No Stories")',
          hook: 'You book 10 AM, vendor go arrive 2 PM? Omo, you no fit see that kind nonsense here! 🙅‍♀️🔥',
          body: 'For DivaLuxe, your time na money! When you book appointment with us, we dey ready waiting for you. Air-conditioned studio, chilled drink, and styling wey go make your people shout "Who did your hair?!"',
          callToAction: 'Send WhatsApp message sharp sharp make we lock your date!',
          hashtags: ['#NoStories', '#LagosStylist', '#CorrectVendor', '#SharpBooking'],
        },
      ],
    },
    combinedCampaigns: [
      {
        title: 'The "Style & Sustain" Power Combo',
        theme: 'Service + Product Bundle',
        hook: 'Book your Signature Transformation session this month and take home our best-selling Herbal Elixir for 50% OFF!',
        bundleOffer: 'Signature Styling Session + Full Size Herbal Elixir (Save ₦4,250)',
        callToAction: 'Reply "COMBO" on WhatsApp to claim your bundle voucher before slots fill up!',
      },
      {
        title: 'The "Bridal Glow VIP Pack"',
        theme: 'Event Package + Complete Retail Gift Set',
        hook: 'Everything the bride and maid-of-honor need to look breathtaking and keep their skin and hair glowing throughout the honeymoon.',
        bundleOffer: 'Bridal Styling Session + 3 Bottles of Growth Elixir + 2 Silk Bonnets in Branded Keepsake Box',
        callToAction: 'Message our bridal desk on WhatsApp for custom date reservation & consultation.',
      },
      {
        title: 'The "Home Delivery + Virtual Touch-Up"',
        theme: 'Retail Product + Free 15-Minute Video Consultation',
        hook: 'Order any 2 products this week and receive a FREE 1-on-1 WhatsApp video consultation with our head stylist.',
        bundleOffer: 'Any 2 Retail Jars + 15-Min Live Application Audit with Master Specialist',
        callToAction: 'Tap the link in bio to shop and automatically unlock your styling consultation slot.',
      },
    ],
    crossSellingOpportunities: [
      {
        trigger: 'When a client books an on-site frontal installation or bridal styling appointment',
        recommendation:
          'Present the Take-Home Maintenance Duo (Herbal Elixir + Silk Sleep Bonnet) at the booking confirmation stage for a bundled ₦10,000 add-on.',
        benefit:
          'Protects the client’s hairstyle investment from night friction; adds instant 35% margin to the booking ticket.',
      },
      {
        trigger: 'When an online customer orders 2 or more bottles of product from your WhatsApp catalog',
        recommendation:
          'Include a physical voucher card in the unboxing parcel offering ₦5,000 off their first in-studio or home styling session.',
        benefit:
          'Converts pure online product buyers into high-ticket recurring service clients in major Nigerian metro hubs.',
      },
      {
        trigger: 'When a service client completes their session at the studio mirror',
        recommendation:
          'Spritz and apply the signature elixir during the final reveal, explaining: "This is what gave your hair this exact glass shine; we have 2 bottles left in the display cabinet today."',
        benefit:
          'Leverages the peak emotional moment of satisfaction to generate an immediate impulse retail purchase.',
      },
    ],
    whatsAppOmnichannelFlow: {
      productInquiryToServiceUpsell:
        'Hello [Client Name]! Thank you for ordering your DivaLuxe Herbal Elixir. 🌿 Did you know we also offer professional in-studio and home styling in Lagos and Abuja? If you’d like our master specialist to personally apply your treatment and install your hair, reply "BOOK" to get ₦5,000 off your first session!',
      serviceClientToProductAddon:
        'Hi [Client Name]! We are looking forward to pampering you this [Day] at [Time]. 👑 To ensure your installation lasts 6+ weeks without shedding, would you like us to prepare a take-home Herbal Elixir & Silk Bonnet gift bag at 20% off for your appointment?',
      vipComboBroadcast:
        '🌟 EXCLUSIVE HYBRID PERK: This weekend only, anyone who orders our Herbal Hair Growth Elixir gets priority booking access for our December holiday calendar before general slots open! Chat us now to claim yours.',
    },
    adCopyInstagramFacebook: [
      {
        headline: 'Why Settle for Just a Salon or Just a Product When You Can Have Both?',
        primaryText:
          'Stop risking your hairline with stylists who use harsh mystery products, and stop buying random bottles online with zero expert guidance. At DivaLuxe Atelier & Co., we style you to perfection AND give you the exact organic formulas to keep your crown glowing every single day. 🇳🇬✨',
        creativeAngle: 'Split screen: Left side shows active luxury styling; Right side shows pure golden elixir dropper on healthy edges.',
        callToAction: 'Tap "Shop & Book Now" to experience complete care.',
      },
      {
        headline: 'The Secret to 6-Week Flawless Frontals & Thriving Natural Hair',
        primaryText:
          'Watch how our master stylists install this frontal using 100% glueless methods and seal the scalp with our cold-pressed Herbal Elixir. Long-lasting hold, zero hairline damage. Book your slot or order your bottle today!',
        creativeAngle: '15-second ASMR Reel of hair being styled and product bottle being unboxed.',
        callToAction: 'Send WhatsApp Message',
      },
    ],
    promotionalOffers: [
      'The "Style & Bottle" Bundle: Book any Signature Service and take home your choice of retail product at 25% OFF.',
      'The "Free Mainland/Island Delivery" on all retail product orders over ₦25,000.',
      'The "Bring-Your-Bestie" Double Glam: Book two simultaneous styling slots and receive two free luxury silk bonnets.',
      'The "Loyal Subscriber Refill Perk": Free salon treatment voucher every time you purchase 4 product bottles.',
    ],
    customerRetentionTactics: [
      'Post-Appointment Day 3 Check-In: Automated WhatsApp message checking on installation comfort and reminding customer to apply aftercare elixir.',
      'Quarterly Milestone Refill Discount: Automatic 15% discount code sent 60 days after product purchase when bottle is likely running low.',
      'VIP Birthday Treatment & Gift Bag: Free full-size retail product when booking a birthday makeover session.',
    ],
  },
  marketingCaptions: {
    english: [
      {
        title: 'The Hybrid Advantage (Products + Services)',
        hook: 'Why choose between expert styling and premium haircare when you deserve both? ✨🇳🇬',
        body: 'At DivaLuxe Atelier & Co., we don’t just install your hair and wave goodbye. We formulate our own pure Chebe and cold-pressed herbal oils to ensure your natural hair stays thick, moisturized, and protected long after you leave our studio. Complete beauty care under one roof.',
        callToAction: 'Tap the link in bio or send a WhatsApp message to book your session or order your take-home kit today!',
        hashtags: ['#DivaLuxeCo', '#NigerianBeauty', '#HybridVendor', '#LagosSalon', '#HaircareNG'],
      },
      {
        title: 'The Take-Home Secret',
        hook: 'Ever wonder why our salon clients’ hair stays full and shiny weeks after their appointment? 💧🌿',
        body: 'The secret is our DivaLuxe Herbal Hair Growth Elixir. Handcrafted with authentic botanical extracts, it stops shedding, soothes itchy scalp, and restores thinning edges. Real results without false promises.',
        callToAction: 'DM us or message our WhatsApp catalog to grab your bottle before this week’s batch sells out!',
        hashtags: ['#HealthyHair', '#NaijaBrands', '#NaturalHaircare', '#MadeInNigeria'],
      },
      {
        title: 'Limited Weekend Calendar Slots',
        hook: 'Weekend slots for this month are filling up fast! ⏳📅',
        body: 'To ensure every client receives our undivided personal attention, we strictly limit the number of bookings we accept each week. Book your Signature Transformation today and enjoy our complimentary take-home aftercare sample bag.',
        callToAction: 'Message us on WhatsApp now to lock your date with a simple 50% deposit.',
        hashtags: ['#BookNow', '#LagosStylist', '#NaijaEvents', '#QualityFirst'],
      },
    ],
    pidgin: [
      {
        title: 'Double Quality ("Two in One")',
        hook: 'Who say you no fit get correct service and correct product for the same place? 🔥🇳🇬',
        body: 'No be today we know say vendor wey do hair well fit use harsh chemical, or person wey sell oil no sabi style hair. For DivaLuxe Atelier & Co., we give you the two! We style you clean pass clean, and we give you correct organic oil wey go make your front hair grow well well. Better thing full ground!',
        callToAction: 'Holla our WhatsApp sharp sharp make we arrange your slot and delivery!',
        hashtags: ['#NoCarryLast', '#OriginalBrand', '#NaijaVendor', '#LagosHustle'],
      },
      {
        title: 'Zero Stories ("No Be Hype")',
        hook: 'Tired of vendors wey go give you story when you pay deposit? We hear you! 💯',
        body: 'When you book us, your mind go rest. We dey arrive on time, handle your work like egg, and give you pure grade-one items. Good service plus good product na peace of mind!',
        callToAction: 'Send message enter our WhatsApp right now make delivery rider run am!',
        hashtags: ['#ZeroStories', '#OriginalVendor', '#PureStandard'],
      },
      {
        title: 'Fast Fast Booking ("No Delay")',
        hook: 'Dates dey move like breeze and products dey rush! Make you lock your own now now. 🏃‍♂️💨',
        body: 'Whether na the Chebe growth elixir you want or you wan book your makeover for that upcoming wedding, abeg no wait till last minute. We dey ready for you!',
        callToAction: 'Chat our WhatsApp catalog now—link dey bio!',
        hashtags: ['#FastBooking', '#NaijaMarket', '#LagosVendor'],
      },
    ],
  },
  advertisingConcepts: {
    instagramCarousel: {
      title: 'The Complete Beauty Ecosystem Storyboard',
      slide1Hook: 'Slide 1: "Why 80% of hair damage happens AFTER you leave the salon (and how our hybrid method fixes it)."',
      slide2Value: 'Slide 2: Split carousel: Left shows our gentle master frontal installation; Right shows our take-home botanical elixir restoring hairline edges.',
      slide3SocialProof: 'Slide 3: Real client WhatsApp testimonials and before-and-after photos of clients 6 weeks post-appointment.',
      slide4CTA: 'Slide 4: Upfront pricing in ₦ + "Order Product & Book Service" one-click WhatsApp button.',
    },
    tiktokReelConcept: {
      hookVisual: 'Close-up ASMR video: dropper placing golden elixir on scalp, followed by seamless melt of a luxury lace wig in under 15 seconds.',
      audioSuggestion: 'Warm trending Afrobeats instrumental (mid-tempo, relaxing, premium luxury vibe).',
      script15s:
        '0-3s: "POV: You found a Nigerian brand that styles your hair AND formulates the products to grow it."\n3-8s: Quick cut of the styling process and shiny scalp reveal.\n8-12s: Packaging the customer’s take-home elixir bottle.\n12-15s: "Link in bio to shop and book!"',
      onScreenText: 'Formulated in Nigeria • Installed by Masters • Thriving Hair 🇳🇬',
    },
    whatsappStatusSequence: [
      {
        part: 'Part 1: Morning Teaser',
        text: 'Good morning family! ☀️ Packing today’s courier parcels and setting up for our 11 AM VIP client. Complete care in motion! 🌿✨',
        visualTip: 'Teaser photo of packaged retail jars next to clean salon styling tools.',
      },
      {
        part: 'Part 2: The Transformation Reveal',
        text: 'The finished look! Notice how healthy her natural edges are under the unit? We applied our Herbal Elixir before styling. Pure glass shine! 👑',
        visualTip: 'Short 5-second video clip showing client smiling and admiring finished hair in mirror.',
      },
      {
        part: 'Part 3: The Combo Offer Call to Action',
        text: 'Weekend Special: Book your next appointment and get 20% off your take-home Herbal Elixir! Only 3 slots open for this Saturday. Reply to this status now to claim yours. ⏳',
        visualTip: 'Clean branded flyer with price tags and WhatsApp booking link.',
      },
    ],
    promoOfferIdeas: [
      'The "Style & Bottle" Bundle: Book any Signature Service and take home our Herbal Elixir at 25% OFF.',
      'The "Free Mainland/Island Delivery" on retail orders over ₦25,000.',
      'The "Bring-Your-Bestie" Double Glam: Book two simultaneous styling slots and receive two free luxury silk bonnets.',
      'The "Loyal Subscriber Refill Perk": Free salon treatment voucher every time you purchase 4 product bottles.',
    ],
  },
};
