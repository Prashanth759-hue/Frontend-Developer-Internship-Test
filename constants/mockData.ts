export const MOCK_USER = {
  id: 'usr_001',
  name: 'Ravi Kumar',
  phone: '9876543210',
  email: 'ravi.kumar@email.com',
  avatar: null,
};

export const MOCK_SERVICES = [
  // Ride services
  { id: 'bike_taxi', label: 'Bike Taxi', icon: 'bike', category: 'ride', eta: '3 min', fare: '₹35–₹80' },
  { id: 'car',  label: 'Car', category: 'ride', icon: 'car', eta: '4 min', fare: '₹80–₹200' },
  { id: 'auto', label: 'Auto', icon: 'auto', category: 'ride', eta: '5 min', fare: '₹60–₹120' },
  // Logistics services
  { id: 'parcel', label: 'Parcel', icon: 'package', category: 'logistics', eta: '10 min', fare: '₹40–₹100' },
  { id: 'courier', label: 'Courier', icon: 'mail', category: 'logistics', eta: '15 min', fare: '₹50–₹150' },
  { id: 'heavy_cargo', label: 'Heavy Cargo', icon: 'container', category: 'logistics', eta: '30 min', fare: '₹500–₹1500' },
];

export const MOCK_VEHICLES = [
  {
    id: 'v1',
    name: 'Bike',
    description: 'Fastest · 1 passenger',
    capacity: '1 seat',
    eta: '3 min',
    fare: 35,
    icon: 'bike',
    serviceType: 'bike_taxi',
    tag: '',
  },
  {
    id: 'v2',
    name: 'Scooty',
    description: 'Affordable · city rides',
    capacity: '1 seat',
    eta: '4 min',
    fare: 45,
    icon: 'scooty',
    serviceType: 'scooty',
    tag: '',
  },
  {
    id: 'v3',
    name: 'Auto',
    description: 'Comfortable · 3 passengers',
    capacity: '3 seats',
    eta: '5 min',
    fare: 75,
    icon: 'auto',
    serviceType: 'auto',
    tag: '',
  },
  {
    id: 'v4',
    name: 'Non-AC Car',
    description: 'Budget car · 4 passengers',
    capacity: '4 seats',
    eta: '8 min',
    fare: 110,
    icon: 'car',
    serviceType: 'car_non_ac',
    tag: '',
  },
  {
    id: 'v5',
    name: 'AC Car',
    description: 'Air-conditioned · 4 passengers',
    capacity: '4 seats',
    eta: '9 min',
    fare: 149,
    icon: 'car',
    serviceType: 'car_ac',
    tag: '❄️ AC',
  },
  {
    id: 'v6',
    name: 'Car XL',
    description: 'Spacious SUV · 6 passengers',
    capacity: '6 seats',
    eta: '12 min',
    fare: 199,
    icon: 'car_xl',
    serviceType: 'car_xl',
    tag: '👨‍👩‍👧‍👦 XL',
  },
];

// All possible vehicles for the parcel flow. The screen filters this list
// dynamically based on the user's selected goods category + weight range.
export const PARCEL_ALL_VEHICLES = [
  {
    id: 'parcel_bike',
    name: 'Parcel on Bike',
    description: 'Upto 5 kg · small items & documents',
    maxKg: 5,
    minItems: 0,
    maxItems: 5,
    eta: '3 mins away',
    fare: 99,
    icon: 'bike',
    goodsBlacklist: ['furniture'],  // never show for furniture
  },
  {
    id: 'parcel_scooty',
    name: 'Parcel on Scooty',
    description: 'Upto 15 kg · medium parcels & boxes',
    maxKg: 15,
    minItems: 0,
    maxItems: 10,
    eta: '4 mins away',
    fare: 149,
    icon: 'scooty',
    goodsBlacklist: ['furniture'],
  },
  {
    id: 'parcel_auto',
    name: 'Parcel on Auto (3-Wheeler)',
    description: 'Upto 60 kg · multiple boxes & goods',
    maxKg: 60,
    minItems: 0,
    maxItems: 20,
    eta: '6 mins away',
    fare: 279,
    icon: 'auto',
    goodsBlacklist: [] as string[],
  },
  {
    id: 'parcel_mini_truck',
    name: 'Mini Truck (Tata Ace 8ft)',
    description: 'Upto 750 kg · heavy, bulk & furniture',
    maxKg: 750,
    minItems: 0,
    maxItems: 999,
    eta: '12 mins away',
    fare: 549,
    icon: 'mini_truck',
    goodsBlacklist: [] as string[],
  },
];

