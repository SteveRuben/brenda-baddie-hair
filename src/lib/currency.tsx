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
  setCurrency: (c: Currency) => void;
  /** Formate un prix dans la devise active (EUR en Europe, USD ailleurs). */
  format: (usd: number, eur: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);
const STORAGE_KEY = "bbh-currency";

/**
 * Détection géographique simple, sans appel réseau : si le fuseau horaire
 * du visiteur est européen, on affiche les prix en euros, sinon en dollars.
 */
function detectCurrency(): Currency {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    if (tz.startsWith("Europe/")) return "EUR";
  } catch {
    /* repli : USD */
  }
  return "USD";
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // USD par défaut pour éviter tout décalage d'hydratation ;
  // la vraie devise est détectée au montage côté client.
  const [currency, setCurrencyState] = useState<Currency>("USD");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "EUR" || saved === "USD") {
        setCurrencyState(saved);
        return;
      }
    } catch {
      /* stockage indisponible */
    }
    setCurrencyState(detectCurrency());
  }, []);

  const value: CurrencyContextValue = {
    currency,
    setCurrency(c: Currency) {
      setCurrencyState(c);
      try {
        localStorage.setItem(STORAGE_KEY, c);
      } catch {
        /* stockage indisponible */
      }
    },
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
