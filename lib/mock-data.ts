import type { DropOffPoint } from "./types";

export const MOCK_SUBURBS = [
  "Bondi Junction NSW 2022",
  "Bondi Beach NSW 2026",
  "Randwick NSW 2031",
  "Coogee NSW 2034",
  "Paddington NSW 2021",
];

export const BONDI_DROP_OFF_POINTS: DropOffPoint[] = [
  {
    id: "queens-rd-pharmacy",
    name: "Queens Rd Pharmacy Lockers",
    address: "Shop 2, 68 Queens Rd, Bondi Junction NSW 2022",
    distanceKm: 0.3,
    hours: "Mon–Fri 8am–7pm, Sat 9am–5pm",
    open: true,
  },
  {
    id: "bondi-junction-news",
    name: "Bondi Junction Newsagent",
    address: "127 Oxford St, Bondi Junction NSW 2022",
    distanceKm: 0.5,
    hours: "Mon–Sat 6am–9pm, Sun 7am–8pm",
    open: true,
  },
  {
    id: "westfield-locker",
    name: "Westfield Parcel Locker",
    address: "Westfield Bondi Junction, Level 2",
    distanceKm: 0.6,
    hours: "Daily 9am–9pm",
    open: true,
  },
  {
    id: "bronte-rd-express",
    name: "Bronte Rd Express",
    address: "45 Bronte Rd, Bondi Junction NSW 2022",
    distanceKm: 0.8,
    hours: "Mon–Fri 7am–6pm",
    open: true,
  },
  {
    id: "holmes-st-hub",
    name: "Holmes St Hub",
    address: "12 Holmes St, Bondi Junction NSW 2022",
    distanceKm: 0.9,
    hours: "Mon–Sat 8am–6pm",
    open: false,
  },
  {
    id: "spring-st-news",
    name: "Spring St News & Collect",
    address: "3 Spring St, Bondi Junction NSW 2022",
    distanceKm: 1.0,
    hours: "Mon–Fri 7am–7pm",
    open: true,
  },
  {
    id: "centennial-cellars",
    name: "Centennial Cellars",
    address: "88 Centennial Ave, Bondi Junction NSW 2022",
    distanceKm: 1.2,
    hours: "Daily 10am–8pm",
    open: true,
  },
  {
    id: "oxford-lotto",
    name: "Oxford St Lotto & ParcelPoint",
    address: "201 Oxford St, Bondi Junction NSW 2022",
    distanceKm: 1.4,
    hours: "Mon–Sat 8am–8pm",
    open: true,
  },
];

export const MOCK_ADDRESSES = [
  "25 Spring St, Sydney NSW 2000",
  "100 George St, Sydney NSW 2000",
  "1 Martin Place, Sydney NSW 2000",
  "88 Crown St, Surry Hills NSW 2010",
  "42 King St, Newtown NSW 2042",
];
