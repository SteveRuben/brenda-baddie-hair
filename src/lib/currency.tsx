"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { formatUSD, formatEUR } from "./format";

export type Currency = "EUR" | "USD";

interface CurrencyContextValue {
  currency: Currency;
  /** Formate un prix dans la devise active (EUR en Europe, USD ailleurs). */
  format: (usd: number, eur: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

/**
 * Détection géographique du visiteur :
 * 1. immédiate via le fuseau horaire (Europe/ → EUR),
 * 2. affinée via la géolocalisation de son IP (continent EU → EUR).
 * Sans sélecteur manuel : la devise suit toujours la zone du visiteur.
 */
function detectFromTimezone(): Currency {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    if (tz.startsWith("Europe/")) return "EUR";
  } catch {
    /* repli : USD */
  }
  return "USD";
}

async function detectFromIP(signal: AbortSignal): Promise<Currency | null> {
  try {
    const res = await fetch("https://ipwho.is/", { signal });
    if (!res.ok) return null;
    const data = await res.json();
    if (typeof data?.continent_code !== "string") return null;
    return data.continent_code === "EU" ? "EUR" : "USD";
  } catch {
    return null;
  }
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // USD par défaut pour éviter tout décalage d'hydratation ;
  // la vraie devise est détectée au montage côté client.
  const [currency, setCurrency] = useState<Currency>("USD");

  useEffect(() => {
    const controller = new AbortController();
    // Réponse immédiate via le fuseau horaire…
    setCurrency(detectFromTimezone());
    // …puis affinement via l'IP du visiteur.
    detectFromIP(controller.signal).then((c) => {
      if (c) setCurrency(c);
    });
    return () => controller.abort();
  }, []);

  const value: CurrencyContextValue = {
    currency,
    format(usd: number, eur: number) {
      return currency === "EUR" ? formatEUR(eur) : formatUSD(usd);
    },
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx)
    throw new Error("useCurrency doit être utilisé dans <CurrencyProvider>");
  return ctx;
}
