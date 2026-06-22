import { logger } from "../../lib/logger";

export interface MetaAd {
  id: string;
  pageId: string;
  pageName: string;
  adCreativeBody: string;
  adCreativeLinkCaption?: string;
  impressionsMin?: number;
  impressionsMax?: number;
  spendMin?: number;
  spendMax?: number;
  startDate: string;
  platforms: string[];
}

export class MetaAdLibraryService {
  async fetchAds(searchQuery: string, country = "IN"): Promise<MetaAd[]> {
    // Meta Ad Library API — free and legal for public ad data
    // Requires a valid Meta access token with ads_read permission
    const accessToken = process.env.META_AD_LIBRARY_ACCESS_TOKEN;

    if (!accessToken) {
      logger.warn("META_AD_LIBRARY_ACCESS_TOKEN not set — skipping ad library fetch");
      return [];
    }

    try {
      const params = new URLSearchParams({
        access_token: accessToken,
        search_terms: searchQuery,
        ad_reached_countries: country,
        ad_active_status: "ALL",
        fields: "id,page_id,page_name,ad_creative_bodies,ad_creative_link_captions,impressions,spend,ad_delivery_start_time,publisher_platforms",
        limit: "25",
      });

      const res = await fetch(`https://graph.facebook.com/v19.0/ads_archive?${params}`);
      if (!res.ok) return [];

      const data = await res.json() as { data: any[] };

      return data.data.map((ad: any) => ({
        id: ad.id,
        pageId: ad.page_id,
        pageName: ad.page_name,
        adCreativeBody: (ad.ad_creative_bodies?.[0]) ?? "",
        adCreativeLinkCaption: ad.ad_creative_link_captions?.[0],
        impressionsMin: ad.impressions?.lower_bound,
        impressionsMax: ad.impressions?.upper_bound,
        spendMin: ad.spend?.lower_bound,
        spendMax: ad.spend?.upper_bound,
        startDate: ad.ad_delivery_start_time ?? "",
        platforms: ad.publisher_platforms ?? [],
      }));
    } catch (err) {
      logger.error("Meta Ad Library fetch failed", err);
      return [];
    }
  }
}

export const metaAdLibraryService = new MetaAdLibraryService();
