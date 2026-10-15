export const categories = [
  "Heizung",
  "Klima & Kälte",
  "Pumpen",
  "Ventile & Antriebe",
  "Lüftung",
  "Gebäudeleittechnik",
  "Steuerungen & Platinen",
  "Motoren",
  "Brandschutz",
  "Sensoren & Aktoren",
] as const;
export const urgencyLabels: Record<string, string> = {
  NORMAL: "Normal",
  HIGH: "Hoch",
  CRITICAL: "Kritisch",
};
export const statusLabels: Record<string, string> = {
  OPEN: "Offen",
  RESEARCHING: "In Recherche",
  REVIEW: "Technische Prüfung",
  RESOLVED: "Recherche abgeschlossen",
};
export const reviewLabels: Record<string, string> = {
  UNREVIEWED: "Ungeprüft",
  APPROVED: "Für Kontakt freigegeben",
  REJECTED: "Abgelehnt",
  TECHNICAL_REVIEW: "Technisch prüfen",
};
export const kindLabels: Record<string, string> = {
  ORIGINAL: "Originalteil",
  ALTERNATIVE: "Mögliche Alternative",
  WEB: "Webhinweis",
};
export const stages = [
  "Originalteil & Artikelnummer",
  "Nachfolger & andere Bezeichnungen",
  "Mögliche technische Alternativen",
  "Internationale Restbestände",
] as const;
export function euro(value: number | null | undefined) {
  return value == null
    ? "Auf Anfrage"
    : new Intl.NumberFormat("de-AT", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(value);
}
export function date(value: string | Date) {
  return new Intl.DateTimeFormat("de-AT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Vienna",
  }).format(new Date(value));
}
