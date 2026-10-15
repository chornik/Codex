import { z, ZodError } from "zod";
import { caseSchema, reviewSchema, benefitSchema } from "../src/lib/validation";
import { extractFields } from "../src/lib/extraction";
import { contactText } from "../src/lib/contact";
import { getState, persist, addSearch, uid } from "./state";
import { putFile, getFile, browserFileType } from "./files";
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
export async function previewApi(
  pathname: string,
  init: RequestInit = {},
): Promise<Response> {
  try {
    const state = getState();
    const method = init.method || "GET";
    const parts = pathname.split("/").filter(Boolean);
    const data = typeof init.body === "string" ? JSON.parse(init.body) : {};
    if (pathname === "/api/cases" && method === "POST") {
      const fields = caseSchema.parse(data);
      const hotel = state.hotels.find((h) => h.id === fields.hotelId);
      if (!hotel) throw new Error("Hotel nicht gefunden.");
      const item = {
        ...fields,
        id: uid(),
        number: Math.max(1000, ...state.cases.map((c) => c.number)) + 1,
        status: "OPEN",
        hotel,
        createdAt: new Date(),
        updatedAt: new Date(),
        candidates: [],
        attachments: [],
        searches: [],
        drafts: [],
        benefit: null,
      };
      state.cases.unshift(item);
      persist();
      return json(item, 201);
    }
    if (
      parts[1] === "candidates" &&
      parts[3] === "review" &&
      method === "POST"
    ) {
      const input = reviewSchema.parse(data);
      const item = state.cases.find((c) =>
        c.candidates.some((hit) => hit.id === parts[2]),
      );
      const hit = item?.candidates.find((h) => h.id === parts[2]);
      if (!item || !hit) return json({ error: "Treffer nicht gefunden." }, 404);
      hit.reviewStatus = input.status;
      hit.reviewNote = input.note;
      hit.reviewedAt = new Date();
      if (input.status === "TECHNICAL_REVIEW") item.status = "REVIEW";
      item.updatedAt = new Date();
      persist();
      return json(hit);
    }
    const item = state.cases.find((c) => c.id === parts[2]);
    if (!item) return json({ error: "Suchfall nicht gefunden." }, 404);
    if (parts.length === 3 && method === "PATCH") {
      const input = caseSchema
        .partial()
        .extend({
          status: z
            .enum(["OPEN", "RESEARCHING", "REVIEW", "RESOLVED"])
            .optional(),
        })
        .parse(data);
      if (input.hotelId && !state.hotels.some((h) => h.id === input.hotelId))
        throw new Error("Hotel nicht gefunden.");
      Object.assign(item, input, { updatedAt: new Date() });
      item.hotel = state.hotels.find((h) => h.id === item.hotelId)!;
      persist();
      return json(item);
    }
    if (parts[3] === "search" && method === "POST") {
      const count = addSearch(item);
      item.updatedAt = new Date();
      persist();
      return json({ count, provider: "demo" });
    }
    if (parts[3] === "attachments" && method === "POST") {
      const file = init.body instanceof FormData ? init.body.get("file") : null;
      if (!(file instanceof File))
        throw new Error("Bitte eine Datei auswählen.");
      if (!file.size || file.size > 10 * 1024 * 1024)
        throw new Error("Maximal 10 MB pro Datei.");
      if (item.attachments.length >= 20)
        throw new Error("Maximal 20 Dateien pro Fall.");
      const bytes = new Uint8Array(await file.arrayBuffer());
      const mimeType = browserFileType(bytes, file.name);
      const id = uid();
      await putFile(id, new Blob([bytes], { type: mimeType }));
      const attachment = {
        id,
        caseId: item.id,
        storageName: id,
        originalName: file.name.split(/[\\/]/).pop()!.slice(0, 200),
        size: file.size,
        mimeType,
        extractedText: "",
        createdAt: new Date(),
      };
      item.attachments.unshift(attachment);
      persist();
      return json(attachment, 201);
    }
    if (parts[3] === "extract" && method === "POST") {
      const input = z
        .object({
          text: z.string().max(30000).optional(),
          attachmentId: z.string().optional(),
        })
        .parse(data);
      let text = input.text || "";
      if (input.attachmentId) {
        const attachment = item.attachments.find(
          (a) => a.id === input.attachmentId,
        );
        if (!attachment) throw new Error("Datei nicht gefunden.");
        if (attachment.mimeType !== "text/plain")
          throw new Error(
            "Foto-OCR und PDF-Textextraktion benötigen die vollständige Serverversion. In dieser HTML-Demo bitte TXT verwenden oder den Text in das Analysefeld einfügen.",
          );
        text = (await (await getFile(attachment.id)).text()).slice(0, 30000);
        attachment.extractedText = text;
        persist();
      }
      if (!text.trim())
        throw new Error("Bitte Text eingeben oder eine TXT-Datei auswählen.");
      return json({
        text,
        fields: extractFields(text),
        method: "Lokale Textanalyse im Browser",
      });
    }
    if (parts[3] === "benefit" && method === "PUT") {
      const values = benefitSchema.parse(data);
      item.benefit = {
        ...values,
        id: item.benefit?.id || uid(),
        caseId: item.id,
        updatedAt: new Date(),
      };
      persist();
      return json(item.benefit);
    }
    if (parts[3] === "drafts" && method === "POST") {
      const input = z
        .object({
          candidateId: z.string(),
          draftId: z.string().optional(),
          subject: z.string().trim().min(1).max(500).optional(),
          body: z.string().trim().min(1).max(15000).optional(),
        })
        .parse(data);
      const hit = item.candidates.find((c) => c.id === input.candidateId);
      if (!hit || hit.reviewStatus !== "APPROVED")
        return json(
          {
            error:
              "Bitte den Treffer zuerst mit Begründung für Kontakt freigeben.",
          },
          409,
        );
      if (input.draftId) {
        const draft = item.drafts.find(
          (d) => d.id === input.draftId && d.candidateId === hit.id,
        );
        if (!draft || !input.subject || !input.body)
          throw new Error("Entwurf oder Inhalt unvollständig.");
        Object.assign(draft, {
          subject: input.subject,
          body: input.body,
          updatedAt: new Date(),
        });
        persist();
        return json(draft);
      }
      const existing = item.drafts.find((d) => d.candidateId === hit.id);
      if (existing) return json(existing);
      const draft = {
        id: uid(),
        caseId: item.id,
        candidateId: hit.id,
        ...contactText(item, hit),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      item.drafts.unshift(draft);
      persist();
      return json(draft, 201);
    }
    return json(
      { error: "Diese Aktion ist in der Browserdemo nicht verfügbar." },
      400,
    );
  } catch (error) {
    return json(
      {
        error:
          error instanceof ZodError
            ? error.issues.map((i) => i.message).join(" ")
            : error instanceof Error
              ? error.message
              : "Aktion fehlgeschlagen.",
      },
      400,
    );
  }
}
