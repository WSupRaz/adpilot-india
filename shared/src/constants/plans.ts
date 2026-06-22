export interface Plan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  priceMonthly: number; // paise
  priceAnnual: number;  // paise
  maxBusinesses: number;
  creditsPerMonth: number;
  maxCampaigns: number;
  maxTeamMembers: number;
  features: string[];
  highlighted?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "starter",
    displayName: "Starter",
    description: "For solo business owners",
    priceMonthly: 99900,    // ₹999
    priceAnnual: 999600,    // ₹9,996 (2 months free)
    maxBusinesses: 1,
    creditsPerMonth: 50,
    maxCampaigns: 2,
    maxTeamMembers: 1,
    features: [
      "1 business",
      "50 AI credits/month",
      "2 campaigns",
      "AI Campaign Builder",
      "Marketing Audit (AI)",
      "Hindi & Hinglish support",
      "Email support",
    ],
  },
  {
    id: "growth",
    name: "growth",
    displayName: "Growth",
    description: "For growing SMBs",
    priceMonthly: 299900,   // ₹2,999
    priceAnnual: 2999800,   // ₹29,998
    maxBusinesses: 3,
    creditsPerMonth: 200,
    maxCampaigns: 10,
    maxTeamMembers: 3,
    highlighted: true,
    features: [
      "3 businesses",
      "200 AI credits/month",
      "10 campaigns",
      "AI Campaign Builder",
      "Full Marketing Audit",
      "Creative Generator",
      "Competitor Intelligence",
      "Google & Meta publishing",
      "Priority support",
    ],
  },
  {
    id: "agency",
    name: "agency",
    displayName: "Agency",
    description: "For marketing agencies",
    priceMonthly: 799900,   // ₹7,999
    priceAnnual: 7999800,   // ₹79,998
    maxBusinesses: 25,
    creditsPerMonth: 1000,
    maxCampaigns: -1,       // unlimited
    maxTeamMembers: 10,
    features: [
      "25 client businesses",
      "1,000 AI credits/month",
      "Unlimited campaigns",
      "All Growth features",
      "Multi-client dashboard",
      "Team collaboration",
      "Client reporting",
      "WhatsApp AI Agent",
      "Dedicated support",
    ],
  },
  {
    id: "enterprise",
    name: "enterprise",
    displayName: "Enterprise",
    description: "For large enterprises",
    priceMonthly: 0,        // Custom
    priceAnnual: 0,
    maxBusinesses: -1,
    creditsPerMonth: -1,
    maxCampaigns: -1,
    maxTeamMembers: -1,
    features: [
      "Unlimited businesses",
      "Custom credit volume",
      "White-label option",
      "API access",
      "SSO / SAML",
      "Custom integrations",
      "SLA guarantee",
      "Dedicated account manager",
    ],
  },
];
