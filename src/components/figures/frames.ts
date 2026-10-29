// A text figure in stages (Frames): each character has a place in every stage,
// as [x, y] in characters and lines, whether it shows there, and its colour.
// Morph builds these; Frames draws them and moves between stages.
export type Tone = "name" | "syn" | "val" | "head";
export interface Spot {
  x: number;
  y: number;
  show: boolean;
  tone: Tone;
}
export interface Cell {
  ch: string;
  bold?: boolean;
  at: Spot[];
}
export interface Tab {
  label: string;
  size: string;
}
