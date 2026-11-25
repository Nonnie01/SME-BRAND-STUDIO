import { BrandStudioResult } from '../types';

export const DEFAULT_SERVICE_FALLBACK_KIT: BrandStudioResult = {
  businessType: 'service',
  visualAnalysis:
    'Service portfolio audit exhibits polished creative presentation, verified client transformations, and professional appointment booking touchpoints suitable for discerning Nigerian clients.',
  brandNames: [
    {
      name: 'Aura Luxe Atelier',
      tagline: 'Flawless Craftsmanship, Meticulous Care',
      meaning:
        'Combines "Aura" (the distinctive elevated energy radiating from premium bespoke service) with "Atelier" (honoring artisanal mastery and personalized client care).',
      targetVibe: 'Afro-Luxury & Regal',
      isRecommended: true,
      recommendationRationale:
        'STRATEGIST TOP PICK: Positions the business immediately above informal street-level freelancers, commanding premium consultation and booking deposits across major Nigerian metro hubs.',
    },
    {
      name: 'Apex Heritage Studio',
      tagline: 'Where Excellence Meets Nigerian Warmth',
      meaning: 'Denotes the highest peak of professional standard and cultural dependability.',
      targetVibe: 'Elite Professional & Polished',
      isRecommended: false,
    },
    {
      name: 'SwiftPulse Solutions',
      tagline: 'Reliability Without Excuses',
      meaning: 'Direct, energetic commitment to on-time delivery and dependable communication.',
      targetVibe: 'Everyday Practical & Savvy',
      isRecommended: false,
    },
    {
      name: 'Regal Touch Co.',
      tagline: 'Tailored for Your Finest Moments',
      meaning: 'Conveys warmth, personal devotion, and VIP treatment for high-stakes Nigerian events.',
      targetVibe: 'Warm, Trusted & Heartfelt',
      isRecommended: false,
    },
    {
      name: 'Zari Creative Haus',
      tagline: 'Bespoke Artistry for Modern Naija',
      meaning: 'Celebrates refined African creative expression with structured business discipline.',
      targetVibe: 'Creative & Vibrant',
      isRecommended: false,
    },
  ],
  brandIdentity: {
    selectedName: 'Aura Luxe Atelier',
    selectedTagline: 'Flawless Craftsmanship, Meticulous Care',
    strongestNameRationale:
      'Recommended because it immediately elevates customer perception from a transactional informal vendor to a trusted luxury partner, justifying upfront commitment deposits and referral loyalty.',
    colorPalette: [
      {
        name: 'Royal Lekki Emerald',
        hex: '#064E3B',
        role: 'Primary brand colour',
        psychologicalReason: 'Signals established distinction, trustworthiness, and grounded financial stability.',
        marketingReason: 'Dominates official rate cards, invoice headers, and digital booking confirmation badges.',
      },
      {
        name: 'Warm Niger Ochre',
        hex: '#B45309',
        role: 'Secondary brand colour',
        psychologicalReason: 'Radiates genuine warmth, hospitable Nigerian reception, and approachable charm.',
        marketingReason: 'Used for Instagram story highlights, client testimonials, and WhatsApp profile branding.',
      },
      {
        name: 'Abuja Clay Terracotta',
        hex: '#C2410C',
        role: 'Accent colour',
        psychologicalReason: 'Drives prompt decisive action, creative passion, and memorable warmth.',
        marketingReason: 'Triggers instant clicks on "Book Consultation" and "Secure Your Date" WhatsApp buttons.',
      },
      {
        name: 'Plateau Cedar Pine',
        hex: '#14532D',
        role: 'Supporting colour',
        psychologicalReason: 'Reinforces calm composure and meticulous attention to schedule.',
        marketingReason: 'Shapes service menu dividers, terms of service headers, and booking invoice footers.',
      },
      {
        name: 'Warm Linen Shell',
        hex: '#FAFAF9',
        role: 'Background colour',
        psychologicalReason: 'Provides an airy, clean editorial canvas that avoids harsh sterile glare on mobile screens.',
        marketingReason: 'Ensures maximum legibility for rate card tables and WhatsApp inquiry screenshots.',
      },
      {
        name: 'Midnight Coal Slate',
        hex: '#0F172A',
        role: 'Text colour',
        psychologicalReason: 'Projects unshakable authority and crisp corporate competence.',
        marketingReason: 'Guarantees WCAG AAA contrast for service agreement clauses and pricing lists.',
      },
      {
        name: 'Benue Royal Indigo',
        hex: '#1E3A8A',
        role: 'Complementary colour',
        psychologicalReason: 'Honors depth, intellectual rigor, and premium event prestige.',
        marketingReason: 'Accents VIP corporate retainers and bridal party seasonal packages.',
      },
      {
        name: 'Savanna Gold Flare',
        hex: '#F59E0B',
        role: 'Highlight colour',
        psychologicalReason: 'Sparks excitement, celebration, and VIP priority.',
        marketingReason: 'Draws customer attention to "Early Bird 15% Booking Deposit" and "Limited Slots" alerts.',
      },
    ],
    positioning: {
      targetAudience:
        'Discerning Nigerian working executives, high-standard brides, event hosts, and corporate managers (aged 25-50) living in Lagos, Abuja, Port Harcourt, and diaspora visitors seeking zero-excuse, punctual service excellence.',
      customerNeedsAndMotivations:
        'They are exhausted by common Nigerian vendor anxieties: unpunctual arrivals, last-minute cancellations, hidden travel surcharges, and rude customer service. They gladly pay premium rates for verified reliability, transparent booking terms, and polished communication.',
      brandPersonality: [
        { trait: 'Meticulously Punctual', rationale: 'Defeats the notorious "African time" stigma with guaranteed arrival timelines.' },
        { trait: 'Warmly Attentive', rationale: 'Listens intently to client requirements before recommending tailored solutions.' },
        { trait: 'Polished & Professional', rationale: 'Maintains formal invoicing, written confirmations, and zero informal haggling.' },
        { trait: 'Culturally Fluent', rationale: 'Deeply understands Nigerian wedding traditions, corporate etiquette, and local celebrations.' },
      ],
      uniqueSellingProposition:
        'Verified service excellence with guaranteed arrival times, transparent written quotes in Naira, and dedicated post-service client care.',
      marketDifferentiation:
        'Stands in sharp contrast against informal freelancers who operate without booking contracts, arrive late with excuses, or quote arbitrary prices in DMs.',
      brandPromise:
        'Every appointment executed with immaculate attention, zero hidden surprises, and your complete peace of mind guaranteed.',
      brandVoice: {
        tone: 'Warm, respectful, polished, culturally confident, and prompt.',
        vocabulary: ['Verified standard', 'On-time guarantee', 'Bespoke attention', 'Seamless booking', 'Tailored consultation'],
        communicationDos: [
          'Send written appointment confirmations with location map, date, and invoice breakdown within 10 minutes of booking.',
          'Provide transparent upfront pricing rather than hiding rates behind "DM for price".',
          'Send a polite 24-hour reminder message with prep instructions for the client.',
        ],
        communicationDonts: [
          'Never arrive late to client locations without proactive communication at least 1 hour in advance.',
          'Never demand unexpected additional fees on-site after quoting a flat rate.',
          'Avoid defensive replies when clients request revisions or clarifications.',
        ],
      },
    },
    marketStrategy: {
      priceTierAnalysis:
        'Positioned in the Upper-Accessible Professional SME tier. In the current Nigerian economy, high-earning individuals and corporate clients willingly pay 30-50% margins above street freelancers when guaranteed reliability, clean contracts, and immaculate execution.',
      trustBuildingTactics: [
        'Live Client Onboarding Sheet: Transparent 3-step booking flow (Consultation -> 50% Commitment Deposit -> Final Delivery).',
        'Video Case Studies: Short 20-second Instagram/TikTok before-and-after client transformations with genuine audio feedback.',
        'Official CAC & Professional Registration badge displayed prominently on WhatsApp Business catalog and rate cards.',
      ],
      channelStrategy:
        'Primary client acquisition: Instagram Reels & TikTok portfolio showcases targeting Lagos Island/Mainland, Abuja, and Port Harcourt, leading into an automated WhatsApp Business catalog where clients receive transparent rate cards and instant consultation scheduling.',
      locationSpecificTactics: [
        {
          region: 'Lagos Commercial Corridor (Island & Mainland)',
          tactics: 'Define clear logistics travel tiers (Island vs Mainland dispatch fees); offer early-morning home services for brides and corporate clients before traffic congestion.',
        },
        {
          region: 'Federal Capital Territory (Abuja) & North Central',
          tactics: 'Target corporate diplomats, high-level civil servants, and luxury event hosts in Maitama, Wuse 2, and Guzape; emphasize discreet, immaculate execution and official invoicing.',
        },
        {
          region: 'South East & South South Hubs (Port Harcourt, Aba, Onitsha)',
          tactics: 'Offer destination packages for festive seasons, traditional marriage celebrations, and corporate galas; provide multi-day retainer discounts.',
        },
      ],
    },
    qualityAudit: {
      photoObservations: 'Client portfolio exhibits verified high-end finish, organized booking touchpoints, and clear service deliverables.',
      userSuppliedData: 'Client supplied service description, target customers, and operational scope.',
      groundedClaimsPolicy: 'AUDIT PASSED: Service recommendations focus on verified client experience and transparent communication. No unverified certifications or fabricated credentials have been invented.',
      cohesionScore: 98,
      consistencyReview: 'Harmonious alignment between luxury colour palette, client-first positioning, and WhatsApp booking workflows.',
      pitfallsToAvoid: [
        'The "DM for Price" Friction: Hiding service rates on social media loses over 65% of high-intent corporate and bridal clients who value transparency.',
        'Vague Booking Policies: Failing to secure a written 50% non-refundable deposit leads to last-minute client ghosting and lost calendar dates.',
        'Informal Communication: Sending quotes via messy WhatsApp voice notes instead of formatted PDF or branded text summaries diminishes perceived expertise.',
      ],
      packagingAndDisplayAdvice:
        'SERVICE ONBOARDING STANDARDS: Deliver all proposals, invoices, and service agreements in beautifully branded PDF format with your hex colours. Send clients a post-service thank-you note on WhatsApp with a direct Google Review / WhatsApp review link within 2 hours of completion.',
    },
    typographyRecommendation: {
      headerFont: 'Plus Jakarta Sans Bold (or Cabinet Grotesk)',
      bodyFont: 'Inter or General Sans',
      styleNote: 'Modern, balanced typography that exudes executive authority and effortless legibility across mobile screens.',
    },
    idealCustomerPersona: {
      name: 'Dr. Chioma Eke',
      ageRange: '28 - 45 years old',
      location: 'Lekki Phase 1, Lagos & Wuse 2, Abuja',
      painPoint: 'Tired of unpunctual, disorganized service providers who cancel last-minute or deliver sloppy work after collecting deposits.',
      whyTheyBuy: 'Prioritizes punctuality, seamless WhatsApp booking, and guaranteed peace of mind over cheap street alternatives.',
    },
  },
  serviceStrategy: {
    clientOnboardingAndExperience:
      'Seamless 3-Touchpoint Client Journey: 1. Inquiry response within 15 minutes with structured Rate Card; 2. 50% deposit to lock calendar date with formal digital receipt; 3. 24h pre-service prep checklist and punctual service execution followed by a prompt review request.',
    trustAndDepositPolicy:
      'Clear 50% non-refundable commitment deposit policy that reserves the exclusive time slot, with free rescheduling permitted up to 72 hours prior to the appointment. Written service guarantees protect both client and vendor.',
    retentionAndReferralTactics: [
      'The "Lover of Quality" Client Loyalty Perk: 15% discount on the 3rd booking or complimentary upgrade.',
      'Wedding / Event Host Referral Bonus: ₦10,000 cash credit or free service add-on for every successfully booked referral.',
      'Quarterly Milestone Check-In: Personalized WhatsApp greeting on birthdays or client company anniversaries with priority booking access.',
    ],
    servicePackages: [
      {
        name: 'The Essential Starter Session',
        targetClient: 'First-time clients seeking immediate, high-standard execution for a single event or need.',
        deliverables: 'Full service consultation, priority execution, standard materials/prep, and 24h post-service support.',
        pricingAdvice: 'Positioned as an accessible introductory tier to build trust and demonstrate unmatched reliability.',
      },
      {
        name: 'The Signature VIP Experience',
        targetClient: 'High-stake celebrations, weddings, corporate shoots, or full-day bespoke requirements.',
        deliverables: 'Dedicated lead specialist, on-location setup, extended touch-ups, premium kit/equipment, and complimentary add-on.',
        pricingAdvice: 'Highest-margin tier; bundles complimentary perks to maximize perceived luxury value.',
      },
      {
        name: 'The Retainer / Ongoing Growth Partner',
        targetClient: 'Busy professionals, online vendors, or corporate brands requiring recurring monthly service.',
        deliverables: 'Guaranteed monthly quota, dedicated calendar priority, 24/7 direct WhatsApp access, and quarterly strategy review.',
        pricingAdvice: 'Billed monthly with 10% prepayment incentive to create stable, recurring cash flow.',
      },
    ],
    whatsAppBookingFlow: {
      inquiryGreeting:
        'Hello! Welcome to Aura Luxe Atelier. 🌿✨ Thank you for reaching out to us. We’re delighted to assist you with bespoke service tailored to perfection.',
      qualifyingQuestions: [
        'What specific service or package are you looking to book?',
        'What is your preferred date, time, and service location (studio or on-site)?',
        'Do you have any specific requirements or inspiration preferences we should know about?',
      ],
      depositConfirmationNotice:
        '🎉 Your booking date is confirmed! We have received your 50% commitment deposit of [₦Amount]. Your exclusive time slot is locked in. Our team will arrive/connect at exactly [Time] on [Date].',
      postServiceReviewPrompt:
        'Thank you so much for trusting us with your service today! It was an absolute pleasure working with you. Could you kindly share a brief 1-minute review of your experience? Your feedback means the world to our team! ⭐⭐⭐⭐⭐',
    },
  },
  marketingCaptions: {
    english: [
      {
        title: 'Overcoming Vendor Anxiety (Trust & Craft)',
        hook: 'Tired of vendors who arrive late or deliver excuses instead of excellence? 🌿✨',
        body: 'At Aura Luxe Atelier, we believe your peace of mind is just as important as the final result. From transparent upfront pricing to guaranteed on-time arrival and bespoke attention to every detail, we treat your time and investment with the utmost respect. Experience service the way it was meant to be.',
        callToAction: 'Click the link in bio or message our WhatsApp catalog to check availability for your date.',
        hashtags: ['#NigerianServicePro', '#ReliableVendor', '#LagosSME', '#AbujaEvents', '#ServiceExcellence'],
      },
      {
        title: 'The VIP Experience Spotlight',
        hook: 'Why our clients never look for another service provider once they work with us. 👑',
        body: 'Excellence is not an accident—it’s our daily standard. Whether you’re preparing for a once-in-a-lifetime milestone or need dependable monthly support, our signature packages are designed to make you feel like royalty from consultation to completion.',
        callToAction: 'Send us a WhatsApp message today to receive our comprehensive 2026 Service Menu.',
        hashtags: ['#BespokeService', '#LuxuryExperience', '#NaijaVendor', '#QualityFirst'],
      },
      {
        title: 'Limited Calendar Availability',
        hook: 'Weekend slots for this month are filling up fast! ⏳📅',
        body: 'To ensure every client receives our undivided personal attention, we strictly limit the number of bookings we accept each week. Don’t wait until the last minute—lock in your date now with a 50% commitment deposit and relax knowing you’re in expert hands.',
        callToAction: 'Tap our WhatsApp link to reserve your preferred time slot before it’s gone.',
        hashtags: ['#BookNow', '#EarlyBird', '#WeekendGlam', '#EventPlanningNaija'],
      },
    ],
    pidgin: [
      {
        title: 'Zero Story ("No Be Hype")',
        hook: 'You don tire for vendor wey go tell you say "traffic hold me" when time don reach? 🇳🇬🔥',
        body: 'No be today we know say reliable person hard to find! For Aura Luxe Atelier, our word na our bond. When you book us, just go relax mind—we dey arrive sharp sharp, do the job clean pass clean, and make sure say smile full your face. Quality service with zero headache!',
        callToAction: 'Holla us for WhatsApp make we arrange your slot sharp sharp!',
        hashtags: ['#NoStories', '#NaijaService', '#OriginalVendor', '#LagosHustle'],
      },
      {
        title: 'Standard Wey Sure ("Better Value")',
        hook: 'Quality service wey go make your people ask: "Ah ah, which pro handle this thing for you?" ✨',
        body: 'We no dey cut corner for here! From the way we take welcome you to the clean finishing wey we dey deliver, na grade one work throughout. Good service no suppose be stress!',
        callToAction: 'Send us WhatsApp message today make we give you our full rate card!',
        hashtags: ['#BetterQuality', '#NaijaVendor', '#NoCarryLast', '#PureStandard'],
      },
      {
        title: 'Fast Booking ("No Delay")',
        hook: 'Dates dey move like breeze! Lock your slot before another person carry am. 🏃‍♂️💨',
        body: 'If you get event or project wey dey come up, abeg no wait till last minute. Send message enter our WhatsApp right now, secure your date with simple deposit, and let the professionals handle the rest.',
        callToAction: 'Chat with our team for WhatsApp now—link dey bio!',
        hashtags: ['#FastFast', '#SharpBooking', '#NaijaBrand'],
      },
    ],
  },
  advertisingConcepts: {
    instagramCarousel: {
      title: 'The Zero-Stress Service Storyboard',
      slide1Hook: 'Slide 1: "The 3 biggest mistakes people make when hiring service providers in Nigeria (and how to avoid them)."',
      slide2Value: 'Slide 2: Split carousel showing our clear written contracts, transparent pricing in ₦, and guaranteed on-time arrival checklist.',
      slide3SocialProof: 'Slide 3: Real client WhatsApp testimonials and before-and-after transformation photos/videos.',
      slide4CTA: 'Slide 4: "Ready for stress-free service? Click link in bio to chat directly on WhatsApp & claim your booking perk."',
    },
    tiktokReelConcept: {
      hookVisual: 'Fast-paced ASMR / Behind-the-scenes video showing our clean setup, professional tools, and meticulous execution in under 15 seconds.',
      audioSuggestion: 'Mid-tempo trending Nigerian Afrobeats instrumental (uplifting, clean luxury vibe).',
      script15s: '0-3s: "POV: You booked a Nigerian service vendor and they actually arrived 15 minutes early."\n3-8s: Quick cuts of precision work and client smiling.\n8-12s: Final breathtaking reveal.\n12-15s: "Link in bio to book your session!"',
      onScreenText: 'Punctual • Professional • Bespoke Quality 🇳🇬',
    },
    whatsappStatusSequence: [
      {
        part: 'Part 1: The Transformation Hook',
        text: 'Behind the scenes at today’s session! Client wanted pure perfection with zero stress, and that’s exactly what we delivered. 🌿✨',
        visualTip: 'Short 5-second video clip of active service execution.',
      },
      {
        part: 'Part 2: Real Client Feedback',
        text: 'When our client sent this message 30 minutes after we wrapped up... 🥹 "Thank you for being so punctual and professional!"',
        visualTip: 'Screenshot of real glowing WhatsApp client feedback message with names blurred.',
      },
      {
        part: 'Part 3: Limited Availability CTA',
        text: 'Only 3 slots remaining for this upcoming weekend! Send a DM or reply to this status to lock in your date before the schedule closes. ⏳',
        visualTip: 'Clean flyer with brand colours and WhatsApp phone number.',
      },
    ],
    promoOfferIdeas: [
      'Early-Bird Booking Privilege: 10% off service rate when booked at least 14 days in advance.',
      'VIP Bridal / Event Bundle: Book full package and receive complimentary pre-event consultation and touch-up kit.',
      'Corporate Loyalty Retainer: Save 15% when paying monthly retainer upfront for ongoing weekly services.',
      'Referral Rewards Program: ₦10,000 cash credit or free add-on service for every verified friend referred.',
    ],
  },
};
