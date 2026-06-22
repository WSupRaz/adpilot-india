export const CREDIT_COSTS = {
  campaign_generate: 15,
  campaign_regenerate_section: 5,
  audit_analyze: 10,
  audit_full_lighthouse: 25,
  creative_generate: 8,
  competitor_analyze: 20,
  growth_plan: 20,
  whatsapp_ai_response: 1,
  pdf_report_generate: 2,
} as const;

export type CreditOperation = keyof typeof CREDIT_COSTS;
