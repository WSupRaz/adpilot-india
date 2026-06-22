import Link from "next/link";
import { Building2, Megaphone, ArrowRight } from "lucide-react";

export function OnboardingPrompt() {
  return (
    <div className="rounded-xl border bg-primary/5 p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Get started in 3 minutes</h2>
        <p className="text-sm text-muted-foreground mt-1">
          You have 50 free AI credits. Use them to generate your first professional campaign.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="flex items-start gap-3 rounded-lg border bg-background p-4">
          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary">1</span>
          </div>
          <div>
            <p className="text-sm font-medium">Add your business</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Name, location, type — takes 30 seconds.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border bg-background p-4">
          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary">2</span>
          </div>
          <div>
            <p className="text-sm font-medium">Generate your campaign</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tell us your goal — AI does the rest in 60 seconds.
            </p>
          </div>
        </div>
      </div>

      <Link
        href="/campaigns/new"
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
      >
        Create your first campaign
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
