"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Megaphone,
  Search,
  Paintbrush,
  Users,
  MessageCircle,
  TrendingUp,
  Settings,
  CreditCard,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",  label: "Dashboard",      icon: LayoutDashboard },
  { href: "/campaigns",  label: "Campaigns",       icon: Megaphone },
  { href: "/audit",      label: "Website Audit",   icon: Search },
  { href: "/creatives",  label: "Creatives",       icon: Paintbrush },
  { href: "/competitors",label: "Competitors",     icon: Users },
  { href: "/growth",     label: "Growth Manager",  icon: TrendingUp },
  { href: "/whatsapp",   label: "WhatsApp Agent",  icon: MessageCircle },
];

const bottomItems = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/billing",  label: "Billing",  icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName = session?.user?.name ?? "User";
  const userEmail = session?.user?.email ?? "";
  const userInitial = userName[0]?.toUpperCase() ?? "U";

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <aside className="hidden md:flex w-56 flex-col border-r bg-background">
      {/* Logo */}
      <Link
        href="/dashboard"
        className="flex h-16 items-center gap-2.5 px-4 border-b hover:bg-muted/40 transition-colors"
      >
        <div className="h-7 w-7 rounded-md bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-xs font-black text-white shrink-0">
          A
        </div>
        <div>
          <p className="text-sm font-bold leading-none">AdPilot</p>
          <p className="text-xs text-orange-500 font-semibold leading-none mt-0.5">India</p>
        </div>
      </Link>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors border-l-2",
                active
                  ? "border-l-primary bg-primary/8 text-primary"
                  : "border-l-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings + Billing */}
      <div className="border-t py-2 px-2 space-y-0.5">
        {bottomItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors border-l-2",
                active
                  ? "border-l-primary bg-primary/8 text-primary"
                  : "border-l-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>

      {/* User section */}
      <div className="border-t p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 group">
          <div className="h-7 w-7 rounded-full bg-primary/12 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            {userInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate leading-none">{userName}</p>
            <p className="text-[10px] text-muted-foreground truncate mt-0.5 leading-none">{userEmail}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            title="Sign out"
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 opacity-0 group-hover:opacity-100"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
