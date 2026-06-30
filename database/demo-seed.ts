import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding demo data for video shoot...");

  // ── Demo User ────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("Demo@2025!", 12);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@adpilotindia.com" },
    update: {},
    create: {
      email: "demo@adpilotindia.com",
      fullName: "Himanshu Patel",
      passwordHash,
      emailVerified: true,
      role: "user",
      credits: {
        create: {
          balance: 45,
          lifetimeUsed: 5,
          resetDate: new Date("2026-07-31"),
        },
      },
    },
  });
  console.log(`  Demo user: ${demoUser.email} / Demo@2025!`);

  // ── Business 1: Sharma Saree House ──────────────────────────────────────────
  const saree = await prisma.business.upsert({
    where: { id: "demo-business-saree-001" },
    update: {},
    create: {
      id: "demo-business-saree-001",
      ownerId: demoUser.id,
      name: "Sharma Saree House",
      description:
        "Hum Indore mein premium sarees aur lehengas bechte hain. Diwali aur shaadi season mein special collection aata hai. 15 saal purana family business hai.",
      businessType: "retail",
      industryCategory: "fashion",
      city: "Indore",
      state: "Madhya Pradesh",
      cityTier: 2,
      avgMonthlyBudget: 1500000,
      targetAudience: {
        ageRange: "25-55",
        gender: "women",
        interests: ["sarees", "fashion", "weddings", "festivals"],
        languages: ["Hindi"],
      },
    },
  });
  console.log(`  Business: ${saree.name}`);

  // Campaign 1 — Saree House Diwali
  await prisma.campaign.upsert({
    where: { id: "demo-campaign-saree-diwali-001" },
    update: {},
    create: {
      id: "demo-campaign-saree-diwali-001",
      businessId: saree.id,
      userId: demoUser.id,
      name: "Diwali Saree Collection 2025",
      goal: "sales",
      platform: "both",
      status: "approved",
      dailyBudgetPaise: 75000,
      monthlyBudgetPaise: 2250000,
      festivalContext: "Diwali",
      startDate: new Date("2025-10-01"),
      endDate: new Date("2025-11-05"),
      totalImpressions: 184200,
      totalClicks: 3640,
      totalConversions: 87,
      totalSpendPaise: 1240000,
      aiModelUsed: "gpt-4o",
      aiStrategy: {
        summary:
          "Diwali saree campaign targeting married women aged 28-50 in Indore and nearby Tier-2 cities. Festival multiplier 2.5x applied. Recommend increasing budget by 40% in final week before Diwali.",
        campaignName: "Diwali Saree Collection 2025 — Sharma Saree House",
        objective: "CONVERSIONS",
        budgetRecommendation: {
          daily: 750,
          weekly: 5250,
          festivalWeekBoost: "Increase to ₹1,200/day in the final 7 days before Diwali",
        },
        headlines: [
          "Diwali Special Sarees — ₹999 से शुरू",
          "इस दिवाली पहनो कुछ खास — Sharma Saree House",
          "Premium Sarees for Diwali — Indore's Finest Collection",
          "Diwali में चमको इन खूबसूरत साड़ियों के साथ",
        ],
        descriptions: [
          "Sharma Saree House में मिलती हैं बेहतरीन साड़ियाँ — Banarasi, Kanjivaram, Chanderi और भी बहुत कुछ। इस दिवाली अपनी पसंद की साड़ी चुनें।",
          "15 years of trust in Indore. Premium sarees for Diwali starting ₹999. Free alteration on all purchases above ₹2,000.",
        ],
        keywords: {
          google: [
            "diwali saree indore",
            "banarasi saree indore",
            "saree shop indore",
            "दिवाली साड़ी इंदौर",
            "silk saree indore",
            "lehenga indore diwali",
            "best saree shop madhya pradesh",
            "festival saree collection",
          ],
          negativeKeywords: ["second hand saree", "saree rental", "online saree"],
        },
        targeting: {
          locations: ["Indore", "Bhopal", "Ujjain", "Dewas"],
          ageRange: "25-55",
          gender: "FEMALE",
          languages: ["Hindi", "English"],
          interests: ["Indian fashion", "sarees", "Diwali shopping", "weddings"],
          behaviors: ["engaged shoppers", "festival shoppers"],
        },
        adGroups: [
          {
            name: "Silk Sarees — Diwali",
            theme: "Silk & Banarasi sarees for Diwali gifting",
            keywords: ["banarasi saree diwali", "silk saree gift", "diwali saree gift"],
          },
          {
            name: "Budget Sarees — ₹999",
            theme: "Affordable festive sarees under ₹2000",
            keywords: ["saree under 1000", "cheap diwali saree", "affordable saree indore"],
          },
        ],
        indiaIntelligence: {
          festivalAlert: "Diwali is India's biggest shopping festival. SMB budgets should be 2x normal.",
          cityInsight: "Indore Tier-2 city — high purchase intent for offline retail. Use 'Visit Store' CTA.",
          seasonalNote: "Wedding season starts Nov — add bridal collection messaging from Oct 20.",
        },
        estimatedResults: {
          impressions: "180,000 — 220,000",
          clicks: "3,500 — 4,500",
          conversions: "80 — 120 store visits",
          costPerConversion: "₹150 — ₹200",
        },
      },
    },
  });
  console.log(`  Campaign: Diwali Saree Collection 2025`);

  // ── Business 2: Rahul's Coaching Institute ───────────────────────────────────
  const coaching = await prisma.business.upsert({
    where: { id: "demo-business-coaching-001" },
    update: {},
    create: {
      id: "demo-business-coaching-001",
      ownerId: demoUser.id,
      name: "Rahul's Coaching Institute",
      description:
        "We provide IIT-JEE and NEET coaching for Class 11 and 12 students in Bhopal. Small batch size of 20 students. 8 years of results — 340+ selections in IITs and NITs.",
      businessType: "education",
      industryCategory: "coaching",
      city: "Bhopal",
      state: "Madhya Pradesh",
      cityTier: 2,
      avgMonthlyBudget: 2000000,
      targetAudience: {
        ageRange: "parents 35-55, students 15-18",
        gender: "all",
        interests: ["IIT-JEE", "NEET", "education", "engineering"],
        languages: ["Hindi", "English"],
      },
    },
  });
  console.log(`  Business: ${coaching.name}`);

  await prisma.campaign.upsert({
    where: { id: "demo-campaign-coaching-admissions-001" },
    update: {},
    create: {
      id: "demo-campaign-coaching-admissions-001",
      businessId: coaching.id,
      userId: demoUser.id,
      name: "JEE/NEET Admissions 2025-26",
      goal: "leads",
      platform: "both",
      status: "live",
      dailyBudgetPaise: 100000,
      monthlyBudgetPaise: 3000000,
      startDate: new Date("2025-05-01"),
      endDate: new Date("2025-07-31"),
      totalImpressions: 312000,
      totalClicks: 7800,
      totalConversions: 156,
      totalSpendPaise: 5200000,
      aiModelUsed: "gpt-4o",
      aiStrategy: {
        summary:
          "Admission season campaign targeting parents of Class 10 pass-outs in Bhopal. Lead generation focus with free demo class CTA. High intent audience — decision made within 2-3 weeks.",
        campaignName: "JEE NEET Admissions 2025-26 — Rahul's Coaching",
        objective: "LEAD_GENERATION",
        budgetRecommendation: {
          daily: 1000,
          weekly: 7000,
          note: "Peak admission month is June — increase to ₹1,500/day in June",
        },
        headlines: [
          "IIT-JEE / NEET 2026 की तैयारी — Free Demo Class",
          "340+ Selections in IIT & NIT — Join Rahul's Coaching",
          "Bhopal's Top JEE NEET Coaching — Batch Starting June 1",
          "छोटे Batch, बड़े Results — सिर्फ 20 Students Per Batch",
        ],
        descriptions: [
          "8 साल का अनुभव, 340+ IIT-NIT Selections। Class 11-12 के लिए JEE और NEET की specialized coaching। Free demo class के लिए अभी call करें।",
          "Small batch coaching with personal attention. Rahul's Coaching Bhopal — where IIT dreams become reality. Free demo class available.",
        ],
        keywords: {
          google: [
            "iit jee coaching bhopal",
            "neet coaching bhopal",
            "best coaching institute bhopal",
            "jee coaching class 11 bhopal",
            "neet preparation bhopal",
            "iit coaching madhya pradesh",
            "engineering entrance coaching bhopal",
          ],
        },
        targeting: {
          locations: ["Bhopal", "Sehore", "Vidisha"],
          ageRange: "35-55",
          gender: "ALL",
          interests: ["education", "competitive exams", "IIT", "engineering", "medicine"],
          behaviors: ["parents of teens", "education seekers"],
        },
        indiaIntelligence: {
          seasonAlert: "Admission season May-July is peak. Board results declared in May trigger immediate coaching searches.",
          insight: "Parents in Tier-2 cities research online but call to decide. Use call extensions on Google Ads.",
        },
        estimatedResults: {
          impressions: "300,000+",
          clicks: "7,000 — 9,000",
          leads: "140 — 180 inquiry calls",
          costPerLead: "₹300 — ₹400",
        },
      },
    },
  });
  console.log(`  Campaign: JEE/NEET Admissions 2025-26`);

  // ── Business 3: Spice Garden Restaurant ─────────────────────────────────────
  const restaurant = await prisma.business.upsert({
    where: { id: "demo-business-restaurant-001" },
    update: {},
    create: {
      id: "demo-business-restaurant-001",
      ownerId: demoUser.id,
      name: "Spice Garden Restaurant",
      description:
        "Authentic North Indian restaurant in Pune serving dal makhani, butter chicken and fresh tandoori roti. Family-friendly, AC seating for 80 guests. Open for lunch and dinner.",
      businessType: "food_beverage",
      industryCategory: "restaurant",
      city: "Pune",
      state: "Maharashtra",
      cityTier: 1,
      avgMonthlyBudget: 3000000,
      targetAudience: {
        ageRange: "22-50",
        gender: "all",
        interests: ["North Indian food", "dining out", "family restaurants"],
        languages: ["Hindi", "English", "Marathi"],
      },
    },
  });
  console.log(`  Business: ${restaurant.name}`);

  await prisma.campaign.upsert({
    where: { id: "demo-campaign-restaurant-weekend-001" },
    update: {},
    create: {
      id: "demo-campaign-restaurant-weekend-001",
      businessId: restaurant.id,
      userId: demoUser.id,
      name: "Weekend Family Dining — Pune",
      goal: "footfall",
      platform: "meta",
      status: "live",
      dailyBudgetPaise: 50000,
      monthlyBudgetPaise: 1500000,
      startDate: new Date("2025-06-01"),
      endDate: new Date("2025-08-31"),
      totalImpressions: 94000,
      totalClicks: 2100,
      totalConversions: 63,
      totalSpendPaise: 980000,
      aiModelUsed: "gpt-4o",
      aiStrategy: {
        summary:
          "Weekend footfall campaign on Facebook and Instagram targeting families in a 5km radius of the restaurant. Friday-Sunday boosted scheduling. Offer-based creative for family dining.",
        campaignName: "Weekend Family Dining — Spice Garden Pune",
        objective: "STORE_TRAFFIC",
        budgetRecommendation: {
          daily: 500,
          weekendBoost: "Increase to ₹800 on Friday and Saturday",
          note: "Run ads 11am-2pm and 6pm-9pm for highest reservation intent",
        },
        headlines: [
          "Weekend Special — Family Thali at ₹299",
          "Pune के बेस्ट North Indian खाने का मज़ा — Spice Garden",
          "Dal Makhani, Butter Chicken, Fresh Tandoori Roti — Dine with Family",
          "Book a Table for 4, Get Dessert Free — This Weekend Only",
        ],
        descriptions: [
          "Spice Garden में मिलता है authentic North Indian khana — गरम तंदूरी रोटी, मखनी दाल, और बहुत कुछ। Family के लिए perfect जगह। Swiggy aur Zomato pe bhi available.",
          "Pune's favourite North Indian restaurant. AC seating for 80. Perfect for family weekends, office lunches and special occasions.",
        ],
        targeting: {
          locations: {
            type: "radius",
            center: "Spice Garden Restaurant, Pune",
            radiusKm: 5,
          },
          ageRange: "25-50",
          gender: "ALL",
          interests: ["restaurants", "North Indian cuisine", "family dining", "food"],
          behaviors: ["frequent diners", "weekend outings"],
          placement: ["Facebook Feed", "Instagram Feed", "Instagram Stories"],
        },
        indiaIntelligence: {
          cityInsight: "Pune Tier-1 — high disposable income, strong dining-out culture. Instagram Stories perform 30% better than feed for restaurant ads in Tier-1 cities.",
          seasonNote: "Monsoon (June-Sep) reduces footfall — use delivery offer CTA as backup.",
        },
        estimatedResults: {
          impressions: "90,000 — 110,000",
          reach: "40,000 — 55,000 unique people",
          storeVisits: "60 — 90 per month",
          costPerVisit: "₹150 — ₹250",
        },
      },
    },
  });
  console.log(`  Campaign: Weekend Family Dining`);

  console.log("\n✅ Demo seed complete!");
  console.log("─────────────────────────────────────────");
  console.log("Login: demo@adpilotindia.com");
  console.log("Password: Demo@2025!");
  console.log("─────────────────────────────────────────");
  console.log("3 businesses + 3 campaigns created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
