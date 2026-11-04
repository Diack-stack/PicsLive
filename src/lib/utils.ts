import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalise un numéro WhatsApp au format international standard E.164.
 * Exemple: 77 123 45 67 -> +221771234567
 */
export function formatWhatsAppToE164(phone: string, defaultCountryCode = "221"): string {
  // Supprimer espaces, tirets, parenthèses
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, "");

  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  if (cleaned.startsWith("00")) {
    return "+" + cleaned.substring(2);
  }

  // Si commence par un zéro local (ex: 077...)
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }

  return `+${defaultCountryCode}${cleaned}`;
}

export function formatDateFr(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return dateString;
  }
}

