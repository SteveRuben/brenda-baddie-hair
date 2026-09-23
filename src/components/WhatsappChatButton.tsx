"use client";

import { usePathname } from "next/navigation";
import { WhatsappIcon } from "./SocialIcons";

export default function WhatsappChatButton({ href }: { href: string }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Discuter avec nous sur WhatsApp"
      title="Discuter avec nous sur WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
    >
      <WhatsappIcon size={28} />
    </a>
  );
}