// Weight range keys → numeric kg upper bound (used for filtering).
const WEIGHT_KG: Record<string, number> = {
  under_5: 5,
  '5_to_15': 15,
  '15_to_50': 50,
  '50_plus': 750,
};

// Item qty keys → numeric upper bound.
const QTY_COUNT: Record<string, number> = {
  '1_3': 3,
  '4_10': 10,
  '11_plus': 50,
};

/**
 * Returns the subset of PARCEL_ALL_VEHICLES that can handle the user's
 * selected goods category, weight range and item count.  The list is
 * returned in ascending fare order (cheapest first, like the reference UI).
 */
export function getParcelVehicleOptions(
  category: string,
  weightRange: string,
  qty: string
): typeof PARCEL_ALL_VEHICLES {
  const kg = WEIGHT_KG[weightRange] ?? 5;
  const items = QTY_COUNT[qty] ?? 3;
  return PARCEL_ALL_VEHICLES.filter((v) => {
    if (v.goodsBlacklist.includes(category)) return false;
    if (kg > v.maxKg) return false;
    if (items > v.maxItems) return false;
    return true;
  });
}

// Legacy export kept so any existing import of PARCEL_VEHICLE_OPTIONS still compiles.
export const PARCEL_VEHICLE_OPTIONS = PARCEL_ALL_VEHICLES;

// Truck types shown on the "Choose Truck" screen (Within City booking flow).
export const TRUCK_VEHICLES = [
  {
    id: 'mini_truck',
    name: 'Mini Truck',
    description: 'Tata Ace · Best for small loads',
    capacity: 'Upto 750 kg',
    eta: '10 min',
    fare: 349,
    icon: 'mini_truck',
  },
  {
    id: 'pickup_8ft',
    name: 'Pickup 8 ft',
    description: 'Open body · Medium household loads',
    capacity: 'Upto 1.5 Ton',
    eta: '14 min',
    fare: 549,
    icon: 'mini_truck',
  },
  {
    id: 'truck_14ft',
    name: '14 ft Truck',
    description: 'Container body · Bulk & commercial goods',
    capacity: 'Upto 5 Ton',
    eta: '22 min',
    fare: 999,
    icon: 'truck',
  },
];

// Pricing for the optional loading/unloading helpers on the Truck flow.
export const HELPER_PRICE_PER_PERSON = 150;
export const MAX_HELPERS = 4;

// Inter-City truck vehicles — city-to-city transport with per-km pricing.
export const INTERCITY_TRUCK_VEHICLES = [
  {
    id: 'intercity_mini',
    name: 'Mini Truck',
    description: 'Tata Ace · Small inter-city loads',
    capacity: 'Upto 750 kg',
    eta: '20 min',
    baseFare: 1499,
    perKmRate: 14,
    icon: 'mini_truck',
  },
  {
    id: 'intercity_pickup',
    name: 'Pickup 8 ft',
    description: 'Open body · Medium city-to-city loads',
    capacity: 'Upto 1.5 Ton',
    eta: '25 min',
    baseFare: 2499,
    perKmRate: 18,
    icon: 'mini_truck',
  },
  {
    id: 'intercity_truck14',
    name: '14 ft Truck',
    description: 'Container body · Bulk inter-city goods',
    capacity: 'Upto 5 Ton',
    eta: '35 min',
    baseFare: 4499,
    perKmRate: 24,
    icon: 'truck',
  },
  {
    id: 'intercity_truck20',
    name: '20 ft Truck',
    description: 'Large container · Commercial shipments',
    capacity: 'Upto 10 Ton',
    eta: '45 min',
    baseFare: 6999,
    perKmRate: 32,
    icon: 'truck',
  },
];

