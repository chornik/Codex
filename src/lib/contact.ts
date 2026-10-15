export function contactText(
  item: {
    title: string;
    manufacturer: string;
    model: string;
    partNumber: string;
    parameters: string;
  },
  hit: { title: string; partNumber: string },
) {
  return {
    subject: `Unverbindliche Ersatzteilanfrage: ${hit.title}`,
    body: `Guten Tag,\n\nwir recherchieren ein Ersatzteil für eine technische Anlage unserer Hotelgruppe.\n\nSuchfall: ${item.title}\nHersteller: ${item.manufacturer || "ungeklärt"}\nModell: ${item.model || "ungeklärt"}\nArtikelnummer Bestand: ${item.partNumber || "ungeklärt"}\nAngefragter Kandidat: ${hit.title} (${hit.partNumber})\nTechnische Angaben (noch zu verifizieren):\n${item.parameters || "noch zu ergänzen"}\n\nBitte bestätigen Sie die genaue Artikelidentität, den Zustand, den tatsächlichen Lagerbestand, Preis, Lieferzeit, Gewährleistung und Rückgabemöglichkeiten. Bitte senden Sie ein Originaldatenblatt sowie Angaben zu Anschluss, Abmessungen und eventuellen notwendigen Adaptern.\n\nDie technische Eignung und etwaige Nachfolgebeziehung sind noch nicht bestätigt. Wir bitten um belastbare Unterlagen zur Prüfung durch unser Fachpersonal.\n\nDies ist eine unverbindliche Anfrage und keine Bestellung.\n\nMit freundlichen Grüßen\nTechnical Services`,
  };
}
