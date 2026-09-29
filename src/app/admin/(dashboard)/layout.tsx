import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  // Filet de sécurité en plus du proxy (src/proxy.ts) : un compte client
  // (role "customer") authentifié ne doit jamais voir le backoffice.
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isStaff = role === "admin" || role === "employe";
  if (!isStaff) redirect("/admin/login");

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  return (
    <AdminShell role={role as string} signOutAction={signOutAction}>
      {children}
    </AdminShell>
  );
}