// Long-Trip truck vehicles — outstation / multi-day transport with per-km pricing.
export const LONGTRIP_TRUCK_VEHICLES = [
  {
    id: 'longtrip_mini',
    name: 'Mini Truck',
    description: 'Tata Ace · Long-haul small loads',
    capacity: 'Upto 750 kg',
    eta: '30 min',
    baseFare: 2499,
    perKmRate: 13,
    icon: 'mini_truck',
  },
  {
    id: 'longtrip_pickup',
    name: 'Pickup 8 ft',
    description: 'Open body · Long-distance medium loads',
    capacity: 'Upto 1.5 Ton',
    eta: '35 min',
    baseFare: 3999,
    perKmRate: 17,
    icon: 'mini_truck',
  },
  {
    id: 'longtrip_truck14',
    name: '14 ft Truck',
    description: 'Container · Bulk outstation goods',
    capacity: 'Upto 5 Ton',
    eta: '45 min',
    baseFare: 6999,
    perKmRate: 22,
    icon: 'truck',
  },
  {
    id: 'longtrip_truck20',
    name: '20 ft Truck',
    description: 'Large container · Heavy commercial loads',
    capacity: 'Upto 10 Ton',
    eta: '60 min',
    baseFare: 9999,
    perKmRate: 28,
    icon: 'truck',
  },
];

// Packers & Movers packages shown on the "Choose Your Package" screen.
export const PACKERS_MOVERS_PACKAGES = [
  {
    id: '1bhk',
    name: '1 RK / 1 BHK',
    description: 'Mini truck + basic packing',
    helpers: 2,
    eta: '45 min',
    fare: 1499,
    icon: 'mini_truck',
  },
  {
    id: '2bhk',
    name: '2 BHK',
    description: 'Pickup truck + careful handling',
    helpers: 3,
    eta: '50 min',
    fare: 2499,
    icon: 'mini_truck',
  },
  {
    id: '3bhk',
    name: '3 BHK',
    description: '14 ft truck + full home shifting',
    helpers: 4,
    eta: '60 min',
    fare: 3999,
    icon: 'truck',
  },
  {
    id: 'office',
    name: 'Office / Shop',
    description: 'Custom team & vehicle for your setup',
    helpers: 5,
    eta: '60 min',
    fare: 5999,
    icon: 'truck',
  },
];

export const PARCEL_CATEGORIES = [
  {
    id: 'documents',
    name: 'Documents',
    pricePerKg: 12,
    icon: 'file',
  },
  {
    id: 'electronics',
    name: 'Electronics',
    pricePerKg: 20,
    icon: 'mobile',
  },
  {
    id: 'clothing',
    name: 'Clothing',
    pricePerKg: 10,
    icon: 'shirt',
  },
  {
    id: 'food',
    name: 'Food Items',
    pricePerKg: 15,
    icon: 'package',
  },
  {
    id: 'fragile',
    name: 'Fragile Goods',
    pricePerKg: 25,
    icon: 'box',
  },
];

export const INTERCITY_PARCEL_PRICING = {
  baseFare: 99,
  minimumWeight: 1,
  expressCharge: 199,
  insuranceCharge: 49,
};

export const INTERCITY_PARCEL_CATEGORIES = [
  {
    id: 'documents',
    name: 'Documents',
    emoji: '📄',
  },
  {
    id: 'electronics',
    name: 'Electronics',
    emoji: '📱',
  },
  {
    id: 'clothing',
    name: 'Clothing',
    emoji: '👕',
  },
  {
    id: 'food',
    name: 'Food',
    emoji: '🍱',
  },
  {
    id: 'fragile',
    name: 'Fragile',
    emoji: '📦',
  },
];

export const INTERCITY_PARCEL_WEIGHT_SLABS = [
  {
    id: 'up_to_1kg',
    label: 'Up to 1 kg',
    description: 'Documents & small parcels',
    price: 99,
  },
  {
    id: '1_to_5kg',
    label: '1 - 5 kg',
    description: 'Medium parcels',
    price: 199,
  },
  {
    id: '5_to_10kg',
    label: '5 - 10 kg',
    description: 'Heavy parcels',
    price: 349,
  },
  {
    id: '10_to_20kg',
    label: '10 - 20 kg',
    description: 'Large parcels',
    price: 599,
  },
];

export const MINI_TRUCK_ITEMS = [
  { id: 'chair', label: 'Chair', weight: 8 },
  { id: 'table', label: 'Table', weight: 20 },
  { id: 'bed', label: 'Bed', weight: 45 },
  { id: 'sofa', label: 'Sofa', weight: 60 },
  { id: 'fridge', label: 'Refrigerator', weight: 80 },
  { id: 'washing_machine', label: 'Washing Machine', weight: 70 },
  { id: 'tv', label: 'Television', weight: 15 },
  { id: 'boxes', label: 'Boxes', weight: 10 },
];


