"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/audit", label: "Audit" },
  { href: "/creatives", label: "Creatives" },
  { href: "/competitors", label: "Competitors" },
  { href: "/whatsapp", label: "WhatsApp Agent" },
  { href: "/growth", label: "Growth Manager" },
  { href: "/settings", label: "Settings" },
  { href: "/billing", label: "Billing" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button onClick={() => setOpen(!open)} className="p-2 rounded-md hover:bg-muted">
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 z-50 bg-background border-b shadow-lg py-3 px-4 space-y-1">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
