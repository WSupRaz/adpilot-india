import { Metadata } from "next";
import { CampaignWizard } from "@/components/campaign/CampaignWizard";

export const metadata: Metadata = { title: "New Campaign" };

export default function NewCampaignPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Campaign</h1>
        <p className="text-muted-foreground mt-1">
          Tell us what result you want and we&apos;ll build the campaign.
        </p>
      </div>
      <CampaignWizard />
    </div>
  );
}
