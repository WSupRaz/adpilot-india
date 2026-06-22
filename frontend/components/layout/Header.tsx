"use client";

import { useSession, signOut } from "next-auth/react";
import { Bell, ChevronDown } from "lucide-react";
import { CreditMeter } from "@/components/shared/CreditMeter";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { MobileNav } from "./MobileNav";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex h-16 items-center justify-between border-b px-6 bg-background">
      <MobileNav />

      <div className="flex items-center gap-4 ml-auto">
        <LanguageToggle />
        <CreditMeter compact />

        <button className="relative p-2 rounded-md hover:bg-muted">
          <Bell className="h-4 w-4" />
          {/* Notification badge */}
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
        </button>

        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
            {session?.user?.name?.[0] ?? "U"}
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
