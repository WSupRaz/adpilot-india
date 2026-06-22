import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Plans
  const plans = [
    {
      name: "starter",
      displayName: "Starter",
      description: "For solo business owners",
      priceMonthly: 99900,
      priceAnnual: 999600,
      maxBusinesses: 1,
      creditsPerMonth: 50,
      maxCampaigns: 2,
      maxTeamMembers: 1,
      sortOrder: 1,
      features: {
        auditAi: true,
        campaignBuilder: true,
        creativeGenerator: false,
        competitorIntelligence: false,
        googleMetaPublishing: false,
        whatsappAgent: false,
      },
    },
    {
      name: "growth",
      displayName: "Growth",
      description: "For growing SMBs",
      priceMonthly: 299900,
      priceAnnual: 2999800,
      maxBusinesses: 3,
      creditsPerMonth: 200,
      maxCampaigns: 10,
      maxTeamMembers: 3,
      sortOrder: 2,
      features: {
        auditAi: true,
        auditLighthouse: true,
        campaignBuilder: true,
        creativeGenerator: true,
        competitorIntelligence: true,
        googleMetaPublishing: true,
        whatsappAgent: false,
      },
    },
    {
      name: "agency",
      displayName: "Agency",
      description: "For marketing agencies",
      priceMonthly: 799900,
      priceAnnual: 7999800,
      maxBusinesses: 25,
      creditsPerMonth: 1000,
      maxCampaigns: -1,
      maxTeamMembers: 10,
      maxWhatsappConversations: 500,
      sortOrder: 3,
      features: {
        auditAi: true,
        auditLighthouse: true,
        campaignBuilder: true,
        creativeGenerator: true,
        competitorIntelligence: true,
        googleMetaPublishing: true,
        whatsappAgent: true,
        clientReporting: true,
        teamCollaboration: true,
      },
    },
    {
      name: "enterprise",
      displayName: "Enterprise",
      description: "For large enterprises",
      priceMonthly: 0,
      priceAnnual: 0,
      maxBusinesses: -1,
      creditsPerMonth: -1,
      maxCampaigns: -1,
      maxTeamMembers: -1,
      maxWhatsappConversations: -1,
      sortOrder: 4,
      features: {
        all: true,
        whiteLabel: true,
        apiAccess: true,
        sso: true,
        customIntegrations: true,
      },
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
    console.log(`  Plan: ${plan.displayName}`);
  }

  // India Intelligence data
  const indiaEvents = [
    {
      eventType: "festival",
      name: "Diwali",
      nameHi: "दिवाली",
      typicalStartMonth: 10,
      typicalEndMonth: 11,
      peakWeek: 44,
      advancePrepDays: 45,
      budgetMultiplier: 2.5,
      relevantIndustries: ["retail", "electronics", "fashion", "jewellery", "food", "gifts"],
      tier1Relevance: 1.0,
      tier2Relevance: 1.0,
      tier3Relevance: 0.9,
      keywordsBoost: ["Diwali offers", "Diwali sale", "Diwali gifts", "दिवाली ऑफर"],
      creativeThemes: ["lights", "family", "prosperity", "new beginnings", "gifting"],
      strategyNotes: "Biggest shopping festival. Start 6 weeks early. Run ₹500-₹2000 budget/day for SMBs.",
    },
    {
      eventType: "festival",
      name: "Holi",
      nameHi: "होली",
      typicalStartMonth: 3,
      typicalEndMonth: 3,
      advancePrepDays: 21,
      budgetMultiplier: 1.5,
      relevantIndustries: ["fashion", "colours", "food", "beverages", "skincare", "tourism"],
      tier1Relevance: 1.0,
      tier2Relevance: 0.9,
      tier3Relevance: 0.8,
      keywordsBoost: ["Holi offers", "Holi sale", "होली ऑफर"],
      creativeThemes: ["colors", "celebration", "joy", "spring"],
    },
    {
      eventType: "festival",
      name: "Eid ul-Fitr",
      nameHi: "ईद",
      typicalStartMonth: 4,
      typicalEndMonth: 4,
      advancePrepDays: 14,
      budgetMultiplier: 1.8,
      relevantIndustries: ["fashion", "food", "jewellery", "home_decor", "travel"],
      tier1Relevance: 0.9,
      tier2Relevance: 0.8,
      tier3Relevance: 0.7,
      creativeThemes: ["celebration", "family", "new clothes", "festivity"],
    },
    {
      eventType: "sporting_event",
      name: "IPL Season",
      nameHi: "आईपीएल",
      typicalStartMonth: 4,
      typicalEndMonth: 5,
      advancePrepDays: 30,
      budgetMultiplier: 1.6,
      relevantIndustries: ["sports", "beverages", "electronics", "food_delivery", "fantasy_sports"],
      tier1Relevance: 1.0,
      tier2Relevance: 0.9,
      tier3Relevance: 0.7,
      creativeThemes: ["cricket", "team support", "match day", "excitement"],
    },
    {
      eventType: "seasonal",
      name: "Wedding Season",
      nameHi: "शादी का मौसम",
      typicalStartMonth: 11,
      typicalEndMonth: 2,
      advancePrepDays: 60,
      budgetMultiplier: 2.0,
      relevantIndustries: ["catering", "photography", "jewellery", "fashion", "venue", "travel", "beauty"],
      tier1Relevance: 0.9,
      tier2Relevance: 1.0,
      tier3Relevance: 0.9,
      creativeThemes: ["weddings", "celebrations", "family", "special occasions"],
    },
    {
      eventType: "academic",
      name: "Board Exam Season",
      nameHi: "बोर्ड परीक्षा",
      typicalStartMonth: 2,
      typicalEndMonth: 4,
      advancePrepDays: 45,
      budgetMultiplier: 1.4,
      relevantIndustries: ["education", "coaching", "stationery", "health", "nutrition"],
      tier1Relevance: 0.8,
      tier2Relevance: 0.9,
      tier3Relevance: 0.9,
      creativeThemes: ["preparation", "success", "future", "hard work"],
    },
    {
      eventType: "academic",
      name: "Admission Season",
      nameHi: "एडमिशन सीजन",
      typicalStartMonth: 5,
      typicalEndMonth: 7,
      advancePrepDays: 30,
      budgetMultiplier: 1.6,
      relevantIndustries: ["education", "coaching", "hostels", "stationery"],
      tier1Relevance: 0.8,
      tier2Relevance: 0.9,
      tier3Relevance: 0.8,
      creativeThemes: ["new beginnings", "career", "opportunity", "growth"],
    },
    {
      eventType: "seasonal",
      name: "Monsoon Season",
      nameHi: "मानसून",
      typicalStartMonth: 6,
      typicalEndMonth: 9,
      advancePrepDays: 14,
      budgetMultiplier: 1.2,
      relevantIndustries: ["fashion", "footwear", "food", "agriculture", "health", "travel"],
      tier1Relevance: 0.7,
      tier2Relevance: 0.8,
      tier3Relevance: 0.9,
      creativeThemes: ["rain", "refreshing", "season change", "cosiness"],
    },
    {
      eventType: "festival",
      name: "Christmas & New Year",
      nameHi: "क्रिसमस और नया साल",
      typicalStartMonth: 12,
      typicalEndMonth: 1,
      advancePrepDays: 30,
      budgetMultiplier: 1.7,
      relevantIndustries: ["retail", "hospitality", "travel", "gifting", "electronics", "food"],
      tier1Relevance: 1.0,
      tier2Relevance: 0.8,
      tier3Relevance: 0.6,
      creativeThemes: ["celebration", "party", "new beginnings", "gifts", "travel"],
    },
    {
      eventType: "festival",
      name: "Navratri & Dussehra",
      nameHi: "नवरात्रि और दशहरा",
      typicalStartMonth: 10,
      typicalEndMonth: 10,
      advancePrepDays: 14,
      budgetMultiplier: 1.5,
      relevantIndustries: ["fashion", "jewellery", "food", "events", "flowers"],
      tier1Relevance: 0.9,
      tier2Relevance: 0.9,
      tier3Relevance: 0.8,
      creativeThemes: ["tradition", "victory", "celebration", "culture"],
    },
    {
      eventType: "festival",
      name: "Raksha Bandhan",
      nameHi: "रक्षाबंधन",
      typicalStartMonth: 8,
      typicalEndMonth: 8,
      advancePrepDays: 21,
      budgetMultiplier: 1.4,
      relevantIndustries: ["gifting", "sweets", "fashion", "jewellery"],
      tier1Relevance: 0.9,
      tier2Relevance: 0.9,
      tier3Relevance: 0.8,
      creativeThemes: ["sibling bond", "gifts", "love", "family"],
    },
  ];

  for (const event of indiaEvents) {
    await prisma.indiaIntelligence.upsert({
      where: { id: event.name.replace(/\s+/g, "-").toLowerCase() },
      update: event as any,
      create: { id: event.name.replace(/\s+/g, "-").toLowerCase(), ...event } as any,
    });
    console.log(`  India Intelligence: ${event.name}`);
  }

  // Superadmin user
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@adpilot.in";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "AdPilot@2025!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      fullName: "AdPilot Admin",
      passwordHash,
      emailVerified: true,
      role: "superadmin",
      credits: {
        create: {
          balance: 99999,
          lifetimeUsed: 0,
        },
      },
    },
  });
  console.log(`  Admin user: ${admin.email}`);

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
