export const CITY_TIERS: Record<string, 1 | 2 | 3> = {
  // Tier 1
  Mumbai: 1, Delhi: 1, Bangalore: 1, Bengaluru: 1, Hyderabad: 1,
  Chennai: 1, Kolkata: 1, Pune: 1, Ahmedabad: 1,
  // Tier 2
  Jaipur: 2, Lucknow: 2, Kanpur: 2, Nagpur: 2, Indore: 2,
  Bhopal: 2, Patna: 2, Vadodara: 2, Ludhiana: 2, Agra: 2,
  Nashik: 2, Surat: 2, Rajkot: 2, Meerut: 2, Varanasi: 2,
  Coimbatore: 2, Madurai: 2, Visakhapatnam: 2, Vijayawada: 2,
  // Tier 3 (rest)
};

export function getCityTier(city: string): 1 | 2 | 3 {
  return CITY_TIERS[city] ?? 3;
}

export const INDIA_FESTIVALS = [
  { name: "Diwali", nameHi: "दिवाली", typicalMonth: 10, advancePrepDays: 45 },
  { name: "Dussehra", nameHi: "दशहरा", typicalMonth: 10, advancePrepDays: 30 },
  { name: "Raksha Bandhan", nameHi: "रक्षाबंधन", typicalMonth: 8, advancePrepDays: 21 },
  { name: "Holi", nameHi: "होली", typicalMonth: 3, advancePrepDays: 21 },
  { name: "Eid", nameHi: "ईद", typicalMonth: 4, advancePrepDays: 14 },
  { name: "Navratri", nameHi: "नवरात्रि", typicalMonth: 10, advancePrepDays: 14 },
  { name: "Christmas", nameHi: "क्रिसमस", typicalMonth: 12, advancePrepDays: 30 },
  { name: "New Year", nameHi: "नया साल", typicalMonth: 1, advancePrepDays: 14 },
  { name: "IPL Season", nameHi: "आईपीएल", typicalMonth: 4, advancePrepDays: 30 },
  { name: "Wedding Season", nameHi: "शादी का मौसम", typicalMonth: 11, advancePrepDays: 60 },
  { name: "Board Exam Season", nameHi: "बोर्ड परीक्षा", typicalMonth: 3, advancePrepDays: 45 },
  { name: "Admission Season", nameHi: "एडमिशन सीजन", typicalMonth: 6, advancePrepDays: 30 },
  { name: "Monsoon Season", nameHi: "मानसून", typicalMonth: 7, advancePrepDays: 14 },
] as const;

export const BUSINESS_TYPES = [
  "retail",
  "restaurant",
  "clinic",
  "salon",
  "education",
  "real_estate",
  "coaching",
  "fitness",
  "fashion",
  "electronics",
  "grocery",
  "pharmacy",
  "travel",
  "event_management",
  "construction",
  "legal",
  "financial_services",
  "d2c_brand",
  "other",
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];
