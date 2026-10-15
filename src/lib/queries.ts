import { stages } from "./labels";
export type Identity = {
  manufacturer: string;
  model: string;
  partNumber: string;
  category: string;
  parameters: string;
};
export function buildQueries(input: Identity) {
  const identity = [input.manufacturer, input.partNumber || input.model]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (!input.partNumber.trim() && !input.model.trim())
    throw new Error("Bitte zuerst Modell oder Artikelnummer erfassen.");
  const synonyms: Record<string, string> = {
    "Ventile & Antriebe": "Stellantrieb Stellmotor valve actuator",
    Pumpen: "Umwälzpumpe circulation pump circulator",
    "Klima & Kälte": "Kühlstellenregler refrigeration controller",
    Heizung: "heating boiler component",
    Lüftung: "ventilation HVAC fan",
    Gebäudeleittechnik: "building automation controller",
    "Steuerungen & Platinen": "control board PCB",
    Motoren: "electric motor",
    Brandschutz: "fire safety damper",
    "Sensoren & Aktoren": "sensor actuator transducer",
  };
  return [
    {
      stage: 1,
      label: stages[0],
      query: `${identity} Ersatzteil Original Restbestand`,
    },
    {
      stage: 2,
      label: stages[1],
      query: `${identity} ${synonyms[input.category] || input.category} Nachfolger successor discontinued replacement`,
    },
    {
      stage: 3,
      label: stages[2],
      query:
        `${identity} ${input.category} alternative technical datasheet ${input.parameters.slice(0, 160).replace(/\n/g, " ")}`.trim(),
    },
    {
      stage: 4,
      label: stages[3],
      query: `${identity} spare part surplus refurbished used Europe`,
    },
  ];
}
