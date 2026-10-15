import { z } from "zod";
import { categories } from "./labels";
const short = z.string().trim().max(200);
export const caseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Bitte mindestens 5 Zeichen eingeben.")
    .max(160),
  hotelId: z.string().min(1, "Bitte ein Hotel wählen."),
  category: z.enum(categories),
  urgency: z.enum(["NORMAL", "HIGH", "CRITICAL"]),
  manufacturer: short,
  model: short,
  serialNumber: short,
  partNumber: short,
  systemYear: z
    .string()
    .regex(/^$|^(19|20)\d{2}$/, "Bitte vierstellige Jahreszahl eingeben."),
  description: z.string().trim().max(5000),
  parameters: z.string().trim().max(4000),
});
export type CaseInput = z.infer<typeof caseSchema>;
export const reviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "TECHNICAL_REVIEW", "UNREVIEWED"]),
  note: z
    .string()
    .trim()
    .min(5, "Bitte die Entscheidung begründen (mindestens 5 Zeichen).")
    .max(2000),
  confirmed: z.literal(true, {
    error: "Bitte die menschliche Entscheidung bestätigen.",
  }),
});
export const benefitSchema = z.object({
  partCost: z.number().min(0).max(10000000),
  laborCost: z.number().min(0).max(10000000),
  replacementCost: z.number().min(0).max(100000000),
  downtimeDays: z.number().min(0).max(3650),
  dailyCost: z.number().min(0).max(10000000),
  extensionMonths: z.number().int().min(0).max(600),
  notes: z.string().trim().max(3000),
});
export type BenefitInput = z.infer<typeof benefitSchema>;
export function calculateBenefit(input: BenefitInput) {
  const repairCost = input.partCost + input.laborCost;
  return {
    repairCost,
    avoidedInvestment: input.replacementCost - repairCost,
    avoidedDowntime: input.downtimeDays * input.dailyCost,
    potentialBenefit:
      input.replacementCost - repairCost + input.downtimeDays * input.dailyCost,
  };
}
