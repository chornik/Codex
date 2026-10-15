"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Hotel } from "@prisma/client";
import { ArrowRight, Building2, ClipboardList, Save } from "lucide-react";
import { caseSchema, type CaseInput } from "@/lib/validation";
import { categories, urgencyLabels } from "@/lib/labels";
import { Button, Notice, api, errorText } from "./ui";
export function CaseForm({
  hotels,
  initial,
  caseId,
  onSaved,
}: {
  hotels: Hotel[];
  initial?: CaseInput;
  caseId?: string;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CaseInput>({
    resolver: zodResolver(caseSchema),
    defaultValues: initial || {
      title: "",
      hotelId: "",
      category: "Ventile & Antriebe",
      urgency: "NORMAL",
      manufacturer: "",
      model: "",
      partNumber: "",
      serialNumber: "",
      systemYear: "",
      description: "",
      parameters: "",
    },
  });
  async function submit(data: CaseInput) {
    setError("");
    try {
      const result = await api<{ id: string }>(
        caseId ? `/api/cases/${caseId}` : "/api/cases",
        { method: caseId ? "PATCH" : "POST", body: JSON.stringify(data) },
      );
      if (onSaved) {
        onSaved();
        router.refresh();
      } else router.push(`/cases/${result.id}`);
    } catch (e) {
      setError(errorText(e));
    }
  }
  return (
    <form onSubmit={handleSubmit(submit)} className="case-form" noValidate>
      {error && <Notice text={error} error />}
      <div className="form-section">
        <h2>
          <Building2 size={19} /> Fall & Standort
        </h2>
        <div className="form-grid">
          <label className="field span-2">
            Bezeichnung des Suchfalls *
            <input
              {...register("title")}
              placeholder="z. B. Stellantrieb für Heizkreisverteiler"
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <span className="field-error">{errors.title.message}</span>
            )}
          </label>
          <label className="field">
            Hotel *
            <select {...register("hotelId")} aria-invalid={!!errors.hotelId}>
              <option value="">Hotel auswählen</option>
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} · {h.city}
                </option>
              ))}
            </select>
            {errors.hotelId && (
              <span className="field-error">{errors.hotelId.message}</span>
            )}
          </label>
          <label className="field">
            Kategorie *
            <select {...register("category")}>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Priorität *
            <select {...register("urgency")}>
              {Object.entries(urgencyLabels).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Baujahr der Anlage
            <input
              {...register("systemYear")}
              placeholder="z. B. 1998"
              inputMode="numeric"
            />
            {errors.systemYear && (
              <span className="field-error">{errors.systemYear.message}</span>
            )}
          </label>
        </div>
      </div>
      <div className="form-section">
        <h2>
          <ClipboardList size={19} /> Bauteil identifizieren
        </h2>
        <p className="muted form-hint">
          Unbekannte Angaben dürfen offenbleiben. Für die Suche wird später ein
          Modell oder eine Artikelnummer benötigt.
        </p>
        <div className="form-grid">
          {(
            [
              {
                name: "manufacturer",
                label: "Hersteller",
                placeholder: "z. B. Siemens",
              },
              {
                name: "model",
                label: "Modell / Typ",
                placeholder: "z. B. SQX32.00",
              },
              {
                name: "partNumber",
                label: "Artikelnummer",
                placeholder: "Laut Typenschild oder Dokumentation",
              },
              {
                name: "serialNumber",
                label: "Seriennummer",
                placeholder: "Optional",
              },
            ] as const
          ).map((f) => (
            <label className="field" key={f.name}>
              {f.label}
              <input {...register(f.name)} placeholder={f.placeholder} />
              {errors[f.name] && (
                <span className="field-error">{errors[f.name]?.message}</span>
              )}
            </label>
          ))}
          <label className="field span-2">
            Technische Parameter
            <textarea
              {...register("parameters")}
              rows={4}
              placeholder={
                "Versorgung: AC 230 V\nStellsignal: 3-Punkt\nHub: 20 mm"
              }
            />
            {errors.parameters && (
              <span className="field-error">{errors.parameters.message}</span>
            )}
            <small>
              Versorgung, Abmessungen, Anschlüsse, Leistung, Regelung und
              Sicherheitsfunktionen.
            </small>
          </label>
          <label className="field span-2">
            Ausgangslage & Hinweise
            <textarea
              {...register("description")}
              rows={4}
              placeholder="Was ist defekt? Welche Anlage ist betroffen? Welche Unterlagen oder Erfahrungen gibt es?"
            />
            {errors.description && (
              <span className="field-error">{errors.description.message}</span>
            )}
          </label>
        </div>
      </div>
      <div className="form-actions">
        <span className="muted">* Pflichtangaben · Daten bleiben lokal</span>
        <Button type="submit" busy={isSubmitting}>
          {caseId ? <Save size={16} /> : <ArrowRight size={17} />}
          {caseId ? "Änderungen speichern" : "Suchfall anlegen"}
        </Button>
      </div>
    </form>
  );
}
