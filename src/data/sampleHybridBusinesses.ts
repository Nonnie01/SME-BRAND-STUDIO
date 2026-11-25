import { SampleHybridBusiness } from '../types';

export const SAMPLE_HYBRID_BUSINESSES: SampleHybridBusiness[] = [
  {
    id: 'hybrid-beauty-hair',
    businessType: 'hybrid',
    brandName: 'DivaLuxe Salon & Haircare',
    industryCategory: 'Beauty, Haircare & Salon Services',
    businessDescription:
      'A luxury hair studio providing bespoke lace wig installation, chemical-free hair revamping, and bridal styling, paired with an in-house retail line of 100% cold-pressed organic herbal growth elixirs, edge tamers, and silk sleep bonnets.',
    targetCustomers:
      'Professional Nigerian women, corporate chic executives, brides, and students who want salon-quality hair transformations and dependable take-home maintenance products.',
    businessLocation: 'Lekki Phase 1, Lagos (Nationwide Product Delivery)',
    selectedRegions: ['Lagos', 'Federal Capital Territory (Abuja)', 'Rivers', 'Oyo'],
    brandTone: 'Afro-Luxury & Regal',
    badge: 'Dual Glam & Haircare',
    logoOrAssetUrl:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',

    // Product
    productName: 'DivaLuxe Cold-Pressed Herbal Hair Growth Elixir (100ml)',
    productDescription:
      'Infused with authentic Chadian Chebe powder, Nigerian castor oil, peppermint, and rosemary extract. Formulated specifically to restore damaged hairlines and retain moisture in tropical weather.',
    productPrice: '₦8,500',
    productCategory: 'Haircare and cosmetics',
    productImageUrl: '/samples/hair-elixir.jpg',

    // Service
    serviceName: 'Bespoke Frontal Installation & Scalp Revitalization Treatment',
    serviceDescription:
      'HD lace customization, bleaching of knots, glueless/adhesive installation, scalp exfoliation, and custom wand styling with guaranteed 4-week hold.',
    serviceCategory: 'Beauty and Personal Care',
    serviceDeliveryMethod: 'hybrid',
    servicePriceOrPackages: '₦35,000 / session (VIP Home Service available for ₦55,000)',
  },
  {
    id: 'hybrid-fashion-tailoring',
    businessType: 'hybrid',
    brandName: 'Zaria Heritage Couture & Academy',
    industryCategory: 'Fashion Design & Bespoke Tailoring',
    businessDescription:
      'An upscale Nigerian atelier delivering custom Senator suits, bespoke Agbada embroidery, and couture bridal dresses, alongside a fast-selling ready-to-wear casual Ankara collection and practical fashion pattern-drafting training.',
    targetCustomers:
      'Style-conscious men and women, wedding guests (Owambe), corporate executives, and fashion apprentices across Nigeria and the UK/US diaspora.',
    businessLocation: 'Wuse 2, Abuja & Victoria Island, Lagos',
    selectedRegions: ['Federal Capital Territory (Abuja)', 'Lagos', 'Kano', 'Kaduna', 'Rivers'],
    brandTone: 'Afro-Luxury & Regal',
    badge: 'Couture & Ready-To-Wear',
    logoOrAssetUrl:
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',

    // Product
    productName: 'Zaria Signature Unisex Silk-Ankara Resort Shirt',
    productDescription:
      'Tailored with breathable pure cotton and hand-selected Dutch wax print accents. Styled for effortless elegance in Lagos heat or casual Sunday relaxation.',
    productPrice: '₦19,500',
    productCategory: 'Fashion and clothing',
    productImageUrl:
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',

    // Service
    serviceName: 'Master Bespoke Senator / Agbada Tailoring with Fitting Guarantee',
    serviceDescription:
      'Precise 22-point body measurements, premium wool/cashmere fabric sourcing, computerised chest embroidery, and guaranteed 5-day delivery with free doorstep fitting alteration.',
    serviceCategory: 'Creative and Media Services',
    serviceDeliveryMethod: 'hybrid',
    servicePriceOrPackages: '₦55,000 - ₦140,000 per bespoke outfit',
  },
  {
    id: 'hybrid-wellness-nutrition',
    businessType: 'hybrid',
    brandName: 'NaijaFit Wellness & Nutrition',
    industryCategory: 'Health, Wellness & Spa Services',
    businessDescription:
      'A holistic Nigerian wellness enterprise providing 1-on-1 virtual nutrition consultation, postpartum fitness coaching, and holistic spa therapy, backed by an indigenous packaged retail range of herbal detox slimming teas and tiger-nut energy granola.',
    targetCustomers:
      'Busy working professionals, new mothers, and health-conscious Nigerians in Lagos, Abuja, and Port Harcourt seeking sustainable, non-starvation wellness.',
    businessLocation: 'Garki 2, Abuja & Lekki, Lagos',
    selectedRegions: ['Federal Capital Territory (Abuja)', 'Lagos', 'Rivers', 'Delta', 'Edo'],
    brandTone: 'Warm, Trusted & Heartfelt',
    badge: 'Coaching & Organic Pantry',
    logoOrAssetUrl:
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',

    // Product
    productName: 'NaijaFit Roasted Tiger-Nut & Chia Seed Protein Granola (400g)',
    productDescription:
      'Crunchy, naturally sweet blend of roasted northern Nigerian tiger-nuts, pumpkin seeds, honey, and cinnamon. 100% refined sugar-free and preservative-free.',
    productPrice: '₦6,800',
    productCategory: 'Food and beverages',
    productImageUrl:
      'https://images.unsplash.com/photo-1517456793572-1d8efd6dc135?auto=format&fit=crop&w=800&q=80',

    // Service
    serviceName: '30-Day Guided Weight-Loss & Blood Sugar Reset Coaching',
    serviceDescription:
      'Weekly 1-on-1 dietitian consultations, bespoke Nigerian food swap guides (eating swallow smartly), WhatsApp accountability check-ins, and home workout routines.',
    serviceCategory: 'Education and Training',
    serviceDeliveryMethod: 'online',
    servicePriceOrPackages: '₦45,000 / month (Includes weekly progress audit)',
  },
  {
    id: 'hybrid-solar-tech',
    businessType: 'hybrid',
    brandName: 'SolarPulse Energy & Smart Hardware',
    industryCategory: 'Repairs and Technical Services',
    businessDescription:
      'A trusted green energy firm retailing tier-1 solar panels, smart pure sine wave inverters, and lithium battery banks, while deploying certified technicians for turnkey residential/commercial solar installation and annual maintenance.',
    targetCustomers:
      'Nigerian homeowners, online vendors, clinics, and SME offices tired of rising fuel costs and epileptic national grid power supply in major Nigerian commercial hubs.',
    businessLocation: 'Alaba International & Ikeja, Lagos (Nationwide Interstate Cargo)',
    selectedRegions: [
      'Lagos',
      'Ogun',
      'Anambra',
      'Enugu',
      'Federal Capital Territory (Abuja)',
      'Kano',
    ],
    brandTone: 'Elite Professional & Polished',
    badge: 'Hardware & Certified Engineering',
    logoOrAssetUrl: '/samples/solar-inverter.jpg',

    // Product
    productName: 'SolarPulse 3.5kVA / 24V Pure Sine Wave Hybrid Smart Inverter',
    productDescription:
      'High-surge capacity inverter with built-in MPPT solar charge controller and mobile Bluetooth monitoring. Powers refrigerators, TVs, laptops, fans, and studio equipment smoothly.',
    productPrice: '₦385,000',
    productCategory: 'Electronics and gadgets',
    productImageUrl: '/samples/solar-inverter.jpg',

    // Service
    serviceName: 'Turnkey Solar Installation, Electrical Audit & Battery Balancing',
    serviceDescription:
      'Pre-installation site inspection, cabling, circuit-breaker surge protection, inverter programming, and 12-month post-installation maintenance warranty.',
    serviceCategory: 'Repairs and Technical Services',
    serviceDeliveryMethod: 'physical',
    servicePriceOrPackages: '₦65,000 - ₦180,000 installation labor (based on system size)',
  },
];
