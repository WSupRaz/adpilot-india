import { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Users" };

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <input
          type="search"
          placeholder="Search users..."
          className="rounded-md border px-3 py-1.5 text-sm w-64"
        />
      </div>
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {["Name", "Email", "Plan", "Credits", "Status", "Joined"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                No users found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