export const MINI_TRUCK_ITEM_CATEGORIES = [
  {
    id: 'furniture',
    name: 'Furniture',
    emoji: '🛋️',
    items: [
      { id: 'chair', name: 'Chair' },
      { id: 'table', name: 'Table' },
      { id: 'bed', name: 'Bed' },
      { id: 'sofa', name: 'Sofa' },
    ],
  },
  {
    id: 'appliances',
    name: 'Appliances',
    emoji: '📺',
    items: [
      { id: 'fridge', name: 'Refrigerator' },
      { id: 'washing_machine', name: 'Washing Machine' },
      { id: 'tv', name: 'Television' },
    ],
  },
  {
    id: 'boxes',
    name: 'Boxes & Misc',
    emoji: '📦',
    items: [
      { id: 'boxes', name: 'Boxes', note: 'Packed cartons' },
    ],
  },
];

export const MINI_TRUCK_BASE_FARE = 399;
export const MINI_TRUCK_PER_ITEM_RATE = 50;

export const MINI_TRUCK_MOVERS_PRICING = {
  baseFare: 399,
  perKgRate: 3,
  helperCharge: 199,
};

// Vehicle options shown on the "Choose Your Vehicle" screen for the Mini
// Truck shifting flow. Fare for each = baseFare + (items * perItemRate) +
// (helpers * HELPER_PRICE_PER_PERSON). Picked after furniture + location/floor
// details are collected, so price reflects the actual items selected.
export const MINI_TRUCK_VEHICLE_OPTIONS = [
  {
    id: 'mini_truck_movers',
    name: 'Mini Truck (Tata Ace)',
    description: 'Best for 1 RK / small office goods',
    capacity: 'Upto 750 kg',
    eta: '10 min',
    baseFare: 399,
    perItemRate: 50,
    icon: 'mini_truck',
  },
  {
    id: 'pickup_truck_movers',
    name: 'Pickup Truck',
    description: 'Best for 1 BHK with a few large items',
    capacity: 'Upto 1500 kg',
    eta: '15 min',
    baseFare: 599,
    perItemRate: 65,
    icon: 'mini_truck',
  },
  {
    id: 'truck_movers',
    name: '14 ft Truck',
    description: 'Best for 2 BHK / heavy furniture loads',
    capacity: 'Upto 3000 kg',
    eta: '25 min',
    baseFare: 899,
    perItemRate: 80,
    icon: 'truck',
  },
];

export const INTERCITY_MOVERS_PACKAGES = [
  {
    id: '1bhk',
    name: '1 BHK',
    description: 'Mini truck + basic packing',
    helpers: 2,
    eta: '1-2 days',
    fare: 6999,
    icon: 'mini_truck',
  },
  {
    id: '2bhk',
    name: '2 BHK',
    description: 'Pickup truck + careful handling',
    helpers: 3,
    eta: '1-2 days',
    fare: 9999,
    icon: 'mini_truck',
  },
  {
    id: '3bhk',
    name: '3 BHK',
    description: '14 ft truck + full shifting',
    helpers: 4,
    eta: '2-3 days',
    fare: 14999,
    icon: 'truck',
  },
  {
    id: 'villa',
    name: 'Villa',
    description: 'Large truck + complete moving team',
    helpers: 6,
    eta: '2-4 days',
    fare: 24999,
    icon: 'truck',
  },
];

export const INTERCITY_MOVERS_PRICING = {
  perKmRate: 18,
  packingCharge: 999,
  insuranceCharge: 499,
  nightAllowance: 750,
};

// Optional packing-material add-on for the Packers & Movers flow.
export const PACKING_MATERIAL_PRICE = 499;

// Optional packaging tiers offered at the pickup scheduling step, shared by
// the Truck and Packers & Movers "Schedule Pickup" screens. "none" is free —
// items travel as-is. The paid tiers wrap items before loading.
export const PACKAGING_OPTIONS = [
  {
    id: 'none',
    label: 'No Packaging',
    subtitle: 'Items are moved as-is, no extra wrapping',
    price: 0,
    layers: 0,
  },
  {
    id: 'single_layer',
    label: 'Single-Layer Packaging',
    subtitle: 'One protective wrap around each item — good for everyday goods',
    price: 349,
    layers: 1,
  },
  {
    id: 'multi_layer',
    label: 'Multi-Layer Packaging',
    subtitle: 'Extra padded, multi-layer wrap — best for fragile & valuable items',
    price: 699,
    layers: 2,
  },
] as const;

