// Shared prop types for the diagram kit. Pages pass plain data; components draw it.

export interface LoopStep {
  /** Index into `code` to highlight, or -1 for none. */
  line: number;
  stack: string[];
  micro: string[];
  macro: string[];
  out: string[];
  note: string;
}

export interface ScopeNode {
  label: string;
  kind?: "global" | "function" | "block";
  vars?: string[];
  children?: ScopeNode[];
}

export interface Card {
  q: string;
  /** Plain text or simple HTML (inline <code> is the common case). */
  a: string;
}

export type FitLevel = "strong" | "partial" | "gap";
export interface FitRow {
  need: string;
  evidence: string;
  level: FitLevel;
}
