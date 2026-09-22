import { formatUSD, formatEUR } from "@/lib/format";

export default function Price({
  usd,
  eur,
  compareUSD,
  compareEUR,
  size = "md",
}: {
  usd: number;
  eur: number;
  compareUSD?: number | null;
  compareEUR?: number | null;
  size?: "sm" | "md" | "lg";
}) {
  const main = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-lg";
  return (
    <div>
      <p className={`font-extrabold text-brand-700 ${main}`}>
        {formatUSD(usd)} <span className="text-neutral-400">/</span> {formatEUR(eur)}
      </p>
      {(compareUSD || compareEUR) && (
        <p className="text-sm text-neutral-400 line-through">
          {compareUSD ? formatUSD(compareUSD) : ""}{" "}
          {compareEUR ? `/ ${formatEUR(compareEUR)}` : ""}
        </p>
      )}
    </div>
  );
}
