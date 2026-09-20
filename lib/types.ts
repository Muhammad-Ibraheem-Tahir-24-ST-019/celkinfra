export type Values = Record<string, string>;
export type Result = {
  status: "success" | "warning" | "unavailable";
  summary: string;
  rows?: Record<string, unknown>[];
  code?: string;
  notes?: string[];
  metrics?: { label: string; value: string }[];
  links?: string[];
  preview?: { title: string; url: string; description: string };
  source?: string;
  checkedAt?: string;
  measurementId?: string;
  pending?: boolean;
};
export type Field = {
  key: string;
  label: string;
  placeholder?: string;
  value?: string;
  type?: "textarea" | "number" | "select";
  options?: string[];
  help?: string;
};
