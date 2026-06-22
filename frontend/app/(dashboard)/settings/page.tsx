import { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      <section className="rounded-lg border divide-y">
        {[
          { label: "Profile", desc: "Name, email, avatar, language preference" },
          { label: "Business", desc: "Manage your registered businesses" },
          { label: "Ad Accounts", desc: "Connect Google Ads and Meta Ads accounts" },
          { label: "Team", desc: "Invite team members and manage roles" },
          { label: "Notifications", desc: "Email and in-app notification preferences" },
          { label: "API Keys", desc: "Generate API keys for integrations" },
          { label: "Danger Zone", desc: "Delete account or data" },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <button className="text-xs text-primary hover:underline">Edit</button>
          </div>
        ))}
      </section>
    </div>
  );
}
