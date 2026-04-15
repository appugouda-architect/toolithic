export interface CalculationResult {
  id: string;
  query: string;
  breakdown: CalculationStep[];
  finalAnswer: string;
  formattedAnswer: string;
}

export interface CalculationStep {
  description: string;
  formula: string;
  values: Record<string, number>;
  result: number;
}

export type CalculationType =
  | "percentage"
  | "gst"
  | "tax"
  | "split"
  | "emi"
  | "interest"
  | "discount"
  | "profit_loss"
  | "simple";

export interface ParsedQuery {
  type: CalculationType;
  values: Record<string, number>;
  rawValues: Record<string, string>;
  remaining: string;
}