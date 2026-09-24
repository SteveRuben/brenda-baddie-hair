import Image from "next/image";

// Logo « Profil au vent » — proposition A validée le 2026-09-24.
// Emblème (tête féminine, chevelure rose) + premier mot en script rose,
// suite en serif capitales espacées. Suit le réglage « Nom de la boutique ».

export default function Logo({
  name,
  variant = "light",
  className = "",
}: {
  name: string;
  variant?: "light" | "dark";
  className?: string;
}) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const [first, ...rest] = words;
  if (!first) return null;
  const capsColor = variant === "dark" ? "text-logo-cream" : "text-[#232320]";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src="/images/logo-embleme.webp"
        alt=""
        width={88}
        height={88}
        className="h-11 w-11 rounded-full object-cover"
        priority
      />
      <span className="flex flex-col leading-none">
        <span className="font-script text-[30px] text-logo-pink">{first}</span>
        {rest.length > 0 && (
          <span
            className={`font-display text-[11px] font-semibold uppercase ${capsColor} tracking-[0.28em] pl-[0.28em]`}
          >
            {rest.join(" ")}
          </span>
        )}
      </span>
    </span>
  );
}
