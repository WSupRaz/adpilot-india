import { prisma } from "../config/database";
import { NotFoundError, ForbiddenError, ConflictError } from "../lib/errors";
import { getCityTier } from "../../../shared/src/constants/india";

interface CreateBusinessInput {
  name: string;
  description?: string;
  businessType?: string;
  industryCategory?: string;
  websiteUrl?: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  pincode?: string;
  cityTier?: number;
}

const BUSINESS_SELECT = {
  id: true,
  name: true,
  description: true,
  businessType: true,
  industryCategory: true,
  websiteUrl: true,
  phone: true,
  email: true,
  city: true,
  state: true,
  pincode: true,
  cityTier: true,
  logoUrl: true,
  googleAdsCustomerId: true,
  googleAdsConnectedAt: true,
  metaAdAccountId: true,
  metaConnectedAt: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  ownerId: true,
};

export class BusinessService {
  async list(ownerId: string) {
    return prisma.business.findMany({
      where: { ownerId, deletedAt: null },
      select: BUSINESS_SELECT,
      orderBy: { createdAt: "desc" },
    });
  }

  async create(ownerId: string, input: CreateBusinessInput) {
    // Infer city tier if not provided
    const cityTier = input.cityTier ?? (input.city ? getCityTier(input.city) : 3);

    return prisma.business.create({
      data: {
        ownerId,
        ...input,
        cityTier,
        websiteUrl: input.websiteUrl || null,
        email: input.email || null,
      },
      select: BUSINESS_SELECT,
    });
  }

  async getById(id: string, ownerId: string) {
    const business = await prisma.business.findFirst({
      where: { id, ownerId, deletedAt: null },
      select: BUSINESS_SELECT,
    });
    if (!business) throw new NotFoundError("Business");
    return business;
  }

  async update(id: string, ownerId: string, input: Partial<CreateBusinessInput>) {
    await this.getById(id, ownerId); // Ownership check

    const cityTier =
      input.cityTier ?? (input.city ? getCityTier(input.city) : undefined);

    return prisma.business.update({
      where: { id },
      data: {
        ...input,
        ...(cityTier !== undefined ? { cityTier } : {}),
        websiteUrl: input.websiteUrl !== undefined ? (input.websiteUrl || null) : undefined,
        email: input.email !== undefined ? (input.email || null) : undefined,
      },
      select: BUSINESS_SELECT,
    });
  }

  async delete(id: string, ownerId: string) {
    await this.getById(id, ownerId); // Ownership check
    await prisma.business.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getStats(businessId: string, ownerId: string) {
    await this.getById(businessId, ownerId); // Ownership check

    const [campaignCount, auditCount] = await Promise.all([
      prisma.campaign.count({ where: { businessId, deletedAt: null } }),
      prisma.audit.count({ where: { businessId } }),
    ]);

    const liveCampaign = await prisma.campaign.findFirst({
      where: { businessId, status: "live", deletedAt: null },
      select: { totalSpendPaise: true, totalClicks: true, totalConversions: true },
    });

    return {
      campaignCount,
      auditCount,
      totalSpendPaise: liveCampaign?.totalSpendPaise ?? 0,
      totalClicks: liveCampaign?.totalClicks ?? 0,
      totalConversions: liveCampaign?.totalConversions ?? 0,
    };
  }
}

export const businessService = new BusinessService();
