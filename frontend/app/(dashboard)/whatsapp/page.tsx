import { Metadata } from "next";

export const metadata: Metadata = { title: "WhatsApp Agent" };

export default function WhatsAppPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">WhatsApp AI Agent</h1>
        <p className="text-muted-foreground mt-1">
          Automatically qualify leads, answer FAQs, and book appointments via WhatsApp.
        </p>
      </div>
      <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
        <p className="font-medium">WhatsApp Agent — Coming in Phase 3</p>
        <p className="text-sm mt-2">
          WhatsApp Business API approval is in progress. This module will be available soon.
        </p>
      </div>
    </div>
  );
}
