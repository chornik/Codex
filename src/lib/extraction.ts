export type ExtractedFields = Partial<
  Record<
    "manufacturer" | "model" | "serialNumber" | "partNumber" | "parameters",
    string
  >
>;
export function extractFields(text: string): ExtractedFields {
  const result: ExtractedFields = {};
  const brand = text.match(
    /\b(Siemens|Grundfos|Danfoss|Belimo|Wilo|Honeywell|Johnson Controls|Landis\s*&?\s*Staefa|ABB)\b/i,
  );
  if (brand) result.manufacturer = brand[1];
  const model = text.match(
    /\b(?:Modell|Model|Typ|Type)\b\s*[:=]?\s*([^\n\r:]{2,70})/i,
  );
  const known = text.match(
    /\b(SQX\s?32\.00|SAX\s?31\.00|UPS\s?32[- ]80(?:\s180)?|EKC\s?202D|NV230A)\b/i,
  );
  if (model) result.model = model[1].trim();
  else if (known) result.model = known[1];
  const serial = text.match(
    /(?:Seriennummer|Serial(?:\s*(?:No\.?|Number))?|S\/N)\s*[:=]?\s*([A-Z0-9./-]{3,60})/i,
  );
  if (serial) result.serialNumber = serial[1];
  const part = text.match(
    /(?:Artikel(?:nummer|[- ]?Nr\.?)|Part\s*(?:No\.?|Number)|Bestellnummer|P\/N)\s*[:=]?\s*([A-Z0-9. /-]{2,60})/i,
  );
  if (part) result.partNumber = part[1].trim();
  const parameters = text
    .split(/[\n\r]+/)
    .filter((line) =>
      /\b\d+(?:[.,]\d+)?\s*(?:V|Hz|W|kW|mm|bar|mA|Nm|N|°C|m³\/h)\b/i.test(line),
    )
    .map((line) => line.trim())
    .slice(0, 15);
  if (parameters.length) result.parameters = parameters.join("\n");
  return result;
}
