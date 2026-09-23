"use client";

import { useCurrency } from "@/lib/currency";

/**
 * Affiche un prix dans la devise du visiteur (EUR en Europe, USD ailleurs).
 */
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
  const { format, currency } = useCurrency();
  const main = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-lg";
  const compareValue = currency === "EUR" ? compareEUR : compareUSD;
  return (
    <div>
      <p className={`font-extrabold text-brand-700 ${main}`}>
        {format(usd, eur)}
      </p>
      {compareValue ? (
        <p className="text-sm text-neutral-400 line-through">
          {format(compareUSD ?? 0, compareEUR ?? 0)}
        </p>
      ) : null}
    </div>
  );
}
