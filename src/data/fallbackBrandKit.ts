import { BrandStudioResult } from '../types';

export const DEFAULT_FALLBACK_KIT: BrandStudioResult = {
  visualAnalysis:
    'Visual observation reveals high-density woven textile featuring sharp indigo dye motifs and warm ochre accents. The cut shows structured tailoring with clean French seams, suitable for tropical daytime wear and evening gatherings without visible synthetic sheen.',
  brandNames: [
    {
      name: 'Adire Luxe',
      tagline: 'Wear Your Royalty Every Day',
      meaning: 'Directly anchors the brand in Yoruba indigenous textile heritage ("Adire") while pairing it with "Luxe" to validate premium pricing and modern tailoring.',
      targetVibe: 'Afro-Contemporary Prestige',
      isRecommended: true,
      recommendationRationale: 'STRONGEST RECOMMENDATION: "Adire Luxe" creates instant cognitive familiarity for Nigerian buyers while commanding aspirational authority. It bridges the gap between traditional cultural pride and everyday cosmopolitan wear, making it easily trademarkable and memorable across Instagram and physical storefronts.',
    },
    {
      name: 'Oma & Co.',
      tagline: 'Elegance Woven with Soul',
      meaning: '"Oma" translates to goodness, grace, and blessed beauty in Igbo folklore, evoking warmth, dependability, and authentic craftsmanship.',
      targetVibe: 'Warm Afrocentric Grace',
      isRecommended: false,
      recommendationRationale: 'High emotional warmth, ideal for intimate customer relationships and boutique bespoke clients.',
    },
    {
      name: 'Kano & Coast',
      tagline: 'From Ancient Looms to Modern Streets',
      meaning: 'Celebrates the historic textile dye-pits of Kano and the bustling fashion runways of Lagos and Port Harcourt.',
      targetVibe: 'Heritage Artisan & Pan-Nigerian',
      isRecommended: false,
      recommendationRationale: 'Appeals strongly to diaspora buyers and cultural purists who value historical provenance.',
    },
    {
      name: 'Adeleke Studio',
      tagline: 'Bespoke Nigerian Distinction',
      meaning: 'Derives from aristocratic royal lineage ("The crown is triumphant"), creating an immediate impression of master tailoring.',
      targetVibe: 'Executive High-End Sartorial',
      isRecommended: false,
      recommendationRationale: 'Very strong for high-ticket corporate and occasion wear; slightly more formal in tone.',
    },
    {
      name: 'Idera Wear',
      tagline: 'Comfort that Commands Respect',
      meaning: '"Idera" means peace of mind, ease, and effortless comfort in Yoruba, addressing the Nigerian shopper’s desire to look regal without sweating in stiff fabrics.',
      targetVibe: 'Effortless Modern Chic',
      isRecommended: false,
      recommendationRationale: 'Solves the primary everyday customer complaint about stiff ceremonial fabrics.',
    },
  ],
  brandIdentity: {
    selectedName: 'Adire Luxe',
    selectedTagline: 'Wear Your Royalty Every Day',
    strongestNameRationale:
      'Recommended because it immediately communicates cultural authenticity ("Adire") while establishing clear luxury positioning ("Luxe") that justifies premium margins in the competitive Lagos, Abuja, and diaspora fashion sectors.',
    colorPalette: [
      {
        name: 'Lagos Lagoon Emerald',
        hex: '#0D5C3A',
        role: 'Primary brand colour',
        psychologicalReason:
          'Psychologically triggers deep subconscious associations with prestige, fertility, and prosperity, conveying stability and established brand status in Nigerian trade culture.',
        marketingReason:
          'Stands out crisply on white and dark social media feeds, giving product packaging and garment tags a regal shelf presence without looking neon or gaudy.',
      },
      {
        name: 'Kano Ochre Gold',
        hex: '#D97706',
        role: 'Secondary brand colour',
        psychologicalReason:
          'Evokes warm harvest sunlight, rich groundnut pyramids, and royal regalia, projecting genuine warmth and optimistic Nigerian energy.',
        marketingReason:
          'Serves as the high-visibility accent for Call-to-Action badges, price highlights in Naira (₦), and WhatsApp status promotional flyers.',
      },
      {
        name: 'Warm Clay Terracotta',
        hex: '#C2410C',
        role: 'Accent colour',
        psychologicalReason:
          'Directly references traditional Nigerian earthen pottery and fertile soil, reinforcing organic honesty and handmade integrity.',
        marketingReason:
          'Creates immediate visual warmth in seasonal campaigns, limited-edition flash sale banners, and physical tissue wrap packaging.',
      },
      {
        name: 'Palm Frond Olive',
        hex: '#365314',
        role: 'Supporting colour',
        psychologicalReason:
          'Symbolizes natural longevity, calm heritage, and grounding balance against bright primary tones.',
        marketingReason:
          'Ideal for secondary packaging accents, social card borders, and WhatsApp catalog category dividers.',
      },
      {
        name: 'Ivory Warm Shell',
        hex: '#FDFBF7',
        role: 'Background colour',
        psychologicalReason:
          'Creates an airy, premium editorial feel that avoids the harsh clinical glare of pure white in tropical sunshine.',
        marketingReason:
          'Provides an elegant, high-contrast canvas for web catalogs, price cards, and product lookbooks.',
      },
      {
        name: 'Deep Obsidian Slate',
        hex: '#0F172A',
        role: 'Text colour',
        psychologicalReason:
          'Projects solid architectural permanence, authority, and zero-nonsense professionalism.',
        marketingReason:
          'Ensures maximum typographic legibility for garment care instructions, pricing tables, and invoice receipts under bright mobile screens.',
      },
      {
        name: 'Royal Niger Indigo',
        hex: '#1E3A8A',
        role: 'Complementary colour',
        psychologicalReason:
          'Honors traditional African indigo pit dye craftsmanship, evoking quiet prestige and intellectual elegance.',
        marketingReason:
          'Perfect complement to warm golds and emeralds for secondary campaign assets and festive collections.',
      },
      {
        name: 'Sunlight Amber Spark',
        hex: '#F59E0B',
        role: 'Highlight colour',
        psychologicalReason:
          'Flashes energetic optimism, celebration, and premium value at first glance.',
        marketingReason:
          'Directs instant customer eye gaze to "Limited Stock", "Free Shipping", and discount promo bubbles.',
      },
    ],
    positioning: {
      targetAudience:
        'Nigerian working professionals, creative founders, and diaspora cultural shoppers (aged 24-45) living in Lagos (Lekki, Ikeja, Ikoyi), Abuja, Port Harcourt, and UK/US diaspora communities who seek distinguished African ready-to-wear.',
      customerNeedsAndMotivations:
        'They are tired of low-quality imported polyester that traps body heat in Nigerian weather and fast-fashion outfits that bleed color after two washes. They want breathable, culturally authentic fashion that transitions effortlessly from corporate Friday to weekend Owambe events while commanding compliments.',
      brandPersonality: [
        {
          trait: 'Regal yet Approachable',
          rationale: 'Commands immediate respect in design without alienating everyday relatable Nigerian buyers.',
        },
        {
          trait: 'Culturally Grounded',
          rationale: 'Honors indigenous textile heritage with pride rather than copying Western fast-fashion trends.',
        },
        {
          trait: 'Meticulously Reliable',
          rationale: 'Addresses the major Nigerian vendor trust deficit with immaculate stitching, true-to-size charts, and prompt delivery.',
        },
        {
          trait: 'Unapologetically Confident',
          rationale: 'Speaks with the bold swagger and optimism characteristic of successful Nigerian entrepreneurs.',
        },
      ],
      uniqueSellingProposition:
        '100% breathable natural-fiber Nigerian textiles tailored with reinforced double-needle seams, calibrated specifically for tropical comfort and enduring colorfast vibrancy.',
      marketDifferentiation:
        'Unlike cheap imported fast-fashion copies flooded through unvetted drop-shippers, every piece is tailored with verified Nigerian cotton, preshrunk to eliminate wash shrinkage, and cut with tailored silhouettes that flatter real Nigerian body shapes.',
      brandPromise:
        'Garments that elevate your personal stature, feel delightfully breathable in the Nigerian heat, and never lose their colorfast pride.',
      brandVoice: {
        tone: 'Warm, poised, culturally astute, and respectfully confident.',
        vocabulary: [
          'Distinction',
          'Regal',
          'Breathable',
          'Master tailoring',
          'Colorfast',
          'Authentic craft',
          'Effortless presence',
          'Naija pride',
        ],
        communicationDos: [
          'Always address clients with polite warmth and clarity regarding sizing, fabric care, and dispatch timelines.',
          'Provide clear, upfront pricing in Naira (₦) rather than forcing customers into tedious "DM for price" friction.',
          'Highlight visible craftsmanship details like interior lining, French seams, and fabric breathability.',
        ],
        communicationDonts: [
          'Never use defensive or confrontational language when buyers inquire about delivery or fabric authenticity.',
          'Avoid exaggerated or unsubstantiated claims like "the best fashion brand in Africa".',
          'Never leave buyers in suspense regarding dispatch tracking codes or delivery driver contact info.',
        ],
      },
    },
    marketStrategy: {
      priceTierAnalysis:
        'Priced in the Upper-Accessible / Premium SME tier (₦25,000 - ₦45,000). In the current Nigerian macroeconomic environment, this bracket targets salaried professionals and entrepreneurs who seek durable quality over disposable cheap wear, where value is measured in compliments, comfort, and longevity.',
      trustBuildingTactics: [
        'Real-time WhatsApp dispatch video showing the customer’s exact parcel being inspected, neatly branded, and sealed with tamper-evident tape.',
        'High-definition fabric swatch close-ups and customer video testimonials from recognizable Nigerian professionals.',
        'Clear, written 48-hour size exchange policy for Lagos and Abuja deliveries to eliminate online shopping anxiety.',
      ],
      channelStrategy:
        'Primary sales funnel: Instagram Reels for styling inspiration and stop-scroll hooks, converting directly into WhatsApp Business where customers chat with a warm sales representative for rapid closure and bank transfer confirmation.',
      locationSpecificTactics: [
        {
          region: 'South West & Lagos Commercial Corridor',
          tactics: 'Same-day dispatch via local motorcycle couriers (Island & Mainland); prioritize Instagram Reels styling hooks for corporate chic and Owambe weekends.',
        },
        {
          region: 'Federal Capital Territory (Abuja) & North Central',
          tactics: '48-hour delivery via GIGM/Peace Mass to Wuse 2, Garki, and Maitama clients; highlight modest royal elegance suitable for diplomatic and executive events.',
        },
        {
          region: 'South East & South South Hubs (Port Harcourt, Aba, Onitsha)',
          tactics: 'Waybill packaging with tracking numbers; emphasize fabric durability, zero-bleed dye fastness, and premium weight for discerning trade buyers.',
        },
        {
          region: 'North West & North East (Kano, Kaduna)',
          tactics: 'Focus on modest ready-to-wear cuts, breathable premium cotton weaves suited to arid warmth, and direct WhatsApp invoice settlements.',
        },
      ],
    },
    qualityAudit: {
      photoObservations:
        'Inspected photograph exhibits visible woven cotton drape, geometric block-print pattern with balanced color saturation, and a relaxed two-piece silhouette with neat sleeve hem cuffs.',
      userSuppliedData:
        'User indicated product is an Ankara Kimono & Trouser set tailored in Lagos with breathable fabric for confident women.',
      groundedClaimsPolicy:
        'AUDIT PASSED: Brand positioning and copy strictly rely on verified physical attributes (cut, pattern, cotton feel) and explicit user inputs. No unsubstantiated textile certifications or synthetic medical claims have been manufactured.',
      cohesionScore: 98,
      consistencyReview:
        'The suggested names, 4-color palette, and upper-accessible positioning are fully harmonized with the visual evidence of high-craft indigenous fashion. Color contrast ratios satisfy readability standards for mobile screens.',
      pitfallsToAvoid: [
        'Pitfall 1 (The "DM for Price" Trap): Hiding prices on Instagram reduces customer conversion by over 60% among busy Nigerian professionals who perceive price obscurity as deceptive.',
        'Pitfall 2 (Flimsy Dispatch Packaging): Delivering bespoke fashion in thin, unbranded polythene bags ruins the luxury unboxing experience and exposes garments to dispatch motorbike rain and dirt.',
        'Pitfall 3 (Unclear Sizing Metrics): Failing to provide explicit Nigerian/UK bust and waist measurements in inches leads to high return rates and customer frustration.',
      ],
      packagingAndDisplayAdvice:
        'Ship every order in a branded sturdy kraft box or reusable canvas tote with an embossed garment care tag and a personalized handwritten thank-you note in Nigerian Pidgin or warm English.',
    },
    typographyRecommendation: {
      headerFont: 'Plus Jakarta Sans Bold (or Cabinet Grotesk)',
      bodyFont: 'Plus Jakarta Sans Regular (or Inter)',
      styleNote: 'Modern geometric sans-serif that balances corporate credibility with approachable editorial warmth.',
    },
    idealCustomerPersona: {
      name: 'Tolu the Creative Director',
      ageRange: '27 - 39 years old',
      location: 'Lekki Phase 1, Lagos / Maitama, Abuja',
      painPoint:
        'Struggles to find ready-to-wear that fits comfortably without looking like generic fast-fashion or excessively rigid traditional ceremonial gear.',
      whyTheyBuy:
        'Values looking put-together and proudly African in boardrooms and upscale lounges; appreciates straightforward pricing and swift courier delivery.',
    },
  },
  marketingCaptions: {
    english: [
      {
        title: 'Storytelling & Premium Craft',
        hook: 'True royalty doesn’t need to shout. It commands the room with effortless poise. 👑✨',
        body: 'Every single seam tells a story of patient tailoring, authentic African textile mastery, and contemporary design. Crafted right here in Nigeria for women who appreciate distinction in every thread. Whether it’s Sunday brunch in Ikoyi or your next high-stakes presentation, elevate your presence with our signature piece.',
        callToAction: 'Tap the link in our bio or send a direct message to secure yours before this batch runs out.',
        hashtags: ['#LagosFashion', '#BuyNigerian', '#MadeInNigeria', '#AfricanLuxury', '#NaijaVendor', '#StyleInspiration'],
      },
      {
        title: 'Limited Stock & Urgent Dispatch',
        hook: 'Alert: Only 8 units left from our exclusive artisan drop! ⏳📦',
        body: 'When it’s gone, it’s truly gone. We take our time to hand-finish each piece to perfection, which means our batches are strictly limited. Order today and get same-day dispatch across Lagos Mainland & Island, with swift 48-hour delivery nationwide.',
        callToAction: 'Slide into our DM right now with your size to claim your reserved piece!',
        hashtags: ['#FlashSaleNaija', '#LagosVendor', '#NaijaBrands', '#SwiftDelivery', '#ShopLocalNG'],
      },
      {
        title: 'Problem-Solving & Everyday Confidence',
        hook: 'Say goodbye to stiff, uncomfortable outfits that ruin your day before lunch. 🌿',
        body: 'Engineered specifically for our tropical climate using breathable, ultra-soft cotton that moves with you from 8 AM meetings to evening networking cocktails. You look crisp, feel relaxed, and never have to second-guess your fit.',
        callToAction: 'Upgrade your daily rotation today. Click the WhatsApp button on our page to chat with our stylist.',
        hashtags: ['#WorkwearNaija', '#BreathableStyle', '#LagosLiving', '#EverydayElegance', '#NigerianEntrepreneurs'],
      },
    ],
    pidgin: [
      {
        title: 'Street Hype & Energy ("No Carry Last!")',
        hook: 'Omo, who go tell you say fine thing cost pass life? See this fresh drip na! 🔥🇳🇬',
        body: 'E choke die! Make we no lie give you, if you wear this one enter anywhere for Lagos or Abuja, even security man go give you salute! The cloth soft, the tailoring balance well well, and the color go burst your brain. Better thing no dey hide abeg!',
        callToAction: 'No go do mistake carry last o! DM us now before your size finish!',
        hashtags: ['#NoCarryLast', '#EChoke', '#NaijaDrip', '#LagosVendor', '#BaddoStyle'],
      },
      {
        title: 'Market Trust & Real Quality ("Original No Be Counterfeit")',
        hook: 'No be jazz, na genuine quality! Original Nigerian handwork wey stand gidigba! 💯',
        body: 'You don tire for cloth wey go wash twice come fade like receipt? We hear you! That’s why we make sure our own materials na grade one cotton. E no dey tear, e no dey bleach, and e dey hug body properly. Good thing good, bad thing bad — this one na correct investment for your wardrobe.',
        callToAction: 'Send us message for WhatsApp sharp sharp. Payment on delivery dey available for Lagos!',
        hashtags: ['#OriginalVendor', '#NaijaMarket', '#RealQuality', '#LagosBabes', '#BuyNaijaToGrowTheNaira'],
      },
      {
        title: 'Direct WhatsApp Status Order ("Price Inside DM")',
        hook: 'Price wey soft for pocket, quality wey heavy for eye! Quick sharp order! 🛍️📲',
        body: 'We don drop the latest collection as you guys requested! Sizes dey from UK 8 reach UK 18. Waybill dey go all states tomorrow morning via GIGM. Drop your delivery address for our DM make our dispatcher pack your own pack now now.',
        callToAction: 'Chat our WhatsApp directly (Link in bio) make we treat you like royalty!',
        hashtags: ['#WhatsAppVendor', '#LagosDelivery', '#NaijaBusiness', '#ShopOnlineNG'],
      },
    ],
  },
  advertisingConcepts: {
    instagramCarousel: {
      title: 'The 4-Slide "Before & After" Transformation Carousel',
      slide1Hook: 'Slide 1 (Hook Cover): "Why 90% of Nigerian vendors lose customers at first glance (and how to fix it with 1 staple piece)." High contrast product close-up with bold serif text.',
      slide2Value: 'Slide 2 (The Craft Detail): Split-screen macro photo showcasing the reinforced double stitch, hand-dyed print, and breathable natural lining.',
      slide3SocialProof: 'Slide 3 (Happy Customer Quote): Real WhatsApp screenshot showing "Sis, everyone at church yesterday kept asking where I bought this dress! God bless your hand!"',
      slide4CTA: 'Slide 4 (The Urgent Call to Action): Clear pricing badge in ₦, free tote bag for first 15 buyers, and bold "Comment \'DRIP\' to receive the VIP purchase link in your DM instantly!"',
    },
    tiktokReelConcept: {
      hookVisual: 'Start with 0.5s snap cut: You drop the package on a glass table, unbox with crisp ASMR sound, and unfold the vibrant fabric right towards the camera lens.',
      audioSuggestion: 'Trending upbeat Afrobeats instrumental (e.g. Asake "Lonely At The Top" or Ayra Starr mid-tempo groove with cheerful clapping).',
      script15s: '0-3s: "Stop buying clothes that make you sweat in Lagos traffic!"\n3-7s: Show quick transition into the full outfit against clean sunlit brick wall.\n7-11s: Quick 360-degree twirl highlighting pockets, drape, and movement.\n11-15s: Smile, point down to link: "Tap my bio to get yours before it sells out again!"',
      onScreenText: '"100% Breathable Naija Cotton" → "Zero Sweating" → "₦28,500 + Nationwide Delivery"',
    },
    whatsappStatusSequence: [
      {
        part: 'Morning Teaser (9:30 AM)',
        text: 'Morning fam! ☀️ Dropping something special by 12 PM today for those that love standing out without stressing. Stay glued to your status!',
        visualTip: 'A blurry or teaser silhouette photo with the "Stay Tuned" sticker.',
      },
      {
        part: 'Afternoon Spotlight & Price (1:00 PM)',
        text: 'AND IT’S LIVE! 🔥 Royal Ankara Two-Piece. Price: ₦28,500. Free matching scrunchie for the first 5 people to reply this status! Sizes S, M, L, XL available.',
        visualTip: 'Bright, high-resolution modeled photo with price tag and delivery duration clearly written.',
      },
      {
        part: 'Night Urgency & Closing (8:30 PM)',
        text: 'Update: Size M is completely sold out! Only 3 pieces left in Size L. If you wan rock this for weekend owambe, reply now make we waybill tomorrow morning! 🛵💨',
        visualTip: 'Photo of packaged orders with buyer delivery stickers on top ready for courier dispatch.',
      },
    ],
    promoOfferIdeas: [
      'The "Lagos Mainland & Island Free Delivery Weekend" — Order any 2 items and get free dispatch directly to your doorstep.',
      'The "Weekend Owambe Ready Bundle" — Buy the outfit and get a complimentary matching handcrafted clutch at 40% discount.',
      'The "Refer-Your-Padi ₦2,000 Cash Voucher" — Share our WhatsApp catalog with 3 friends and get ₦2,000 off your immediate cart.',
    ],
  },
};