export type PackagingOptionId = typeof PACKAGING_OPTIONS[number]['id'];

export const MOCK_ORDERS = [
  {
    id: 'ORD-001',
    service: 'Bike Taxi',
    pickup: 'Koramangala 4th Block',
    drop: 'Indiranagar 100 Feet Road',
    date: '12 Jun 2026',
    time: '10:30 AM',
    fare: '₹72',
    status: 'completed',
    driverName: 'Suresh M.',
    driverPhone: '9876500001',
    vehicleNumber: 'KA 01 EF 1234',
    rating: 4,
    distance: '4.2 km',
    duration: '18 min',
  },
  {
    id: 'ORD-002',
    service: 'Parcel',
    pickup: 'HSR Layout',
    drop: 'Whitefield',
    date: '10 Jun 2026',
    time: '02:15 PM',
    fare: '₹120',
    status: 'completed',
    driverName: 'Mohan K.',
    driverPhone: '9876500002',
    vehicleNumber: 'KA 02 GH 5678',
    rating: 5,
    distance: '12.7 km',
    duration: '42 min',
  },
  {
    id: 'ORD-003',
    service: 'Auto',
    pickup: 'Jayanagar 4th Block',
    drop: 'Electronic City Phase 1',
    date: '8 Jun 2026',
    time: '06:45 PM',
    fare: '₹95',
    status: 'cancelled',
    driverName: 'Manjunath R.',
    driverPhone: '9876500003',
    vehicleNumber: 'KA 03 JK 9012',
    rating: null,
    distance: '9.4 km',
    duration: '0 min',
  },
  {
    id: 'ORD-003',
    service: 'Auto',
    pickup: 'BTM Layout',
    drop: 'MG Road',
    date: '8 Jun 2026',
    time: '07:45 AM',
    fare: '₹95',
    status: 'cancelled',
    driverName: null,
    driverPhone: null,
    vehicleNumber: null,
    rating: null,
    distance: '7.1 km',
    duration: null,
  },
  {
    id: 'ORD-004',
    service: 'Car',
    pickup: 'Electronic City Phase 1',
    drop: 'Kempegowda Airport',
    date: '5 Jun 2026',
    time: '04:00 AM',
    fare: '₹680',
    status: 'completed',
    driverName: 'Raju S.',
    driverPhone: '9876500003',
    vehicleNumber: 'KA 05 MN 9012',
    rating: 5,
    distance: '41.3 km',
    duration: '55 min',
  },
  {
    id: 'ORD-005',
    service: 'Truck',
    pickup: 'Marathahalli',
    drop: 'Hebbal',
    date: '1 Jun 2026',
    time: '09:00 AM',
    fare: '₹950',
    status: 'completed',
    driverName: 'Venkat R.',
    driverPhone: '9876500004',
    vehicleNumber: 'KA 03 PQ 3456',
    rating: 4,
    distance: '18.5 km',
    duration: '65 min',
  },
];

export const MOCK_DRIVERS = [
  {
    id: 'drv-001',
    name: 'Suresh M.',
    phone: '9876500001',
    rating: 4.8,
    totalRides: 1240,
    vehicle: 'Honda Activa',
    vehicleNumber: 'KA 01 EF 1234',
    icon: 'bike',
    eta: '3 min',
  },
  {
    id: 'drv-002',
    name: 'Mohan K.',
    phone: '9876500002',
    rating: 4.9,
    totalRides: 875,
    vehicle: 'Bajaj RE Auto',
    vehicleNumber: 'KA 02 GH 5678',
    icon: 'auto',
    eta: '5 min',
  },
  {
    id: 'drv-003',
    name: 'Raju S.',
    phone: '9876500003',
    rating: 4.7,
    totalRides: 3210,
    vehicle: 'Maruti Swift Dzire',
    vehicleNumber: 'KA 05 MN 9012',
    icon: 'car',
    eta: '7 min',
  },
  {
    id: 'drv-004',
    name: 'Venkat R.',
    phone: '9876500004',
    rating: 4.7,
    totalRides: 540,
    vehicle: 'Tata Ace Mini Truck',
    vehicleNumber: 'KA 03 PQ 3456',
    icon: 'truck',
    eta: '10 min',
  },
  {
    id: 'drv-005',
    name: 'Manjunath & Team',
    phone: '9876500005',
    rating: 4.8,
    totalRides: 320,
    vehicle: 'Moving Team · 3 Helpers',
    vehicleNumber: 'KA 04 RS 7890',
    icon: 'packers_movers',
    eta: '35 min',
  },
];

