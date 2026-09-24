import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NewsletterAdmin from "@/components/NewsletterAdmin";

export const dynamic = "force-dynamic";

export default async function NewsletterPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin" && role !== "employe") redirect("/admin/login");

  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Newsletter</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {subscribers.length} abonné{subscribers.length > 1 ? "s" : ""} — exportez
        la liste en CSV pour vos campagnes (Brevo, Mailchimp…).
      </p>
      <div className="mt-6">
        <NewsletterAdmin
          subscribers={subscribers.map((s) => ({
            id: s.id,
            email: s.email,
            createdAt: s.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
