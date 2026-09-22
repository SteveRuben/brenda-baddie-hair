import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import UsersManager from "@/components/UsersManager";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin") redirect("/admin");

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Utilisateurs</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Comptes administrateur et employés ayant accès au backoffice.
      </p>
      <div className="mt-6">
        <UsersManager />
      </div>
    </div>
  );
}