export const MOCK_TRANSACTIONS = [
  { id: 'TXN-001', label: 'Added to Wallet', amount: '₹500', date: '11 Jun 2026', type: 'credit' },
  { id: 'TXN-002', label: 'Bike Taxi — Koramangala', amount: '₹72', date: '12 Jun 2026', type: 'debit' },
  { id: 'TXN-003', label: 'Parcel Delivery', amount: '₹120', date: '10 Jun 2026', type: 'debit' },
  { id: 'TXN-004', label: 'Cashback Reward', amount: '₹25', date: '10 Jun 2026', type: 'credit' },
  { id: 'TXN-005', label: 'Car Ride — Airport', amount: '₹680', date: '5 Jun 2026', type: 'debit' },
  { id: 'TXN-006', label: 'Referral Bonus', amount: '₹100', date: '3 Jun 2026', type: 'credit' },
  { id: 'TXN-007', label: 'Truck Shifting', amount: '₹950', date: '1 Jun 2026', type: 'debit' },
  { id: 'TXN-008', label: 'Promo Code VAHAN50', amount: '₹50', date: '28 May 2026', type: 'credit' },
];

export const MOCK_SAVED_ADDRESSES = [
  { id: 'addr-1', label: 'Home', address: '123, 4th Cross, Koramangala, Bengaluru 560034', icon: 'home' },
  { id: 'addr-2', label: 'Work', address: '91Springboard, Indiranagar, Bengaluru 560038', icon: 'briefcase' },
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-001',
    type: 'promo',
    title: '🎉 50% off on your next ride!',
    body: 'Use code VAHAN50 before June 30. Valid on Bike Taxi & Auto.',
    time: '2 hrs ago',
    read: false,
  },
  {
    id: 'notif-002',
    type: 'trip',
    title: '✅ Trip Completed',
    body: 'Your ride from Koramangala to Indiranagar is complete. Fare: ₹72.',
    time: '5 hrs ago',
    read: false,
  },
  {
    id: 'notif-003',
    type: 'wallet',
    title: '💰 Cashback Credited',
    body: '₹25 cashback added to your Vahan Pay wallet.',
    time: '1 day ago',
    read: true,
  },
  {
    id: 'notif-004',
    type: 'promo',
    title: '🚚 Truck Services Now Live!',
    body: 'Book mini trucks for local shifting at unbeatable rates.',
    time: '2 days ago',
    read: true,
  },
  {
    id: 'notif-005',
    type: 'trip',
    title: '📦 Parcel Delivered',
    body: 'Your parcel from HSR Layout has been delivered to Whitefield.',
    time: '3 days ago',
    read: true,
  },
  {
    id: 'notif-006',
    type: 'account',
    title: '👤 Profile Updated',
    body: 'Your profile details have been updated successfully.',
    time: '5 days ago',
    read: true,
  },
];

export const MOCK_PROMOS = [
  {
    id: 'promo-001',
    title: '🎉 New User Offer',
    subtitle: 'Get 50% off on your first 3 rides',
    code: 'VAHAN50',
    discount: '50% OFF',
    validTill: '30 Jun 2026',
    minOrder: '₹50',
    maxDiscount: '₹100',
    applicable: 'All Rides',
    color: '#FF6B00',
  },
  {
    id: 'promo-002',
    title: '🚀 Weekend Special',
    subtitle: 'Flat ₹30 off on Auto rides this weekend',
    code: 'WKND30',
    discount: '₹30 OFF',
    validTill: '22 Jun 2026',
    minOrder: '₹80',
    maxDiscount: '₹30',
    applicable: 'Auto Rides',
    color: '#7C3AED',
  },
  {
    id: 'promo-003',
    title: '📦 Delivery Deal',
    subtitle: 'Free delivery on first parcel booking',
    code: 'SHIP0',
    discount: 'FREE',
    validTill: '15 Jul 2026',
    minOrder: '₹0',
    maxDiscount: '₹60',
    applicable: 'Parcel',
    color: '#059669',
  },
  {
    id: 'promo-004',
    title: '🏠 Moving Offer',
    subtitle: '15% off on Packers & Movers',
    code: 'MOVE15',
    discount: '15% OFF',
    validTill: '31 Jul 2026',
    minOrder: '₹500',
    maxDiscount: '₹300',
    applicable: 'Packers & Movers',
    color: '#D97706',
  },
];

