import { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — System Health" };

export default function AdminSystemPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">System Health</h1>
      <div className="space-y-3">
        {[
          { service: "API Server", status: "operational" },
          { service: "Database", status: "operational" },
          { service: "Redis / Queue", status: "operational" },
          { service: "Cloudflare R2", status: "operational" },
          { service: "OpenAI API", status: "unknown" },
          { service: "Anthropic API", status: "unknown" },
          { service: "Razorpay", status: "unknown" },
        ].map((s) => (
          <div key={s.service} className="flex items-center justify-between rounded-lg border px-4 py-3">
            <span className="text-sm font-medium">{s.service}</span>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                s.status === "operational"
                  ? "bg-green-100 text-green-700"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
