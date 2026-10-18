export interface DarkstoreWarehouse {
  id: string;
  name: string;
  city: string;
  state: string;
  tagline: string;
  badge: string;
  phase: string;
  address: string;
  isAvailable: boolean; // true for ahmedabad, false for others
}

export const DROBE_WAREHOUSES: DarkstoreWarehouse[] = [
  {
    id: 'ahmedabad',
    name: 'Ahmedabad Mega Darkstore #01',
    city: 'Ahmedabad',
    state: 'Gujarat',
    tagline: 'Central Automated Fulfillment & Door-Trial Dispatch Node',
    badge: 'Operational Hub',
    phase: 'Phase 1 · Active Now',
    address: 'Koteshwar Road / Motera Fulfillment Zone, Ahmedabad, Gujarat',
    isAvailable: true
  },
  {
    id: 'chandigarh',
    name: 'Chandigarh Express Darkstore',
    city: 'Chandigarh',
    state: 'Punjab & Haryana',
    tagline: 'Northern Express High-Speed Logistics Center',
    badge: 'Coming out in next phases',
    phase: 'Phase 2 Expansion',
    address: 'Industrial Area Phase 1, Chandigarh',
    isAvailable: false
  },
  {
    id: 'gurgaon',
    name: 'Gurgaon CyberCity Hub',
    city: 'Gurgaon',
    state: 'NCR / Haryana',
    tagline: 'NCR Rapid Darkstore & Designer Apparel Node',
    badge: 'Coming out in next phases',
    phase: 'Phase 2 Expansion',
    address: 'CyberCity / Udyog Vihar Zone, Gurgaon, NCR',
    isAvailable: false
  },
  {
    id: 'lucknow',
    name: 'Lucknow Metro Darkstore',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    tagline: 'Awadh Regional Fulfillment & Stock Inwarding Depot',
    badge: 'Coming out in next phases',
    phase: 'Phase 3 Expansion',
    address: 'Shaheed Path / Gomti Nagar Extension, Lucknow, UP',
    isAvailable: false
  }
];