export const MOCK_PROMO = MOCK_PROMOS[0];

export const FARE_BREAKDOWN = {
  base: 40,
  distance: 25,
  platform_fee: 5,
  total: 70,
};

export const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
];

export const FAQ_ITEMS = [
  {
    id: 'faq-1',
    question: 'How do I book a ride?',
    answer: 'Tap on the service category (Ride, Truck, Parcel, or Packers & Movers) from the home screen. Enter your pickup and drop locations, select a vehicle, choose your payment method, and confirm your booking.',
  },
  {
    id: 'faq-2',
    question: 'How do I track my driver?',
    answer: 'Once your booking is confirmed and a driver is assigned, you can track their live location on the map. You will also receive real-time ETA updates.',
  },
  {
    id: 'faq-3',
    question: 'What payment methods are accepted?',
    answer: 'We accept Cash, UPI (Google Pay, PhonePe, Paytm, etc.), and Vahan Pay wallet balance. You can select your preferred method at the time of booking.',
  },
  {
    id: 'faq-4',
    question: 'How do I cancel a booking?',
    answer: 'You can cancel a booking before the driver arrives by tapping the "Cancel Booking" button on the searching or tracking screen. Cancellation charges may apply.',
  },
  {
    id: 'faq-5',
    question: 'How do I add money to my wallet?',
    answer: 'Go to the Wallet tab and tap "Add Money". You can add money via UPI or debit/credit card. The amount will be instantly credited to your Vahan Pay wallet.',
  },
  {
    id: 'faq-6',
    question: 'What is Vahan Coins?',
    answer: 'Vahan Coins are reward points you earn on every trip. You can redeem them for discounts on future bookings. 10 Vahan Coins = ₹1 discount.',
  },
  {
    id: 'faq-7',
    question: 'How do I rate my driver?',
    answer: 'After your trip is completed, you will be prompted to rate your driver on a scale of 1 to 5 stars and leave optional feedback.',
  },
  {
    id: 'faq-8',
    question: 'Is my ride safe?',
    answer: 'Yes. All Vahan360 driver-partners are background verified. You can share your live trip details with trusted contacts, and the SOS button on the tracking screen connects you to emergency services.',
  },
];
// ─── Express Parcel ───────────────────────────────────────────────────────────

export const EXPRESS_TIME_SLOTS = [
  {
    id: 'asap',
    label: 'ASAP',
    description: 'Picked up & delivered within 2 hours',
    emoji: '⚡',
    surcharge: 0,
  },
  {
    id: 'scheduled_2h',
    label: 'Schedule for later',
    description: 'Choose a 2-hour window today',
    emoji: '🕐',
    surcharge: 0,
  },
  {
    id: 'priority',
    label: 'Priority Express',
    description: 'Dedicated rider, guaranteed under 90 min',
    emoji: '🚀',
    surcharge: 49,
  },
];

export const EXPRESS_PARCEL_SIZES = [
  {
    id: 'envelope',
    label: 'Envelope / Documents',
    description: 'Papers, letters, thin flat items',
    emoji: '📄',
    price: 49,
  },
  {
    id: 'small',
    label: 'Small Box',
    description: 'Fits in a backpack · up to 3 kg',
    emoji: '📦',
    price: 79,
  },
  {
    id: 'medium',
    label: 'Medium Box',
    description: 'Laptop-sized · 3–8 kg',
    emoji: '🗃️',
    price: 119,
  },
  {
    id: 'large',
    label: 'Large / Heavy',
    description: 'Bulky items · 8–15 kg',
    emoji: '🧳',
    price: 179,
  },
];

export const EXPRESS_PARCEL_CATEGORIES = [
  { id: 'documents', name: 'Documents', emoji: '📄' },
  { id: 'food', name: 'Food / Tiffin', emoji: '🍱' },
  { id: 'medicine', name: 'Medicine', emoji: '💊' },
  { id: 'electronics', name: 'Electronics', emoji: '📱' },
  { id: 'clothing', name: 'Clothing', emoji: '👕' },
  { id: 'gifts', name: 'Gifts', emoji: '🎁' },
  { id: 'fragile', name: 'Fragile', emoji: '🔮' },
  { id: 'other', name: 'Other', emoji: '📦' },
];