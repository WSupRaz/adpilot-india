import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen flex">
      <nav className="w-56 border-r bg-muted/30 p-4 space-y-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Admin</p>
        {[
          { label: "Users", href: "/admin/users" },
          { label: "Revenue", href: "/admin/revenue" },
          { label: "AI Usage", href: "/admin/ai-usage" },
          { label: "System", href: "/admin/system" },
        ].map((item) => (
          <a key={item.href} href={item.href} className="block rounded-md px-3 py-2 text-sm hover:bg-muted">
            {item.label}
          </a>
        ))}
      </nav>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
