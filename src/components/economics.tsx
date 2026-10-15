"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, TrendingUp, Info } from "lucide-react";
import type { FullCase } from "@/lib/types";
import { calculateBenefit, type BenefitInput } from "@/lib/validation";
import { euro } from "@/lib/labels";
import { Button, Notice, api, errorText } from "./ui";
export function Economics({ item }: { item: FullCase }) {
  const [data, setData] = useState<BenefitInput>(
    item.benefit || {
      partCost: 0,
      laborCost: 0,
      replacementCost: 0,
      downtimeDays: 0,
      dailyCost: 0,
      extensionMonths: 0,
      notes: "",
    },
  );
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const value = calculateBenefit(data);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    setError("");
    try {
      await api(`/api/cases/${item.id}/benefit`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="section-intro">
        <div>
          <h2>Ein gefundenes Teil kann mehr bewirken.</h2>
          <p>
            Dokumentieren Sie eine nachvollziehbare Schätzung – alle Beträge
            netto in EUR.
          </p>
        </div>
      </div>
      {error && <Notice text={error} error />}
      {saved && <Notice text="Wirtschaftliche Einschätzung gespeichert." />}
      <div className="economics-layout">
        <form className="panel padded" onSubmit={save}>
          <h2>Annahmen & Kosten</h2>
          <div className="form-grid">
            {(
              [
                {
                  key: "partCost",
                  label: "Kosten Ersatzteil (€)",
                  step: "0.01",
                },
                {
                  key: "laborCost",
                  label: "Einbau & Nebenarbeiten (€)",
                  step: "0.01",
                },
                {
                  key: "replacementCost",
                  label: "Vergleich: Gesamtanlagentausch (€)",
                  step: "0.01",
                },
                {
                  key: "downtimeDays",
                  label: "Vermiedene Ausfalltage (Annahme)",
                  step: "0.5",
                },
                {
                  key: "dailyCost",
                  label: "Ausfallkosten pro Tag (€)",
                  step: "0.01",
                },
                {
                  key: "extensionMonths",
                  label: "Mögliche Lebensdauerverlängerung (Monate)",
                  step: "1",
                },
              ] as const
            ).map((f) => (
              <label className="field" key={f.key}>
                {f.label}
                <input
                  type="number"
                  min="0"
                  max={
                    f.key === "extensionMonths"
                      ? 600
                      : f.key === "downtimeDays"
                        ? 3650
                        : f.key === "replacementCost"
                          ? 100000000
                          : 10000000
                  }
                  step={f.step}
                  required
                  value={data[f.key]}
                  onChange={(e) => {
                    setSaved(false);
                    setData({ ...data, [f.key]: Number(e.target.value) });
                  }}
                />
              </label>
            ))}
            <label className="field span-2">
              Grundlage der Schätzung
              <textarea
                rows={4}
                maxLength={3000}
                value={data.notes}
                onChange={(e) => {
                  setSaved(false);
                  setData({ ...data, notes: e.target.value });
                }}
                placeholder="Angebote, Szenarien, offene Annahmen und Datum der Einschätzung …"
              />
            </label>
          </div>
          <Button type="submit" busy={busy}>
            <Save size={16} />
            Einschätzung speichern
          </Button>
        </form>
        <aside>
          <div className="benefit-card">
            <span className="benefit-icon">
              <TrendingUp size={23} />
            </span>
            <span className="eyebrow">
              POTENZIELLER WIRTSCHAFTLICHER NUTZEN
            </span>
            <strong className="benefit-total">
              {euro(value.potentialBenefit)}
            </strong>
            <p>Rechenwert auf Basis Ihrer Annahmen</p>
            <div className="benefit-breakdown">
              <div>
                <span>Vergleichsinvestition</span>
                <strong>{euro(data.replacementCost)}</strong>
              </div>
              <div>
                <span>− Ersatzteil & Einbau</span>
                <strong>{euro(value.repairCost)}</strong>
              </div>
              <div>
                <span>+ vermiedene Ausfallkosten</span>
                <strong>{euro(value.avoidedDowntime)}</strong>
              </div>
            </div>
            <div className="life-extension">
              <span>Mögliche weitere Nutzung</span>
              <strong>{data.extensionMonths} Monate</strong>
            </div>
          </div>
          <div className="inline-note">
            <Info size={19} />
            <p>
              Schätzung, keine garantierte Einsparung. Ein aufgeschobener
              Anlagentausch ist kein dauerhaft vermiedener Aufwand.
              Ausfallkosten dürfen nicht bereits im Vergleichsszenario enthalten
              sein. Die Lebensdauerverlängerung wird nicht monetarisiert.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
