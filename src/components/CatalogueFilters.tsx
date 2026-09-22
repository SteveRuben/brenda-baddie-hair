"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function CatalogueFilters({
  colors,
  brands,
  sizes,
  current,
}: {
  colors: string[];
  brands: string[];
  sizes: string[];
  current: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const sp = new URLSearchParams(searchParams.toString());
    if (value) sp.set(key, value);
    else sp.delete(key);
    router.push(`/catalogue?${sp.toString()}`);
  }

  const inputCls =
    "rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <input
        defaultValue={current.q ?? ""}
        placeholder="Rechercher…"
        className={inputCls}
        onKeyDown={(e) => {
          if (e.key === "Enter") update("q", (e.target as HTMLInputElement).value);
        }}
      />
      <select
        defaultValue={current.color ?? ""}
        className={inputCls}
        onChange={(e) => update("color", e.target.value)}
      >
        <option value="">Toutes couleurs</option>
        {colors.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        defaultValue={current.brand ?? ""}
        className={inputCls}
        onChange={(e) => update("brand", e.target.value)}
      >
        <option value="">Toutes marques</option>
        {brands.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>
      <select
        defaultValue={current.size ?? ""}
        className={inputCls}
        onChange={(e) => update("size", e.target.value)}
      >
        <option value="">Toutes tailles</option>
        {sizes.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <input
        type="number"
        min={0}
        defaultValue={current.minUSD ?? ""}
        placeholder="Prix min ($)"
        className={`${inputCls} w-28`}
        onKeyDown={(e) => {
          if (e.key === "Enter") update("minUSD", (e.target as HTMLInputElement).value);
        }}
      />
      <input
        type="number"
        min={0}
        defaultValue={current.maxUSD ?? ""}
        placeholder="Prix max ($)"
        className={`${inputCls} w-28`}
        onKeyDown={(e) => {
          if (e.key === "Enter") update("maxUSD", (e.target as HTMLInputElement).value);
        }}
      />
      <input
        type="number"
        min={0}
        defaultValue={current.minEUR ?? ""}
        placeholder="Prix min (€)"
        className={`${inputCls} w-28`}
        onKeyDown={(e) => {
          if (e.key === "Enter") update("minEUR", (e.target as HTMLInputElement).value);
        }}
      />
      <input
        type="number"
        min={0}
        defaultValue={current.maxEUR ?? ""}
        placeholder="Prix max (€)"
        className={`${inputCls} w-28`}
        onKeyDown={(e) => {
          if (e.key === "Enter") update("maxEUR", (e.target as HTMLInputElement).value);
        }}
      />
      <select
        defaultValue={current.sort ?? ""}
        className={inputCls}
        onChange={(e) => update("sort", e.target.value)}
      >
        <option value="">Nouveautés</option>
        <option value="price-asc">Prix croissant</option>
        <option value="price-desc">Prix décroissant</option>
        <option value="popular">Popularité</option>
      </select>
    </div>
  );
}
